import type { D1Database } from '@cloudflare/workers-types'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled', ({ env, context }) => {
    const DB = (env as { DB?: D1Database }).DB
    if (!DB) return
    context.waitUntil(
      DB.prepare('DELETE FROM secrets WHERE expires_at <= ?1')
        .bind(Math.floor(Date.now() / 1000))
        .run()
        .then((r) => console.log(`[hvisk] cleanup removed ${r.meta.changes} expired secrets`)),
    )
  })
})
