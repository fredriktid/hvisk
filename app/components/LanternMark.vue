<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 28 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 28 28" fill="none" aria-hidden="true" class="mark">
    <path class="beam" d="M18 10l9-3.5M18 10l9 3.5M10 10l-9-3.5M10 10l-9 3.5" stroke-width="1.5" />
    <rect class="lamp" x="10" y="3" width="8" height="14" />
    <path class="tower" d="M6 17h16l-2.5 8h-11z" />
  </svg>
</template>

<style scoped>
.lamp {
  fill: var(--action);
}
.beam {
  stroke: var(--action);
}
.tower {
  fill: var(--rule-strong);
}
</style>
