import { describe, expect, it } from 'vitest'
import { embedKind, toEmbedUrl } from '../lib/spotify.js'

describe('toEmbedUrl', () => {
  it('converts the share links people actually paste', () => {
    expect(toEmbedUrl('https://open.spotify.com/playlist/2AOAB7OttD3SpnQtDFj9LY')).toBe(
      'https://open.spotify.com/embed/playlist/2AOAB7OttD3SpnQtDFj9LY',
    )
    // The share button appends a tracking query; it shouldn't matter.
    expect(toEmbedUrl('https://open.spotify.com/track/abc123?si=xyz&utm_source=copy')).toBe(
      'https://open.spotify.com/embed/track/abc123',
    )
    // Localised links carry a path prefix.
    expect(toEmbedUrl('https://open.spotify.com/intl-es/album/abc123')).toBe('https://open.spotify.com/embed/album/abc123')
    // A URI copied from the desktop app.
    expect(toEmbedUrl('spotify:track:abc123')).toBe('https://open.spotify.com/embed/track/abc123')
    // Already an embed link.
    expect(toEmbedUrl('https://open.spotify.com/embed/track/abc123')).toBe('https://open.spotify.com/embed/track/abc123')
  })

  it('refuses anything that is not an embeddable Spotify link', () => {
    for (const bad of ['', '   ', null, undefined, 42, 'not a url', 'https://example.com/track/abc', 'https://open.spotify.com/user/someone', 'https://open.spotify.com/track/']) {
      expect(toEmbedUrl(bad), String(bad)).toBeNull()
    }
  })

  it('reports what kind of thing is being embedded', () => {
    expect(embedKind('https://open.spotify.com/playlist/abc123')).toBe('playlist')
    expect(embedKind('https://example.com')).toBeNull()
  })
})
