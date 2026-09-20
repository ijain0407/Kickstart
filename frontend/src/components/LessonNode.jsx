import { useRef, useState } from 'react'
import Icon from './Icon.jsx'

/**
 * One 64px node on the winding path.
 * completed → green disc with a check and up to three gold stars
 * active    → larger green disc with a pulsing ring
 * unlocked  → white disc with the lesson icon and its XP bounty
 * locked    → pale lavender disc with a padlock; tapping shakes it
 *
 * The first tap on a node previews it in the card below; the tag appears on
 * whichever node is previewed, because a second tap on that one opens it.
 */
export default function LessonNode({ lesson, state, title, tagText, onSelect, isFocused }) {
  const [shaking, setShaking] = useState(false)
  const timer = useRef(null)

  const locked = state === 'locked'

  const iconName =
    state === 'completed' ? 'check' : state === 'locked' ? 'lock' : lesson.icon

  const handleClick = () => {
    if (locked) {
      clearTimeout(timer.current)
      setShaking(true)
      timer.current = setTimeout(() => setShaking(false), 440)
    }
    onSelect(lesson, state)
  }

  return (
    <div className={`node node--${state} ${shaking ? 'shake' : ''}`.trim()}>
      {state === 'completed' && lesson.stars > 0 ? (
        <span className="node__stars" aria-label={`${lesson.stars} / 3`}>
          {Array.from({ length: lesson.stars }, (_, i) => (
            <Icon key={i} name="star" fill />
          ))}
        </span>
      ) : null}

      {isFocused && !locked && tagText ? <span className="node__tag">{tagText}</span> : null}

      <button
        type="button"
        onClick={handleClick}
        aria-label={`${lesson.id} ${title}`}
        aria-current={isFocused ? 'true' : undefined}
        aria-disabled={locked}
        className="node__btn"
      >
        <span className="node__disc">
          <Icon name={iconName} fill={state === 'completed' || state === 'active'} />
        </span>
      </button>

      <span className="node__label">{title}</span>

      {state === 'unlocked' ? (
        <span className="pill pill--gold node__xp">+{lesson.xp} XP</span>
      ) : null}
    </div>
  )
}
