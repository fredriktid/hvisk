<script setup lang="ts">
import { CREDIT } from '~/credit'
const { t } = useLocale()
</script>

<template>
  <footer class="foot">
    <p>
      {{ t('footer.made') }} <a :href="CREDIT.url">{{ CREDIT.name }}</a> ·
      <a :href="CREDIT.source">{{ t('footer.source') }}</a>
    </p>
    <p class="sib">{{ t('footer.sibling').split('Fikser')[0] }}<a :href="CREDIT.sibling.url">Fikser</a>{{ t('footer.sibling').split('Fikser')[1] }}</p>
    <p class="mono meta">{{ CREDIT.domain }} · {{ t('footer.tracking') }}</p>
  </footer>
</template>

<style scoped>
.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 32px;
  min-height: calc(var(--cell) + 16px);
  padding: 16px calc(var(--cell) * 2);
  border-top: 1px solid var(--rule);
  background: var(--ground);
  font-size: 14px;
  color: var(--text-soft);
}
.foot a {
  color: var(--text);
}
.meta {
  font-size: 13px;
}
@media (max-width: 960px) {
  .foot {
    padding-inline: var(--cell);
  }
}
@media (max-width: 640px) {
  .foot {
    padding-inline: 16px;
  }
}
</style>
