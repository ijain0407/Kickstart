import Icon from './Icon.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/**
 * A selectable style card. Selected state = 2px green border, mint
 * background, green left accent and a filled check circle; unselected
 * keeps the white card and an empty lavender circle.
 */
export default function QuizOption({ option, selected, onToggle, multi }) {
  const { tr } = useI18n()

  return (
    <button
      type="button"
      className={`qopt ${selected ? 'is-selected' : ''}`.trim()}
      onClick={() => onToggle(option.id)}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
    >
      <span className="qopt__check">
        <Icon name="check" />
      </span>

      <span className="qopt__body">
        <span className="qopt__top">
          <span className="t-headline-sm grow">{tr(option.title)}</span>
          <span className={`pill pill--${option.tagTone}`}>
            <Icon name={option.tagIcon} fill />
            {tr(option.tag)}
          </span>
        </span>

        <span className="qopt__desc">{tr(option.desc)}</span>

        <span className="qopt__metas">
          {option.metas.map((meta) => (
            <span className="meta-tag" key={meta.icon}>
              <Icon name={meta.icon} />
              {tr(meta.label)}
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}
