import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import {
  createMatch,
  stepMatch,
  userPass,
  userShoot,
  kickOff,
  possessionPercent,
  MATCH_SECONDS,
  DIFFICULTY,
} from '../game/engine.js'
import { drawMatch } from '../game/render.js'
import { FIELD } from '../game/engine.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

const STEP = 1 / 60
const MAX_FRAME = 0.25

/* Coach's Eye: an engine event becomes a named tactical idea, which is
   what makes this a teaching app's game rather than a generic kickabout. */
const COACH = {
  goal_home: { key: 'coach.goalHome', tone: 'good', icon: 'sports_soccer' },
  goal_away: { key: 'coach.goalAway', tone: 'bad', icon: 'warning' },
  pass_home: { key: 'coach.pass', tone: 'info', icon: 'share' },
  longpass_home: { key: 'coach.longPass', tone: 'info', icon: 'open_in_full' },
  received_home: { key: 'coach.received', tone: 'good', icon: 'hub' },
  tackle_home: { key: 'coach.tackleWon', tone: 'good', icon: 'shield' },
  tackle_away: { key: 'coach.tackleLost', tone: 'bad', icon: 'sprint' },
  shot_home: { key: 'coach.shot', tone: 'info', icon: 'bolt' },
  wide_home: { key: 'coach.wide', tone: 'bad', icon: 'flag' },
  clearance_home: { key: 'coach.clearance', tone: 'info', icon: 'north' },
}

function eventKey(ev) {
  if (ev.type === 'goal') return `goal_${ev.team}`
  if (ev.type === 'pass') return ev.long ? `longpass_${ev.team}` : `pass_${ev.team}`
  if (ev.type === 'received') return `received_${ev.team}`
  if (ev.type === 'tackle') return `tackle_${ev.team}`
  if (ev.type === 'shot') return `shot_${ev.team}`
  if (ev.type === 'wide') return `wide_${ev.team}`
  if (ev.type === 'clearance') return `clearance_${ev.team}`
  return null
}

const fmtClock = (s) => {
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function Play() {
  const { t, tr } = useI18n()
  const { navigate } = useRouter()
  const { addXp, celebrate } = useApp()

  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const frameRef = useRef(null)
  const matchRef = useRef(null)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const accRef = useRef(0)

  // Live input, kept in a ref so the loop never causes a re-render.
  const inputRef = useRef({ dx: 0, dy: 0 })
  const chargeRef = useRef(0)
  const chargingRef = useRef(false)
  const keysRef = useRef(new Set())

  const [difficulty, setDifficulty] = useState('casual')
  const [screen, setScreen] = useState('intro') // intro | live | report
  // Mirrored slice of the match for the HUD, refreshed ~10x a second.
  const [hud, setHud] = useState({ home: 0, away: 0, clock: MATCH_SECONDS, poss: 50, charge: 0 })
  const [feed, setFeed] = useState([])
  const [report, setReport] = useState(null)
  const feedId = useRef(0)

  /* ---------- canvas sizing ---------- */
  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    // Fit the pitch into the available box and make the canvas exactly
    // that size, so no part of the frame is ever dead space.
    const scale = Math.min(wrap.clientWidth / FIELD.W, wrap.clientHeight / FIELD.H)
    const w = Math.max(80, Math.floor(FIELD.W * scale))
    const h = Math.max(120, Math.floor(FIELD.H * scale))
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    if (frameRef.current) {
      frameRef.current.style.width = `${w}px`
      frameRef.current.style.height = `${h}px`
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [])

  useEffect(() => {
    if (screen !== 'live') return undefined
    resize()
    const ro = new ResizeObserver(resize)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [screen, resize])

  /* ---------- keyboard ---------- */
  useEffect(() => {
    if (screen !== 'live') return undefined

    const apply = () => {
      const k = keysRef.current
      let dx = 0
      let dy = 0
      if (k.has('ArrowLeft') || k.has('KeyA')) dx -= 1
      if (k.has('ArrowRight') || k.has('KeyD')) dx += 1
      if (k.has('ArrowUp') || k.has('KeyW')) dy -= 1
      if (k.has('ArrowDown') || k.has('KeyS')) dy += 1
      inputRef.current = { dx, dy }
    }

    const down = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault()
      }
      if (e.repeat) return
      if (e.code === 'Space') {
        chargingRef.current = true
        return
      }
      if (e.code === 'KeyJ' || e.code === 'ShiftLeft' || e.code === 'Enter') {
        if (matchRef.current) userPass(matchRef.current)
        return
      }
      keysRef.current.add(e.code)
      apply()
    }

    const up = (e) => {
      if (e.code === 'Space') {
        if (matchRef.current && chargingRef.current) userShoot(matchRef.current, chargeRef.current)
        chargingRef.current = false
        chargeRef.current = 0
        return
      }
      keysRef.current.delete(e.code)
      apply()
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      keysRef.current.clear()
    }
  }, [screen])

  /* ---------- finish ---------- */
  const finish = useCallback(
    (m) => {
      const goals = m.score.home
      const win = m.score.home > m.score.away
      const draw = m.score.home === m.score.away
      const xp = 30 + goals * 20 + (win ? 40 : draw ? 15 : 0)

      setReport({
        score: { ...m.score },
        poss: possessionPercent(m),
        stats: { ...m.stats },
        result: win ? 'win' : draw ? 'draw' : 'loss',
        xp,
      })
      setScreen('report')
      addXp(xp)
      celebrate({
        title: t(win ? 'play.win' : draw ? 'play.draw' : 'play.loss'),
        sub: `${m.score.home} – ${m.score.away}`,
        xp,
        icon: win ? 'emoji_events' : 'sports_soccer',
      })
    },
    [addXp, celebrate, t],
  )

  /* ---------- the loop ---------- */
  useEffect(() => {
    if (screen !== 'live') return undefined

    let hudTick = 0

    const frame = (now) => {
      rafRef.current = requestAnimationFrame(frame)
      const m = matchRef.current
      if (!m) return

      const dt = Math.min((now - lastRef.current) / 1000 || 0, MAX_FRAME)
      lastRef.current = now
      accRef.current += dt

      // Charge builds while the shoot button is held.
      if (chargingRef.current) chargeRef.current = Math.min(1, chargeRef.current + dt * 1.5)

      while (accRef.current >= STEP) {
        stepMatch(m, STEP, inputRef.current)
        accRef.current -= STEP
      }

      // Drain engine events into the Coach's Eye feed.
      if (m.events.length) {
        const fresh = []
        for (const ev of m.events) {
          const key = eventKey(ev)
          if (key && COACH[key]) fresh.push({ id: ++feedId.current, ...COACH[key] })
        }
        m.events.length = 0
        if (fresh.length) setFeed((prev) => [...fresh.reverse(), ...prev].slice(0, 3))
      }

      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        drawMatch(ctx, m, {
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          charge: chargeRef.current,
        })
      }

      hudTick += dt
      if (hudTick > 0.1) {
        hudTick = 0
        setHud({
          home: m.score.home,
          away: m.score.away,
          clock: m.clock,
          poss: possessionPercent(m),
          charge: chargeRef.current,
        })
      }

      if (m.phase === 'ended') {
        cancelAnimationFrame(rafRef.current)
        finish(m)
      }
    }

    lastRef.current = performance.now()
    accRef.current = 0
    rafRef.current = requestAnimationFrame(frame)

    const onHide = () => {
      // Coming back from a background tab must not fast-forward the match.
      lastRef.current = performance.now()
      accRef.current = 0
    }
    document.addEventListener('visibilitychange', onHide)

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [screen, finish])

  /* ---------- touch stick ---------- */
  const stickRef = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const stickMove = (e) => {
    const el = stickRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    let dx = e.clientX - cx
    let dy = e.clientY - cy
    const max = r.width / 2
    const m = Math.hypot(dx, dy)
    if (m > max) {
      dx = (dx / m) * max
      dy = (dy / m) * max
    }
    setKnob({ x: dx, y: dy })
    inputRef.current = { dx: dx / max, dy: dy / max }
  }

  const stickEnd = () => {
    setKnob({ x: 0, y: 0 })
    inputRef.current = { dx: 0, dy: 0 }
  }

  /* ---------- immersive while playing ---------- */
  useEffect(() => {
    if (screen !== 'live') return undefined
    document.body.classList.add('game-live')
    return () => document.body.classList.remove('game-live')
  }, [screen])

  /* ---------- fullscreen ---------- */
  const shellRef = useRef(null)
  const [isFull, setIsFull] = useState(false)
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 760)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }
      await shellRef.current?.requestFullscreen()
      // Android allows locking orientation inside fullscreen; desktop and
      // iOS reject it, which is fine — the layout copes either way.
      try {
        await screen.orientation?.lock?.('landscape')
      } catch {
        /* orientation lock unavailable */
      }
    } catch {
      /* fullscreen refused — the inline layout still works */
    }
  }

  const start = () => {
    const m = createMatch(difficulty)
    kickOff(m)
    matchRef.current = m
    setFeed([])
    setHud({ home: 0, away: 0, clock: MATCH_SECONDS, poss: 50, charge: 0 })
    setScreen('live')
  }

  /* ============================================================
     INTRO
     ============================================================ */
  if (screen === 'intro') {
    return (
      <div className="page">
        <section className="play-hero">
          <div className="play-hero__turf" aria-hidden="true" />
          <div className="play-hero__inner">
            <span className="pill pill--ghost">
              <Icon name="sports_soccer" fill />
              {t('play.kicker')}
            </span>
            <h1 className="t-headline-xl">{t('play.title')}</h1>
            <p className="hero__sub">{t('play.blurb')}</p>
          </div>
        </section>

        <section className="card card--pad stack stack-4">
          <h2 className="t-headline-sm">{t('play.chooseLevel')}</h2>
          <div className="chip-row">
            {Object.keys(DIFFICULTY).map((key) => (
              <button
                key={key}
                type="button"
                className={`chip ${difficulty === key ? 'is-active' : ''}`.trim()}
                aria-pressed={difficulty === key}
                onClick={() => setDifficulty(key)}
              >
                {t(`play.level.${key}`)}
              </button>
            ))}
          </div>
          <p className="t-body-md text-secondary">{t(`play.levelHint.${difficulty}`)}</p>
        </section>

        <section className="card card--pad stack stack-3">
          <h2 className="t-headline-sm">{t('play.howTo')}</h2>
          {[
            { icon: 'gamepad', k: 'move' },
            { icon: 'share', k: 'pass' },
            { icon: 'bolt', k: 'shoot' },
            { icon: 'swap_horiz', k: 'switch' },
          ].map((row) => (
            <div className="duties__item" key={row.k}>
              <Icon name={row.icon} fill />
              <span>
                <strong>{t(`play.controls.${row.k}.label`)}</strong> — {t(`play.controls.${row.k}.desc`)}
              </span>
            </div>
          ))}
        </section>

        <FieldPressButton variant="primary" block iconAfter="play_arrow" onClick={start}>
          {t('play.kickOff')}
        </FieldPressButton>

        <FieldPressButton variant="soft" block icon="school" onClick={() => navigate('/field')}>
          {t('play.studyFirst')}
        </FieldPressButton>
      </div>
    )
  }

  /* ============================================================
     REPORT
     ============================================================ */
  if (screen === 'report' && report) {
    const acc = report.stats.passes
      ? Math.round((report.stats.passesCompleted / report.stats.passes) * 100)
      : 0

    const rows = [
      { k: 'possession', v: `${report.poss}%` },
      { k: 'shots', v: report.stats.shots },
      { k: 'passes', v: `${report.stats.passesCompleted}/${report.stats.passes}` },
      { k: 'accuracy', v: `${acc}%` },
      { k: 'tackles', v: report.stats.tacklesWon },
    ]

    // The report closes the loop back to whichever lesson the numbers implicate.
    const advice =
      acc < 50 && report.stats.passes > 3
        ? { k: 'passing', to: '/lesson?id=1.3' }
        : report.stats.shots < 3
          ? { k: 'shooting', to: '/lesson?id=1.4' }
          : report.poss < 45
            ? { k: 'possession', to: '/lesson?id=1.3' }
            : { k: 'offside', to: '/lesson?id=1.2' }

    return (
      <div className="page">
        <section className={`play-result play-result--${report.result}`}>
          <span className="t-label-meta">{t('play.fullTime')}</span>
          <div className="play-result__score t-num">
            {report.score.home} – {report.score.away}
          </div>
          <h1 className="t-headline-md">{t(`play.${report.result}`)}</h1>
          <span className="pill pill--gold">
            <Icon name="bolt" fill />+{report.xp} XP
          </span>
        </section>

        <section className="card stack">
          {rows.map((row) => (
            <div className="result-row" key={row.k}>
              <span className="grow t-body-lg">{t(`play.stats.${row.k}`)}</span>
              <span className="result-row__pct t-num">{row.v}</span>
            </div>
          ))}
        </section>

        <section className="inset-lavender">
          <span className="tile tile--greensolid tile--circle">
            <Icon name="insights" fill />
          </span>
          <div className="stack stack-2">
            <span className="t-headline-sm">{t('play.coachSays')}</span>
            <span className="t-body-md">{t(`play.advice.${advice.k}`)}</span>
          </div>
        </section>

        <FieldPressButton variant="primary" block icon="replay" onClick={start}>
          {t('play.again')}
        </FieldPressButton>

        <FieldPressButton
          variant="soft"
          block
          icon="menu_book"
          onClick={() => navigate(advice.to)}
        >
          {t('play.brushUp')}
        </FieldPressButton>

        <FieldPressButton variant="secondary" block icon="close" onClick={() => setScreen('intro')}>
          {t('common.back')}
        </FieldPressButton>
      </div>
    )
  }

  /* ============================================================
     LIVE
     ============================================================ */
  return (
    <div className={`play-shell ${isFull ? 'is-full' : ''}`.trim()} ref={shellRef}>
      {/* Compact HUD so the pitch keeps as much room as possible */}
      <div className="hud">
        <span className="hud__team">
          <span className="hud__dot hud__dot--home" />
          <span className="t-label-meta">{t('play.you')}</span>
        </span>

        <span className="hud__score t-num">
          {hud.home} <span className="hud__sep">–</span> {hud.away}
        </span>

        <span className="hud__team hud__team--end">
          <span className="t-label-meta">{t('play.rivals')}</span>
          <span className="hud__dot hud__dot--away" />
        </span>

        <span className="hud__clock t-num">{fmtClock(hud.clock)}</span>

        <span className="hud__possess" aria-label={t('play.stats.possession')}>
          <span className="hud__poss">
            <span className="hud__poss-fill" style={{ width: `${hud.poss}%` }} />
          </span>
          <span className="hud__poss-num t-num">{hud.poss}%</span>
        </span>

        <span className="hud__actions">
          <button
            type="button"
            className="hud__btn"
            onClick={toggleFullscreen}
            aria-label={t(isFull ? 'play.exitFullscreen' : 'play.fullscreen')}
          >
            <Icon name={isFull ? 'fullscreen_exit' : 'fullscreen'} />
          </button>

          <button
            type="button"
            className="hud__btn"
            onClick={async () => {
              if (document.fullscreenElement) {
                try {
                  await document.exitFullscreen()
                } catch {
                  /* already out */
                }
              }
              setScreen('intro')
            }}
            aria-label={t('play.quit')}
          >
            <Icon name="close" />
          </button>
        </span>
      </div>

      {/* Pitch, with the controls floating over it */}
      <div className="play-stage" ref={wrapRef}>
       <div className="play-frame" ref={frameRef}>
        <canvas ref={canvasRef} className="play-canvas" aria-label={t('play.canvasLabel')} />

        <ul className="coach-feed" aria-live="polite">
          {feed.map((item) => (
            <li className={`coach-chip coach-chip--${item.tone}`} key={item.id}>
              <Icon name={item.icon} fill />
              {t(item.key)}
            </li>
          ))}
        </ul>

        <div className="pad">
          <div
            className="pad__stick"
            ref={stickRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              stickMove(e)
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) stickMove(e)
            }}
            onPointerUp={stickEnd}
            onPointerCancel={stickEnd}
            role="application"
            aria-label={t('play.controls.move.label')}
          >
            <span
              className="pad__knob"
              style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
            />
          </div>

          <div className="pad__buttons">
            <button
              type="button"
              className="pad__btn pad__btn--pass"
              aria-label={t('play.controls.pass.label')}
              onPointerDown={() => matchRef.current && userPass(matchRef.current)}
            >
              <Icon name="share" fill />
              <span>{t('play.pass')}</span>
            </button>

            <button
              type="button"
              className="pad__btn pad__btn--shoot"
              aria-label={t('play.controls.shoot.label')}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                chargingRef.current = true
              }}
              onPointerUp={() => {
                if (matchRef.current && chargingRef.current) {
                  userShoot(matchRef.current, chargeRef.current)
                }
                chargingRef.current = false
                chargeRef.current = 0
              }}
              onPointerCancel={() => {
                chargingRef.current = false
                chargeRef.current = 0
              }}
            >
              <Icon name="bolt" fill />
              <span>{t('play.shoot')}</span>
            </button>
          </div>
        </div>

        {portrait && !isFull ? (
          <button type="button" className="rotate-hint" onClick={toggleFullscreen}>
            <Icon name="screen_rotation" fill />
            {t('play.rotateHint')}
          </button>
        ) : null}
       </div>
      </div>

      <p className="quote-foot play-keys">{t('play.keyboardHint')}</p>
    </div>
  )
}
