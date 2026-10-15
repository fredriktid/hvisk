import type { RouterConfig } from '@nuxt/schema'

export default {
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  },
} satisfies RouterConfig
