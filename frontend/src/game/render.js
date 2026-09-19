/* ============================================================
   Match renderer — landscape pitch.
   A pure function of match state: draws the same mowing stripes,
   chalk geometry and white player tokens the rest of the app
   uses, so the game looks like it belongs to Pitch Craft.
   Home defends the left goal and attacks to the right.
   ============================================================ */

import { FIELD } from './engine.js'

const CHALK = 'rgba(255,255,255,0.85)'
const STRIPES = 12

export function drawMatch(ctx, state, { width, height, charge = 0, showNumbers = true }) {
  const s = Math.min(width / FIELD.W, height / FIELD.H)
  const ox = (width - FIELD.W * s) / 2
  const oy = (height - FIELD.H * s) / 2

  const X = (v) => ox + v * s
  const Y = (v) => oy + v * s
  const S = (v) => v * s

  ctx.clearRect(0, 0, width, height)

  /* ---- turf: vertical mowing bands, as a camera sees a pitch side-on ---- */
  ctx.fillStyle = '#14532d'
  ctx.fillRect(X(0), Y(0), S(FIELD.W), S(FIELD.H))

  const band = FIELD.W / STRIPES
  for (let i = 0; i < STRIPES; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(22,163,74,0.55)' : 'rgba(22,101,52,0.38)'
    ctx.fillRect(X(i * band), Y(0), S(band) + 1, S(FIELD.H))
  }

  /* ---- chalk ---- */
  ctx.strokeStyle = CHALK
  ctx.lineWidth = Math.max(1.4, S(0.6))

  const inset = 2
  ctx.strokeRect(X(inset), Y(inset), S(FIELD.W - inset * 2), S(FIELD.H - inset * 2))

  // Halfway line + centre circle
  ctx.beginPath()
  ctx.moveTo(X(FIELD.W / 2), Y(inset))
  ctx.lineTo(X(FIELD.W / 2), Y(FIELD.H - inset))
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(X(FIELD.W / 2), Y(FIELD.H / 2), S(13), 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = CHALK
  ctx.beginPath()
  ctx.arc(X(FIELD.W / 2), Y(FIELD.H / 2), Math.max(1.5, S(0.8)), 0, Math.PI * 2)
  ctx.fill()

  // Penalty areas, left and right
  const boxH = FIELD.BOX_Y1 - FIELD.BOX_Y0
  ctx.strokeRect(X(inset), Y(FIELD.BOX_Y0), S(FIELD.BOX_D), S(boxH))
  ctx.strokeRect(X(FIELD.W - inset - FIELD.BOX_D), Y(FIELD.BOX_Y0), S(FIELD.BOX_D), S(boxH))

  // Six-yard boxes
  const sixH = 16
  const sixD = 9
  ctx.strokeRect(X(inset), Y(50 - sixH / 2), S(sixD), S(sixH))
  ctx.strokeRect(X(FIELD.W - inset - sixD), Y(50 - sixH / 2), S(sixD), S(sixH))

  /* ---- goal mouths ---- */
  ctx.lineWidth = Math.max(3, S(1.4))
  ctx.strokeStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(X(inset), Y(FIELD.GOAL_Y0))
  ctx.lineTo(X(inset), Y(FIELD.GOAL_Y1))
  ctx.moveTo(X(FIELD.W - inset), Y(FIELD.GOAL_Y0))
  ctx.lineTo(X(FIELD.W - inset), Y(FIELD.GOAL_Y1))
  ctx.stroke()

  /* ---- the shirt under user control ---- */
  const controlled = state.players.find((p) => p.id === state.controlled)
  if (controlled && state.phase !== 'ended') {
    const r = S(6.5)
    const cx = X(controlled.x)
    const cy = Y(controlled.y)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, 'rgba(245,158,11,0.55)')
    grad.addColorStop(1, 'rgba(245,158,11,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // Charging a shot winds a gold arc around the player.
    if (charge > 0) {
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = Math.max(2, S(1))
      ctx.beginPath()
      ctx.arc(cx, cy, S(5.6), -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2)
      ctx.stroke()
    }
  }

  /* ---- players ---- */
  for (const p of state.players) {
    const isUser = p.id === state.controlled
    const px = X(p.x)
    const py = Y(p.y)
    const r = S(3.4)

    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.beginPath()
    ctx.ellipse(px, py + r * 0.5, r * 0.9, r * 0.45, 0, 0, Math.PI * 2)
    ctx.fill()

    if (p.team === 'home') {
      ctx.fillStyle = isUser ? '#f59e0b' : '#ffffff'
    } else {
      ctx.fillStyle = p.role === 'GK' ? '#fde68a' : '#0ea5e9'
    }

    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = Math.max(1.2, S(0.5))
    ctx.strokeStyle = p.team === 'home' ? 'rgba(20,83,45,0.5)' : 'rgba(255,255,255,0.75)'
    ctx.stroke()

    if (showNumbers) {
      ctx.fillStyle = p.team === 'home' ? (isUser ? '#ffffff' : '#14532d') : '#ffffff'
      ctx.font = `700 ${Math.round(S(3.6))}px "Barlow Condensed", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(p.num), px, py + S(0.2))
    }
  }

  /* ---- ball ---- */
  const b = state.ball
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(X(b.x), Y(b.y) + S(1), S(1.6), S(0.8), 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(X(b.x), Y(b.y), S(1.7), 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#14532d'
  ctx.beginPath()
  ctx.arc(X(b.x), Y(b.y), S(0.7), 0, Math.PI * 2)
  ctx.fill()
}
