<script setup lang="ts">
const { t, locale, setLocale } = useLocale()
const { theme, toggle } = useTheme()
</script>

<template>
  <header class="top">
    <NuxtLink to="/" class="brand" :aria-label="t('nav.home')">
      <LanternMark />
      <span>Hvisk</span>
    </NuxtLink>
    <nav class="nav" aria-label="Site">
      <NuxtLink to="/how" class="link">{{ t('nav.how') }}</NuxtLink>
      <div class="seg" role="group" :aria-label="t('nav.language')">
        <button type="button" :class="{ on: locale === 'en' }" :aria-pressed="locale === 'en'" lang="en" @click="setLocale('en')">EN</button>
        <button type="button" :class="{ on: locale === 'nb' }" :aria-pressed="locale === 'nb'" lang="nb" @click="setLocale('nb')">NB</button>
      </div>
      <button type="button" class="sw" :aria-label="theme === 'dark' ? t('nav.theme.toLight') : t('nav.theme.toDark')" @click="toggle">
        <ClientOnly><Icon :name="theme === 'dark' ? 'sun' : 'moon'" /><template #fallback><Icon name="moon" /></template></ClientOnly>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: calc(var(--cell) * 2);
  padding: 0 calc(var(--cell) * 2);
  border-bottom: 1px solid var(--rule);
  background: var(--ground);
}
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.01em;
  color: var(--text);
  text-decoration: none;
}
.nav {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 28px);
}
.link {
  color: var(--text-soft);
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.link:hover,
.link.router-link-active {
  color: var(--text);
  text-decoration: underline;
  text-underline-offset: 0.3em;
}
.seg {
  display: inline-flex;
  border: 1px solid var(--rule);
}
.seg button {
  min-width: 44px;
  height: 40px;
  padding: 0 10px;
  border: 0;
  background: transparent;
  color: var(--text-soft);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
}
.seg button + button {
  border-left: 1px solid var(--rule);
}
.seg button.on {
  background: var(--text);
  color: var(--ground);
}
.sw {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
}
.sw:hover {
  color: var(--text);
  background: var(--panel-2);
}
@media (max-width: 960px) {
  .top {
    padding: 0 var(--cell);
  }
}
@media (max-width: 640px) {
  .top {
    height: 64px;
    gap: 12px;
    padding: 0 16px;
  }
  .brand {
    gap: 10px;
  }
  .brand span {
    font-size: 19px;
  }
  .link {
    font-size: 15px;
  }
  .seg button {
    min-width: 38px;
    padding: 0 6px;
  }
}
@media (max-width: 360px) {
  .top {
    flex-wrap: wrap;
    height: auto;
    min-height: 64px;
    padding-block: 10px;
    row-gap: 6px;
  }
  .nav {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
