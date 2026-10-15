export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'hvisk-theme'

export function useTheme() {
  const stored = useState<Theme | null>('theme', () => null)
  const system = useState<Theme>('theme-system', () => 'light')

  onMounted(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    system.value = media.matches ? 'dark' : 'light'
    media.addEventListener('change', (e) => (system.value = e.matches ? 'dark' : 'light'))
    const v = document.documentElement.dataset.theme
    stored.value = v === 'light' || v === 'dark' ? v : null
  })

  const theme = computed<Theme>(() => stored.value ?? system.value)

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    stored.value = next
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* private mode */
    }
  }

  return { theme, toggle }
}
