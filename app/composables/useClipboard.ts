export function useClipboard() {
  const copied = ref(false)
  const failed = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string) {
    clearTimeout(timer)
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      failed.value = false
    } catch {
      failed.value = true
      copied.value = false
    }
    timer = setTimeout(() => {
      copied.value = false
      failed.value = false
    }, 2200)
  }

  onBeforeUnmount(() => clearTimeout(timer))
  return { copy, copied, failed }
}
