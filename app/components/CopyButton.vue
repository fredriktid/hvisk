<script setup lang="ts">
const props = defineProps<{ text: string; label: string; done: string; variant?: 'outline' | 'quiet' | 'primary'; lamp?: boolean }>()
const { copy, copied, failed } = useClipboard()
const { t } = useLocale()
</script>

<template>
  <span class="wrap">
    <UiButton :variant="props.variant ?? 'outline'" :lamp="props.lamp ?? false" @click="copy(props.text)">
      <Icon :name="copied ? 'check' : 'copy'" />
      {{ copied ? done : label }}
    </UiButton>
    <span class="sr-only" role="status" aria-live="polite">{{ copied ? done : failed ? t('copy.failed') : '' }}</span>
    <span v-if="failed" class="fail">{{ t('copy.failed') }}</span>
  </span>
</template>

<style scoped>
.wrap {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
}
.fail {
  font-size: 14px;
  color: var(--bad);
}
</style>
