<script setup lang="ts">
const { t, locale } = useLocale()
useHead({
  htmlAttrs: { lang: locale },
  title: computed(() => t('meta.title')),
  meta: [{ name: 'description', content: computed(() => t('meta.description')) }],
})
</script>

<template>
  <div class="shell">
    <AppHeader />
    <main class="main">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<style>
.shell {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}
.main {
  flex: 1;
  width: min(100% - 2 * var(--cell), 1200px);
  margin-inline: auto;
  padding: var(--cell) 0 calc(var(--cell) * 1.5);
}
@media (min-width: 1392px) {
  .main {
    margin-inline: calc(var(--cell) * 3) auto;
  }
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 16fr) minmax(0, 8fr);
  gap: var(--cell);
  align-items: start;
}
@media (max-width: 640px) {
  .main {
    width: calc(100% - 32px);
  }
}
@media (max-width: 960px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
  .main {
    padding-top: 24px;
  }
}
.field {
  padding: 16px;
}
.note {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-soft);
}
.error {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 0 16px 16px;
  font-size: 15px;
  color: var(--bad);
}
.error svg {
  margin-top: 2px;
}
.input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--rule);
  background: var(--ground);
  color: var(--text);
}
.input:focus-visible {
  outline-offset: 0;
  border-color: var(--focus);
}
.lead {
  padding: 16px;
  font-size: 17px;
  max-width: 50ch;
}
.lead + .field {
  padding-top: 0;
}
.lead + .lead {
  padding-top: 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 16px;
  border-top: 1px solid var(--rule);
}
.actions .note {
  margin: 0;
  max-width: 44ch;
}
</style>
