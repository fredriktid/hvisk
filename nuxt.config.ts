const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: true,
  modules: ['nitro-cloudflare-dev'],
  devtools: { enabled: false },
  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Hvisk',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Share a secret with a link that works once. Encrypted in your browser, the key never leaves the link.' },
        { name: 'theme-color', content: '#0b1626', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#f4f6f8', media: '(prefers-color-scheme: light)' },
        { name: 'referrer', content: 'no-referrer' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/atkinson-hyperlegible-mono-latin-wght-normal.woff2', crossorigin: 'anonymous' },
      ],
      script: [{ src: '/theme.js' }],
    },
  },
  routeRules: {
    '/**': { headers: securityHeaders },
    '/s/**': { headers: { ...securityHeaders, 'Cache-Control': 'no-store' } },
    '/b/**': { headers: { ...securityHeaders, 'Cache-Control': 'no-store' } },
    '/api/**': { headers: { ...securityHeaders, 'Cache-Control': 'no-store' } },
    '/fonts/**': { headers: { ...securityHeaders, 'Cache-Control': 'public, max-age=31536000, immutable' } },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: false,
      nodeCompat: true,
    },
  },
  typescript: { strict: true, typeCheck: false },
})
