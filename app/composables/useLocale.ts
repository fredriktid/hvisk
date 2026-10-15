import { en, type MessageKey } from '~/locales/en'
import { nb } from '~/locales/nb'

export type Locale = 'en' | 'nb'
export const LOCALES: Locale[] = ['en', 'nb']
const STORAGE_KEY = 'hvisk-locale'
const messages = { en, nb } as const

export function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'en' || v === 'nb' ? v : null
  } catch {
    return null
  }
}

export function useLocale() {
  const locale = useState<Locale>('locale', () => 'en')

  function t(key: MessageKey, params?: Record<string, string | number>): string {
    let text: string = messages[locale.value][key] ?? en[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v))
    }
    return text
  }

  function setLocale(next: Locale) {
    locale.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* private mode */
    }
  }

  const intlLocale = computed(() => (locale.value === 'nb' ? 'nb-NO' : 'en-GB'))

  function formatDateTime(unixSeconds: number): string {
    return new Intl.DateTimeFormat(intlLocale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(unixSeconds * 1000)
  }

  function formatBytes(n: number): string {
    return n >= 1024 ? t('size.kb', { n: (n / 1024).toFixed(n >= 10240 ? 0 : 1) }) : t('size.b', { n })
  }

  return { locale, t, setLocale, formatDateTime, formatBytes }
}
