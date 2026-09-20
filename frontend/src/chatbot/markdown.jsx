import Icon from '../components/Icon.jsx'

/**
 * Minimal, safe markdown for chat replies: paragraphs, bullet/numbered lists,
 * **bold**, *italic* and [links](url). It builds React elements directly and
 * never uses dangerouslySetInnerHTML, so model output can't inject HTML.
 * Links are limited to in-app hash routes and http(s) URLs.
 */

const APP_PATHS = new Set(['/', '/field', '/leagues', '/culture', '/quiz', '/drills', '/streak', '/profile'])

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/

function appRoute(url) {
  if (!url.startsWith('#/')) return null
  const path = url.slice(1).split('?')[0]
  return APP_PATHS.has(path) ? url.slice(1) : null
}

function renderInline(text, onNavigate, keyPrefix) {
  return text.split(INLINE).map((chunk, i) => {
    const key = `${keyPrefix}-${i}`
    if (!chunk) return null
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
      return <strong key={key}>{chunk.slice(2, -2)}</strong>
    }
    if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      return <em key={key}>{chunk.slice(1, -1)}</em>
    }
    const link = LINK.exec(chunk)
    if (link) {
      const [, label, url] = link
      const route = appRoute(url)
      if (route) {
        return (
          <a
            key={key}
            href={`#${route}`}
            className="chatbot-link chatbot-link--app"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
              e.preventDefault()
              onNavigate(route)
            }}
          >
            {label}
            <Icon name="arrow_forward" />
          </a>
        )
      }
      if (/^https?:\/\//i.test(url)) {
        return (
          <a key={key} href={url} className="chatbot-link" target="_blank" rel="noopener noreferrer nofollow">
            {label}
          </a>
        )
      }
      return label
    }
    return chunk
  })
}

const BULLET = /^\s*[*\-•]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/

export default function Markdown({ text, onNavigate }) {
  const blocks = []
  let para = []
  let list = null

  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', lines: para })
    para = []
  }
  const flushList = () => {
    if (list) blocks.push(list)
    list = null
  }

  for (const line of text.replace(/\r/g, '').split('\n')) {
    const bullet = BULLET.exec(line)
    const numbered = bullet ? null : NUMBERED.exec(line)
    if (bullet || numbered) {
      flushPara()
      const type = bullet ? 'ul' : 'ol'
      if (list && list.type !== type) flushList()
      list ??= { type, items: [] }
      list.items.push((bullet ?? numbered)[1])
    } else if (!line.trim()) {
      flushPara()
      flushList()
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()

  return (
    <div className="chatbot-md">
      {blocks.map((b, i) => {
        if (b.type === 'p') {
          return (
            <p key={i}>
              {b.lines.map((l, j) => (
                <span key={j}>
                  {j > 0 && <br />}
                  {renderInline(l, onNavigate, `${i}-${j}`)}
                </span>
              ))}
            </p>
          )
        }
        const Tag = b.type
        return (
          <Tag key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{renderInline(item, onNavigate, `${i}-${j}`)}</li>
            ))}
          </Tag>
        )
      })}
    </div>
  )
}
