import { toBase64Url } from '#shared/utils/encoding'

const base = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
]

const inlineScript = /<script(?![^>]*\ssrc=)(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g

async function hash(source: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source))
  const b64 = toBase64Url(new Uint8Array(digest)).replace(/-/g, '+').replace(/_/g, '/')
  return `'sha256-${b64}${'='.repeat((4 - (b64.length % 4)) % 4)}'`
}

// Nuxt ships one inline config script. Its hash goes into the CSP, so inline scripts stay blocked otherwise.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const hashes = new Set<string>()
    for (const part of [...html.head, ...html.bodyPrepend, ...html.bodyAppend]) {
      for (const match of part.matchAll(inlineScript)) hashes.add(await hash(match[1] ?? ''))
    }
    const scriptSrc = ["'self'", ...hashes].join(' ')
    setResponseHeader(event, 'Content-Security-Policy', [...base, `script-src ${scriptSrc}`].join('; '))
  })
})
