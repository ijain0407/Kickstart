/* ============================================================
   JUMPERS FOR GOALPOSTS — match engine
   Pure state. No React, no DOM, no canvas. `stepMatch` advances
   a plain object by dt seconds, so the whole match is testable
   and the renderer stays a dumb function of state.

   Units are "field units", not pixels: the pitch is 150 wide by
   100 tall (landscape, as a match is watched). Home defends the
   left goal and attacks to the right.
   ============================================================ */

export const FIELD = {
  W: 150,
  H: 100,
  GOAL_Y0: 36,
  GOAL_Y1: 64,
  BOX_Y0: 26,
  BOX_Y1: 74,
  BOX_D: 26,
}

const PLAYER_R = 3.4
const BALL_R = 1.7
const CONTROL_R = PLAYER_R + BALL_R + 1.4
const GK_CONTROL_R = 9
const TURNOVER_IMMUNITY = 0.8
const GK_HOLD = 0.4

const USER_SPEED = 26.5
const BALL_FRICTION = 0.55 // velocity retained per second
const KICK_COOLDOWN = 0.28

export const MATCH_SECONDS = 90

export const DIFFICULTY = {
  casual: { aiSpeed: 21, aiReaction: 0.55, aiShootRange: 30, tackleChance: 0.4, label: 'casual' },
  competitive: { aiSpeed: 25, aiReaction: 0.26, aiShootRange: 40, tackleChance: 0.62, label: 'competitive' },
}

/* Kickoff shapes. `home` is the player's side and attacks rightward
   (toward x = W); `away` mirrors it. */
const HOME_SPOTS = [
  { role: 'GK', num: 1, x: 7, y: 50 },
  { role: 'DF', num: 4, x: 32, y: 50 },
  { role: 'MF', num: 8, x: 50, y: 33 },
  { role: 'FW', num: 9, x: 62, y: 63 },
]

const AWAY_SPOTS = HOME_SPOTS.map((s) => ({ ...s, x: FIELD.W - s.x, y: FIELD.H - s.y }))

/* ---------- small vector helpers ---------- */

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by)

function norm(x, y) {
  const m = Math.hypot(x, y)
  return m < 1e-6 ? { x: 0, y: 0 } : { x: x / m, y: y / m }
}

/** Goal mouth the given team is attacking. */
function targetGoal(team) {
  return { x: team === 'home' ? FIELD.W : 0, y: 50 }
}

/** Goal mouth the given team defends. */
function ownGoal(team) {
  return { x: team === 'home' ? 0 : FIELD.W, y: 50 }
}

/* ============================================================
   Construction
   ============================================================ */

function makePlayers() {
  const players = []
  HOME_SPOTS.forEach((s, i) => {
    players.push({
      id: `h${i}`,
      team: 'home',
      role: s.role,
      num: s.num,
      x: s.x,
      y: s.y,
      bx: s.x,
      by: s.y,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: -1,
      cooldown: 0,
      immunity: 0,
      hold: 0,
    })
  })
  AWAY_SPOTS.forEach((s, i) => {
    players.push({
      id: `a${i}`,
      team: 'away',
      role: s.role,
      num: s.num,
      x: s.x,
      y: s.y,
      bx: s.x,
      by: s.y,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 1,
      cooldown: 0,
      immunity: 0,
      hold: 0,
      think: 0,
    })
  })
  return players
}

export function createMatch(difficulty = 'casual') {
  return {
    phase: 'ready', // ready | kickoff | playing | ended
    clock: MATCH_SECONDS,
    kickoffTimer: 0,
    difficulty,
    score: { home: 0, away: 0 },
    players: makePlayers(),
    ball: { x: FIELD.W / 2, y: FIELD.H / 2, vx: 0, vy: 0 },
    carrier: null, // player id
    kickLock: 0,
    controlled: 'h3', // the shirt the user is steering
    charge: 0,
    events: [], // drained by the UI each frame
    stats: {
      possHome: 0,
      possAway: 0,
      passes: 0,
      passesCompleted: 0,
      shots: 0,
      onTarget: 0,
      tacklesWon: 0,
      lastPasser: null,
    },
  }
}

function emit(state, type, payload) {
  state.events.push({ type, ...payload })
}

/** Put everyone back on their marks and hand the ball to `team`. */
function resetPositions(state, team) {
  for (const p of state.players) {
    p.x = p.bx
    p.y = p.by
    p.vx = 0
    p.vy = 0
  }
  state.ball.x = FIELD.W / 2
  state.ball.y = FIELD.H / 2
  state.ball.vx = 0
  state.ball.vy = 0
  state.carrier = null
  state.kickLock = 0
  state.charge = 0
  state.kickoffTimer = 0.9
  state.phase = 'kickoff'
  state.kickoffFor = team
}

/* ============================================================
   Actions
   ============================================================ */

function playerById(state, id) {
  return state.players.find((p) => p.id === id) ?? null
}

function teammates(state, team, exceptId) {
  return state.players.filter((p) => p.team === team && p.id !== exceptId && p.role !== 'GK')
}

/**
 * Score every teammate on how far forward they are and how exposed
 * the passing lane is, then pick the best. Returns null if nobody is
 * worth the risk.
 */
function bestPassTarget(state, passer) {
  const goal = targetGoal(passer.team)
  const mates = teammates(state, passer.team, passer.id)
  let best = null
  let bestScore = -Infinity

  for (const m of mates) {
    const d = dist(passer.x, passer.y, m.x, m.y)
    if (d < 8 || d > 70) continue

    // Forward progress this pass would buy.
    const gain = dist(passer.x, passer.y, goal.x, goal.y) - dist(m.x, m.y, goal.x, goal.y)

    // How close the nearest opponent sits to the straight lane.
    let laneRisk = 0
    for (const o of state.players) {
      if (o.team === passer.team) continue
      const t = clamp(
        ((o.x - passer.x) * (m.x - passer.x) + (o.y - passer.y) * (m.y - passer.y)) / (d * d),
        0,
        1,
      )
      const lx = passer.x + (m.x - passer.x) * t
      const ly = passer.y + (m.y - passer.y) * t
      const gap = dist(o.x, o.y, lx, ly)
      if (gap < 9) laneRisk += (9 - gap) * 2.5
    }

    const score = gain * 1.6 - laneRisk - d * 0.15
    if (score > bestScore) {
      bestScore = score
      best = m
    }
  }
  return best
}

function kick(state, player, dirX, dirY, power) {
  const d = norm(dirX, dirY)
  state.ball.vx = d.x * power
  state.ball.vy = d.y * power
  state.carrier = null
  state.kickLock = KICK_COOLDOWN
  player.cooldown = 0.18
}

function doPass(state, player) {
  const target = bestPassTarget(state, player)
  state.stats.passes += 1
  state.stats.lastPasser = player.id

  if (!target) {
    // Nothing on — clear it upfield rather than dwelling on the ball.
    const goal = targetGoal(player.team)
    kick(state, player, goal.x - player.x, goal.y - player.y, 52)
    emit(state, 'clearance', { team: player.team })
    return
  }

  const d = dist(player.x, player.y, target.x, target.y)
  kick(state, player, target.x - player.x, target.y - player.y, clamp(d * 1.5 + 16, 28, 74))
  emit(state, 'pass', { team: player.team, long: d > 40 })
}

function doShot(state, player, charge) {
  const goal = targetGoal(player.team)
  const d = dist(player.x, player.y, goal.x, goal.y)

  // Pick the corner the keeper has vacated rather than the middle.
  const gk = state.players.find((p) => p.team !== player.team && p.role === 'GK')
  const near = FIELD.GOAL_Y0 + 3.5
  const far = FIELD.GOAL_Y1 - 3.5
  const aimBase = gk ? (gk.y > 50 ? near : far) : 50

  // Long range and tight angles scatter the shot; a full charge helps.
  const angleOff = Math.abs(player.y - 50) / 50
  const spread = (d / FIELD.W) * 12 + angleOff * 8 - charge * 4
  const aimY = aimBase + (Math.random() - 0.5) * Math.max(0, spread) * 2

  state.stats.shots += 1
  kick(state, player, goal.x - player.x, aimY - player.y, 68 + charge * 30)
  emit(state, 'shot', { team: player.team, long: d > 60 })
}

/* ============================================================
   AI
   ============================================================ */

function keeperTarget(state, p) {
  const line = p.team === 'home' ? 4.5 : FIELD.W - 4.5
  // Track the ball across the mouth, but never stray off the line.
  return { x: line, y: clamp(state.ball.y, FIELD.GOAL_Y0, FIELD.GOAL_Y1) }
}

function aiTarget(state, p, cfg) {
  if (p.role === 'GK') return keeperTarget(state, p)

  const ball = state.ball
  const carrier = state.carrier ? playerById(state, state.carrier) : null
  const weHaveIt = carrier?.team === p.team
  const goal = targetGoal(p.team)

  if (carrier && carrier.id === p.id) {
    return { x: goal.x, y: goal.y } // handled by the carrier branch
  }

  if (weHaveIt) {
    // Break forward and stay away from the carrier so lanes open up.
    const push = p.team === 'home' ? 26 : -26
    const spread = p.y < 50 ? -10 : 10
    return {
      x: clamp(p.bx + push, 12, FIELD.W - 12),
      y: clamp(p.by + spread, 10, FIELD.H - 10),
    }
  }

  // Out of possession: the closest outfielder presses, the rest hold shape.
  const mates = state.players.filter((m) => m.team === p.team && m.role !== 'GK')
  const closest = mates.reduce((a, m) =>
    dist(m.x, m.y, ball.x, ball.y) < dist(a.x, a.y, ball.x, ball.y) ? m : a,
  )

  if (closest.id === p.id) return { x: ball.x, y: ball.y }

  const drop = p.team === 'home' ? -10 : 10
  return {
    x: clamp(p.bx + drop, 8, FIELD.W - 8),
    y: clamp(p.by + (ball.y - 50) * 0.35, 8, FIELD.H - 8),
  }
}

function aiCarrier(state, p, cfg, dt) {
  const goal = targetGoal(p.team)
  const d = dist(p.x, p.y, goal.x, goal.y)

  p.think -= dt
  if (p.think > 0) return { x: goal.x, y: goal.y }
  p.think = cfg.aiReaction

  // How hard is this player being pressed right now?
  let pressure = 0
  for (const o of state.players) {
    if (o.team === p.team) continue
    if (dist(o.x, o.y, p.x, p.y) < 11) pressure += 1
  }

  if (d < cfg.aiShootRange && Math.abs(p.y - 50) < 24 && Math.random() < 0.3) {
    doShot(state, p, 0.5)
    return null
  }

  if (pressure > 0 && Math.random() < 0.7) {
    doPass(state, p)
    return null
  }

  return { x: goal.x, y: goal.y }
}

/* ============================================================
   Step
   ============================================================ */

export function stepMatch(state, dt, input) {
  if (state.phase === 'ended' || state.phase === 'ready') return state

  const cfg = DIFFICULTY[state.difficulty] ?? DIFFICULTY.casual

  if (state.phase === 'kickoff') {
    state.kickoffTimer -= dt
    if (state.kickoffTimer <= 0) state.phase = 'playing'
    return state
  }

  state.clock = Math.max(0, state.clock - dt)
  if (state.kickLock > 0) state.kickLock -= dt

  const carrier = state.carrier ? playerById(state, state.carrier) : null

  /* ---- the shirt the user is steering ---- */
  let user = playerById(state, state.controlled)
  const outfield = state.players.filter((p) => p.team === 'home' && p.role !== 'GK')
  if (!user || user.team !== 'home' || user.role === 'GK') {
    user = outfield[0]
    state.controlled = user.id
  }

  // Auto-switch to whoever is meaningfully closer to the ball, unless
  // the user already has it at their feet.
  if (!carrier || carrier.team !== 'home') {
    const nearest = outfield.reduce((a, p) =>
      dist(p.x, p.y, state.ball.x, state.ball.y) < dist(a.x, a.y, state.ball.x, state.ball.y) ? p : a,
    )
    const userD = dist(user.x, user.y, state.ball.x, state.ball.y)
    const nearD = dist(nearest.x, nearest.y, state.ball.x, state.ball.y)
    if (nearest.id !== user.id && nearD < userD - 9) {
      state.controlled = nearest.id
      user = nearest
    }
  } else if (carrier.team === 'home' && carrier.role !== 'GK') {
    state.controlled = carrier.id
    user = carrier
  }

  /* ---- movement targets ---- */
  for (const p of state.players) {
    if (p.cooldown > 0) p.cooldown -= dt
    if (p.immunity > 0) p.immunity -= dt

    let speed = p.team === 'home' && p.id === state.controlled ? USER_SPEED : cfg.aiSpeed
    if (p.role === 'GK') speed = cfg.aiSpeed * 0.95

    let tx = null
    let ty = null

    if (p.id === state.controlled) {
      const dir = norm(input.dx, input.dy)
      if (dir.x || dir.y) {
        p.fx = dir.x
        p.fy = dir.y
      }
      p.vx = dir.x * speed
      p.vy = dir.y * speed
    } else if (carrier && carrier.id === p.id && p.role === 'GK') {
      p.hold -= dt
      if (p.hold <= 0) {
        const goal = targetGoal(p.team)
        const wing = p.y < 50 ? 26 : 74
        kick(state, p, goal.x - p.x, wing - p.y, 60)
        emit(state, 'save', { team: p.team })
      }
      const t = keeperTarget(state, p)
      tx = t.x
      ty = t.y
    } else if (carrier && carrier.id === p.id) {
      const t = aiCarrier(state, p, cfg, dt)
      if (t) {
        tx = t.x
        ty = t.y
      }
    } else {
      const t = aiTarget(state, p, cfg)
      tx = t.x
      ty = t.y
    }

    if (tx !== null) {
      const d = norm(tx - p.x, ty - p.y)
      const close = dist(p.x, p.y, tx, ty)
      const s = close < 2 ? 0 : speed
      p.vx = d.x * s
      p.vy = d.y * s
      if (d.x || d.y) {
        p.fx = d.x
        p.fy = d.y
      }
    }

    p.x = clamp(p.x + p.vx * dt, PLAYER_R, FIELD.W - PLAYER_R)
    p.y = clamp(p.y + p.vy * dt, PLAYER_R, FIELD.H - PLAYER_R)
  }

  /* ---- keep bodies out of each other ---- */
  for (let i = 0; i < state.players.length; i++) {
    for (let j = i + 1; j < state.players.length; j++) {
      const a = state.players[i]
      const b = state.players[j]
      const d = dist(a.x, a.y, b.x, b.y)
      const min = PLAYER_R * 2
      if (d > 0 && d < min) {
        const push = (min - d) / 2
        const n = norm(b.x - a.x, b.y - a.y)
        a.x = clamp(a.x - n.x * push, PLAYER_R, FIELD.W - PLAYER_R)
        a.y = clamp(a.y - n.y * push, PLAYER_R, FIELD.H - PLAYER_R)
        b.x = clamp(b.x + n.x * push, PLAYER_R, FIELD.W - PLAYER_R)
        b.y = clamp(b.y + n.y * push, PLAYER_R, FIELD.H - PLAYER_R)
      }
    }
  }

  /* ---- possession ---- */
  {
    let claimant = null
    let bestScore = Infinity
    for (const p of state.players) {
      if (p.cooldown > 0) continue
      // Outfielders wait out the full kick lock; a keeper reacts sooner,
      // otherwise a struck shot is past them before they may move.
      if (p.role === 'GK') {
        if (state.kickLock > KICK_COOLDOWN - 0.08) continue
      } else if (state.kickLock > 0) {
        continue
      }
      let reach = CONTROL_R
      if (p.role === 'GK') {
        const speed = Math.hypot(state.ball.vx, state.ball.vy)
        reach = GK_CONTROL_R * (1 - Math.min(0.4, speed / 200))
      }
      const d = dist(p.x, p.y, state.ball.x, state.ball.y)
      if (d < reach && d < bestScore) {
        bestScore = d
        claimant = p
      }
    }

    if (claimant && claimant.id !== state.carrier) {
      const prev = state.carrier ? playerById(state, state.carrier) : null

      if (prev && prev.team !== claimant.team) {
        // A tackle only lands some of the time, and a player who has just
        // won the ball gets a moment on it before anyone can dive back in.
        const odds = claimant.team === 'home' ? 0.6 : cfg.tackleChance
        if (prev.immunity <= 0 && Math.random() < odds) {
          state.carrier = claimant.id
          claimant.immunity = TURNOVER_IMMUNITY
          if (claimant.team === 'home') state.stats.tacklesWon += 1
          emit(state, 'tackle', { team: claimant.team })
        }
      } else {
        // Completing a pass means the intended side actually received it.
        if (!prev && state.stats.lastPasser) {
          const passer = playerById(state, state.stats.lastPasser)
          if (passer && passer.team === claimant.team) {
            state.stats.passesCompleted += 1
            emit(state, 'received', { team: claimant.team })
          }
          state.stats.lastPasser = null
        }
        state.carrier = claimant.id
        if (claimant.role === 'GK') claimant.hold = GK_HOLD
      }
    }
  }

  const holder = state.carrier ? playerById(state, state.carrier) : null

  /* ---- ball ---- */
  if (holder) {
    // Dribbling: the ball sits just ahead of the carrier's feet.
    const f = norm(holder.fx, holder.fy)
    state.ball.x = clamp(holder.x + f.x * (PLAYER_R + 1.6), BALL_R, FIELD.W - BALL_R)
    state.ball.y = clamp(holder.y + f.y * (PLAYER_R + 1.6), BALL_R, FIELD.H - BALL_R)
    state.ball.vx = holder.vx
    state.ball.vy = holder.vy

    if (holder.team === 'home') state.stats.possHome += dt
    else state.stats.possAway += dt
  } else {
    const decay = Math.pow(BALL_FRICTION, dt)
    state.ball.vx *= decay
    state.ball.vy *= decay
    state.ball.x += state.ball.vx * dt
    state.ball.y += state.ball.vy * dt

    // Touchlines are top and bottom now; the goal lines are below.
    if (state.ball.y < BALL_R) {
      state.ball.y = BALL_R
      state.ball.vy = Math.abs(state.ball.vy) * 0.6
    }
    if (state.ball.y > FIELD.H - BALL_R) {
      state.ball.y = FIELD.H - BALL_R
      state.ball.vy = -Math.abs(state.ball.vy) * 0.6
    }
  }

  /* ---- goals and goal lines ---- */
  const inMouth = state.ball.y > FIELD.GOAL_Y0 && state.ball.y < FIELD.GOAL_Y1

  if (state.ball.x >= FIELD.W - BALL_R) {
    // The right-hand goal is the one home attacks.
    if (inMouth) {
      state.score.home += 1
      state.stats.onTarget += 1
      emit(state, 'goal', { team: 'home' })
      resetPositions(state, 'away')
    } else {
      state.ball.x = FIELD.W - BALL_R
      state.ball.vx = -Math.abs(state.ball.vx) * 0.5
      emit(state, 'wide', { team: 'home' })
    }
  } else if (state.ball.x <= BALL_R) {
    if (inMouth) {
      state.score.away += 1
      emit(state, 'goal', { team: 'away' })
      resetPositions(state, 'home')
    } else {
      state.ball.x = BALL_R
      state.ball.vx = Math.abs(state.ball.vx) * 0.5
      emit(state, 'wide', { team: 'away' })
    }
  }

  if (state.clock <= 0 && state.phase === 'playing') {
    state.phase = 'ended'
    emit(state, 'fulltime', {})
  }

  return state
}

/* ============================================================
   Commands from the UI
   ============================================================ */

export function userPass(state) {
  const p = playerById(state, state.controlled)
  if (!p || state.carrier !== p.id) return
  doPass(state, p)
}

export function userShoot(state, charge) {
  const p = playerById(state, state.controlled)
  if (!p || state.carrier !== p.id) return
  doShot(state, p, clamp(charge, 0, 1))
}

export function kickOff(state) {
  resetPositions(state, 'home')
  state.phase = 'kickoff'
}

export function possessionPercent(state) {
  const total = state.stats.possHome + state.stats.possAway
  if (total < 0.5) return 50
  return Math.round((state.stats.possHome / total) * 100)
}
