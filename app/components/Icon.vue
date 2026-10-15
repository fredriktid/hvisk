<script setup lang="ts">
defineProps<{ name: 'copy' | 'check' | 'sun' | 'moon' | 'arrow' | 'flame' | 'eye' | 'alert' }>()
</script>

<template>
  <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'copy'"><rect x="9" y="9" width="12" height="12" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></template>
    <template v-else-if="name === 'check'"><path d="M4 12.5l5 5L20 6.5" /></template>
    <template v-else-if="name === 'sun'"><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></template>
    <template v-else-if="name === 'moon'"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></template>
    <template v-else-if="name === 'arrow'"><path d="M5 12h14M13 6l6 6-6 6" /></template>
    <template v-else-if="name === 'flame'"><path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 .5 1.5 1.5 2 2 2 0-3-1-5 1-8z" /></template>
    <template v-else-if="name === 'eye'"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></template>
    <template v-else-if="name === 'alert'"><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17.5v.5" /></template>
  </svg>
</template>

<style scoped>
.icon {
  flex: none;
  display: block;
}
</style>
