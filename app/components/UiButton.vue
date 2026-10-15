<script setup lang="ts">
withDefaults(
  defineProps<{ variant?: 'primary' | 'outline' | 'quiet'; busy?: boolean; type?: 'button' | 'submit'; to?: string; lamp?: boolean }>(),
  { variant: 'primary', busy: false, type: 'button', lamp: true },
)
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="btn" :class="variant"><slot /></NuxtLink>
  <button v-else :type="type" class="btn" :class="[variant, { busy }]" :aria-busy="busy || undefined" :disabled="busy || undefined">
    <span v-if="variant === 'primary' && lamp" class="lamp" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 48px;
  padding: 0 24px;
  border: 1px solid transparent;
  font-weight: 800;
  font-size: 17px;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.primary {
  background: var(--action);
  color: var(--on-action);
}
.primary:hover {
  background: var(--action-hover);
}
.outline {
  height: 44px;
  font-size: 16px;
  font-weight: 700;
  background: transparent;
  color: var(--text);
  border-color: var(--rule-strong);
}
.outline:hover {
  background: var(--panel-2);
}
.quiet {
  height: 40px;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 700;
  background: transparent;
  color: var(--link);
}
.quiet:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
.btn:disabled {
  cursor: progress;
  opacity: 0.7;
}
.lamp {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--on-action);
  box-shadow: 0 0 0 3px var(--action), 0 0 0 4px var(--on-action);
}
.busy .lamp {
  animation: blink 1s steps(2, end) infinite;
}
@keyframes blink {
  50% {
    opacity: 0.2;
  }
}
</style>
