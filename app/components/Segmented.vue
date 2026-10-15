<script setup lang="ts">
const props = defineProps<{ name: string; label: string; options: { value: number; short: string; long: string }[] }>()
const model = defineModel<number>({ required: true })
</script>

<template>
  <fieldset class="seg">
    <legend class="sr-only">{{ props.label }}</legend>
    <label v-for="o in props.options" :key="o.value" class="opt" :class="{ on: model === o.value }">
      <input v-model="model" type="radio" :name="props.name" :value="o.value" class="sr-only" />
      <span aria-hidden="true">{{ o.short }}</span>
      <span class="sr-only">{{ o.long }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
.seg {
  display: inline-flex;
  margin: 0;
  padding: 0;
  border: 1px solid var(--rule-strong);
}
.opt {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 44px;
  padding: 0 14px;
  border-right: 1px solid var(--rule-strong);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
}
.opt:last-child {
  border-right: 0;
}
.opt:hover {
  background: var(--panel-2);
}
.opt.on {
  background: var(--action);
  color: var(--on-action);
  font-weight: 800;
}
.opt:has(:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
  z-index: 1;
}
@media (max-width: 480px) {
  .seg {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }
  .opt {
    border-right: 0;
  }
  .opt:nth-child(odd) {
    border-right: 1px solid var(--rule-strong);
  }
  .opt:nth-child(-n + 2) {
    border-bottom: 1px solid var(--rule-strong);
  }
}
</style>
