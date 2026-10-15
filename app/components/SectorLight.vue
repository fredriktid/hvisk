<script setup lang="ts">
withDefaults(defineProps<{ state: 'ready' | 'delivered' | 'gone' | 'error'; size?: number }>(), { size: 36 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 36 36" aria-hidden="true" class="sector" :data-state="state">
    <path class="w" d="M18 18L4 10A16 16 0 0 1 32 10z" />
    <path class="g" d="M18 18L32 10A16 16 0 0 1 32 26z" />
    <path class="r" d="M18 18L4 10A16 16 0 0 0 4 26z" />
    <path class="s" d="M18 18L4 26A16 16 0 0 0 32 26z" />
    <circle cx="18" cy="18" r="4" class="core" />
  </svg>
</template>

<style scoped>
.sector path {
  fill: var(--rule);
  transition: fill var(--dur) var(--ease);
}
.core {
  fill: var(--ground);
}
[data-state='ready'] .w {
  fill: var(--text);
}
[data-state='ready'] .g,
[data-state='ready'] .r {
  fill: var(--rule);
}
[data-state='delivered'] .w,
[data-state='delivered'] .g {
  fill: var(--ok);
}
[data-state='error'] .r,
[data-state='error'] .w {
  fill: var(--bad);
}
[data-state='gone'] path {
  fill: var(--out);
  opacity: 0.55;
}
</style>
