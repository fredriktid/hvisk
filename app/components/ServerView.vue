<script setup lang="ts">
import { groups } from '#shared/utils/crypto'

const props = defineProps<{
  ciphertext: string
  state: 'ready' | 'delivered' | 'gone' | 'error'
  mode: 'live' | 'stored'
  storedId?: string
  notation?: string
}>()
const { t } = useLocale()
const rows = computed(() => groups(props.ciphertext))
const stateLabel = computed(() => t(`state.${props.state}` as const))
const caption = computed(() => {
  if (props.ciphertext) {
    if (props.mode === 'live') return t('server.live')
    return t(props.state === 'ready' ? 'result.stored' : 'result.stored.gone', { id: props.storedId ?? '' })
  }
  if (props.mode === 'live') return t('server.empty')
  return t(props.state === 'gone' ? 'server.empty.gone' : 'server.empty.ready')
})
const captionParts = computed(() => {
  const id = props.storedId ?? ''
  if (!id || !caption.value.includes(id)) return [{ text: caption.value, mono: false }]
  const [before, after] = caption.value.split(id)
  return [
    { text: before ?? '', mono: false },
    { text: id, mono: true },
    { text: after ?? '', mono: false },
  ]
})
</script>

<template>
  <Module :title="t('server.header')" :out="state === 'gone'">
    <p class="caption">{{ t('server.caption') }}</p>
    <div class="cipher mono" :class="{ empty: !ciphertext }" aria-hidden="true">
      <span v-for="(row, i) in rows" :key="i" class="row">{{ row }}</span>
    </div>
    <p class="live"><template v-for="(part, i) in captionParts" :key="i"><span v-if="part.mono" class="mono">{{ part.text }}</span><template v-else>{{ part.text }}</template></template></p>
    <ul class="claims">
      <li><SectorLight state="ready" :size="16" /><span>{{ t('server.claim.browser') }}</span></li>
      <li><SectorLight state="delivered" :size="16" /><span>{{ t('server.claim.key') }}</span></li>
      <li><SectorLight state="gone" :size="16" /><span>{{ t('server.claim.gone') }}</span></li>
    </ul>
    <div class="status">
      <SectorLight :state="state" />
      <p>
        <b>{{ stateLabel }}.</b> {{ t('server.sector') }} <span class="mono">{{ notation ?? 'Fl 7d' }}</span> {{ t('server.notation') }}
        <NuxtLink to="/how">{{ t('server.more') }}</NuxtLink>
      </p>
    </div>
  </Module>
</template>

<style scoped>
.caption {
  padding: 12px 16px 0;
  font-size: 14px;
  color: var(--text-soft);
}
.cipher {
  display: grid;
  gap: 2px;
  padding: 12px 16px 4px;
  font-size: 15px;
  letter-spacing: 0.08em;
  color: var(--text);
  transition: opacity var(--dur) var(--ease);
}
.cipher.empty {
  opacity: 0.35;
}
.row {
  white-space: pre;
}
.live {
  padding: 0 16px 12px;
  font-size: 14px;
  color: var(--text-soft);
  border-bottom: 1px solid var(--rule);
}
.claims {
  list-style: none;
  padding: 14px 16px;
  display: grid;
  gap: 10px;
  font-size: 15px;
  border-bottom: 1px solid var(--rule);
}
.claims li {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 10px;
  align-items: start;
}
.claims svg {
  margin-top: 4px;
}
.status {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-soft);
}
.status b {
  color: var(--text);
}
.status svg {
  flex: none;
}
</style>
