import Icon from './Icon.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'

/**
 * Seven-day training strip: green checks for days trained, a gold bolt
 * for today, muted padlocks for the rest of the week.
 */
export default function WeekStrip() {
  const { t } = useI18n()
  const { weekDone, today } = useApp()
  const days = t('path.days')

  return (
    <div className="weekstrip">
      {days.map((letter, i) => {
        const done = weekDone.includes(i)
        const isToday = i === today && !done
        const state = done ? 'is-done' : isToday ? 'is-today' : ''
        const icon = done ? 'check' : isToday ? 'bolt' : 'lock'
        return (
          <div className={`weekstrip__day ${state}`.trim()} key={`${letter}-${i}`}>
            <span className="weekstrip__dot">
              <Icon name={icon} fill={done || isToday} />
            </span>
            <span className="weekstrip__letter">{letter}</span>
          </div>
        )
      })}
    </div>
  )
}
