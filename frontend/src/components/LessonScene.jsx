import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import PitchBoard from './PitchBoard.jsx'
import PlayerToken from './PlayerToken.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/* ============================================================
   LESSON SCENE
   The interactive diagram beside each teaching step. The shape
   of the scene is decided by the content API (Person B's
   /api/path-lessons) — this file only knows how to draw the
   four kinds it can send:

     states    n named states on a pitch, driven by a slider or
               a chip row: players, offside line, a pass lane,
               a readout and a note per state
     hotspots  tappable labelled regions over a pitch or a
               stadium bowl
     squad     tappable groups of shirt numbers
     layers    a stack of text layers opened one at a time

   Nothing here is lesson-specific, so a new scene is a content
   change on the server rather than a component here.
   ============================================================ */

/** Scene copy arrives localized from the API, but tr() also takes {en,es}. */
function useSceneText() {
  const { tr } = useI18n()
  return tr
}

/* ---- The pass lane a `states` scene can draw ---- */

function PassLane({ pass }) {
  if (!pass) return null
  const { from, to, blocked } = pass
  const midTop = (from.top + to.top) / 2
  const midLeft = (from.left + to.left) / 2

  return (
    <>
      <svg
        className={`pass-path lane ${blocked ? 'lane--blocked' : ''}`.trim()}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={`M ${from.left} ${from.top} L ${to.left} ${to.top}`} />
      </svg>
      {blocked ? (
        <span
          className="lane__block"
          style={{ top: `${midTop}%`, left: `${midLeft}%` }}
          aria-hidden="true"
        >
          <Icon name="block" fill />
        </span>
      ) : null}
    </>
  )
}

/* ---- kind: states ---- */

function StatesScene({ scene, label }) {
  const tr = useSceneText()
  const [index, setIndex] = useState(0)

  // A language switch refetches the lesson, which remounts with new content;
  // a shorter list must never leave the index pointing past the end.
  const safeIndex = Math.min(index, scene.states.length - 1)
  const active = scene.states[safeIndex]
  const players = active.players ?? scene.players ?? []
  const isSlider = scene.control !== 'chips'

  return (
    <div className="scene stack stack-3">
      <PitchBoard
        className="lesson-visual"
        markings={scene.markings ?? 'full'}
        showZones={Boolean(scene.showZones)}
        offside={active.offside ?? null}
        aria-label={tr(scene.label) || label}
      >
        <PassLane pass={active.pass} />
        {players.map((p) => (
          <PlayerToken key={`${p.num}-${p.code}`} player={p} gold={Boolean(p.flagged)} />
        ))}
        {active.readout ? (
          <span className={`scene__readout scene__readout--${active.tone ?? 'neutral'}`}>
            {tr(active.readout)}
          </span>
        ) : null}
      </PitchBoard>

      {scene.prompt ? <p className="scene__prompt">{tr(scene.prompt)}</p> : null}

      {isSlider ? (
        <div className="scene__slider">
          <input
            type="range"
            min={0}
            max={scene.states.length - 1}
            step={1}
            value={safeIndex}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label={tr(scene.prompt) || label}
            aria-valuetext={tr(active.label)}
          />
          <div className="scene__ticks">
            {scene.states.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`scene__tick ${i === safeIndex ? 'is-on' : ''}`.trim()}
                aria-pressed={i === safeIndex}
                onClick={() => setIndex(i)}
              >
                {tr(s.label)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chip-row" role="group" aria-label={tr(scene.prompt) || label}>
          {scene.states.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${i === safeIndex ? 'is-active' : ''}`.trim()}
              aria-pressed={i === safeIndex}
              onClick={() => setIndex(i)}
            >
              {tr(s.label)}
            </button>
          ))}
        </div>
      )}

      <SceneNote tone={active.tone} title={active.label} body={active.note} />
    </div>
  )
}

/* ---- kind: hotspots ---- */

function HotspotsScene({ scene, label }) {
  const tr = useSceneText()
  const [activeId, setActiveId] = useState(scene.regions[0]?.id ?? null)
  const active = scene.regions.find((r) => r.id === activeId) ?? scene.regions[0]
  const isStadium = scene.surface === 'stadium'

  const regions = scene.regions.map((region) => (
    <button
      key={region.id}
      type="button"
      className={`hotspot ${region.id === active?.id ? 'is-on' : ''}`.trim()}
      style={{
        top: `${region.top}%`,
        left: `${region.left}%`,
        width: `${region.width}%`,
        height: `${region.height}%`,
      }}
      aria-pressed={region.id === active?.id}
      onClick={() => setActiveId(region.id)}
    >
      <span className="hotspot__label">{tr(region.label)}</span>
    </button>
  ))

  return (
    <div className="scene stack stack-3">
      {isStadium ? (
        <div className="stadium lesson-visual" role="img" aria-label={tr(scene.label) || label}>
          <span className="stadium__bowl" aria-hidden="true" />
          <span className="stadium__pitch" aria-hidden="true" />
          {regions}
        </div>
      ) : (
        <PitchBoard
          className="lesson-visual"
          markings={scene.markings ?? 'full'}
          aria-label={tr(scene.label) || label}
        >
          {regions}
        </PitchBoard>
      )}

      {scene.prompt ? <p className="scene__prompt">{tr(scene.prompt)}</p> : null}
      <SceneNote title={active?.label} body={active?.note} />
    </div>
  )
}

/* ---- kind: squad ---- */

function SquadScene({ scene, label }) {
  const tr = useSceneText()
  const [activeId, setActiveId] = useState(scene.groups[0]?.id ?? null)
  const active = scene.groups.find((g) => g.id === activeId) ?? scene.groups[0]
  const lit = useMemo(() => new Set(active?.nums ?? []), [active])

  return (
    <div className="scene stack stack-3">
      <PitchBoard
        className="lesson-visual"
        markings={scene.markings ?? 'full'}
        aria-label={tr(scene.label) || label}
      >
        {(scene.players ?? []).map((p) => (
          <PlayerToken
            key={`${p.num}-${p.code}`}
            player={p}
            highlight={lit.has(p.num)}
            dimmed={!lit.has(p.num)}
          />
        ))}
      </PitchBoard>

      {scene.prompt ? <p className="scene__prompt">{tr(scene.prompt)}</p> : null}

      <div className="chip-row" role="group" aria-label={tr(scene.prompt) || label}>
        {scene.groups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`chip ${group.id === active?.id ? 'is-active' : ''}`.trim()}
            aria-pressed={group.id === active?.id}
            onClick={() => setActiveId(group.id)}
          >
            {tr(group.label)}
          </button>
        ))}
      </div>

      <SceneNote title={active?.label} body={active?.note} />
    </div>
  )
}

/* ---- kind: layers ---- */

function LayersScene({ scene }) {
  const tr = useSceneText()
  const [openId, setOpenId] = useState(scene.layers[0]?.id ?? null)

  return (
    <div className="scene stack stack-3">
      {scene.prompt ? <p className="scene__prompt">{tr(scene.prompt)}</p> : null}

      <div className="scene__layers">
        {scene.layers.map((layer) => {
          const open = layer.id === openId
          return (
            <div key={layer.id} className={`layer ${open ? 'is-open' : ''}`.trim()}>
              <button
                type="button"
                className="layer__head"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : layer.id)}
              >
                <span className="t-headline-sm grow">{tr(layer.label)}</span>
                <Icon name={open ? 'expand_less' : 'expand_more'} />
              </button>
              {open ? <p className="layer__body t-body-md">{tr(layer.body)}</p> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- The note panel every scene closes with ---- */

function SceneNote({ tone = 'neutral', title, body }) {
  const tr = useSceneText()
  if (!body) return null
  const icon = tone === 'good' ? 'check_circle' : tone === 'bad' ? 'error' : 'lightbulb'

  return (
    <div className={`scene__note scene__note--${tone}`} role="status">
      <Icon name={icon} fill />
      <div className="stack stack-1">
        {title ? <span className="t-headline-sm">{tr(title)}</span> : null}
        <span className="t-body-md">{tr(body)}</span>
      </div>
    </div>
  )
}

/**
 * One teaching step's diagram. Returns null for a step the API sent without a
 * scene, so a content gap degrades to plain text rather than an empty box.
 *
 * Callers pass `key={step.id}` so moving between steps remounts the scene and
 * each one opens at its own first state.
 */
export default function LessonScene({ scene, label }) {
  if (!scene?.kind) return null

  switch (scene.kind) {
    case 'states':
      return scene.states?.length ? <StatesScene scene={scene} label={label} /> : null
    case 'hotspots':
      return scene.regions?.length ? <HotspotsScene scene={scene} label={label} /> : null
    case 'squad':
      return scene.groups?.length ? <SquadScene scene={scene} label={label} /> : null
    case 'layers':
      return scene.layers?.length ? <LayersScene scene={scene} label={label} /> : null
    default:
      return null
  }
}
