/**
 * Tiny in-memory sliding-window rate limiter, keyed by client IP. Enough to
 * stop a runaway loop from burning the Gemini quota; not a substitute for a
 * real gateway limit in production.
 */
export function rateLimit({ max = 20, windowMs = 60_000 } = {}) {
  const hits = new Map()

  const sweep = setInterval(() => {
    const cutoff = Date.now() - windowMs
    for (const [key, times] of hits) {
      if (!times.some((t) => t > cutoff)) hits.delete(key)
    }
  }, windowMs)
  sweep.unref?.()

  return function limiter(req, res, next) {
    const now = Date.now()
    const key = req.ip || req.socket?.remoteAddress || 'unknown'
    const recent = (hits.get(key) ?? []).filter((t) => t > now - windowMs)
    if (recent.length >= max) {
      const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000))
      res.set('Retry-After', String(retryAfter))
      return res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many messages — give it a few seconds and try again.' },
      })
    }
    recent.push(now)
    hits.set(key, recent)
    next()
  }
}
