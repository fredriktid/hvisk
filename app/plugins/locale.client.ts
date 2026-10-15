import { readStoredLocale } from '~/composables/useLocale'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    const stored = readStoredLocale()
    if (stored) useLocale().locale.value = stored
  })
})
