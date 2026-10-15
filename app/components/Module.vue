<script setup lang="ts">
defineProps<{ title: string; level?: 'h1' | 'h2' | 'h3'; sub?: boolean; out?: boolean }>()
</script>

<template>
  <section class="module" :class="{ sub, out }">
    <header class="head">
      <component :is="level ?? 'h2'" class="title">
        {{ title }}
        <span v-if="$slots.tag" class="tag"><slot name="tag" /></span>
      </component>
      <span v-if="$slots.readout" class="readout mono"><slot name="readout" /></span>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.module {
  position: relative;
  border: 1px solid var(--rule);
  background: var(--panel);
  transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.module.sub {
  border: 0;
  background: transparent;
}
.module.out {
  background: var(--ground);
}
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 16px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--rule);
  min-height: 44px;
}
.title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-soft);
  line-height: 1.4;
}
.out .title {
  color: var(--out);
}
.tag {
  font-weight: 400;
  margin-left: 6px;
}
.readout {
  font-size: 13px;
  font-weight: 700;
  color: var(--action);
  white-space: nowrap;
}
</style>
