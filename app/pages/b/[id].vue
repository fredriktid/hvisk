<script setup lang="ts">
import { ID_CHARS } from '#shared/utils/limits'
import { isBase64Url } from '#shared/utils/encoding'

definePageMeta({ ssr: false })
const route = useRoute()
const { t } = useLocale()

const id = String(route.params.id ?? '')
const token = ref('')
const phase = ref<'ask' | 'working' | 'burned' | 'gone' | 'notoken'>('ask')
const error = ref<string | null>(null)

onMounted(() => {
  token.value = location.hash.slice(1)
  if (!isBase64Url(id) || id.length !== ID_CHARS) phase.value = 'gone'
  else if (!isBase64Url(token.value) || token.value.length !== 43) phase.value = 'notoken'
})

async function burn() {
  phase.value = 'working'
  error.value = null
  try {
    await $fetch(`/api/secrets/${id}/burn`, { method: 'POST', body: { token: token.value } })
    history.replaceState(null, '', location.pathname)
    phase.value = 'burned'
  } catch (e) {
    if ((e as { statusCode?: number }).statusCode === 404) {
      phase.value = 'gone'
    } else {
      error.value = t('burn.network')
      phase.value = 'ask'
    }
  }
}
</script>

<template>
  <div class="grid">
    <div>
      <Module v-if="phase === 'notoken'" :title="t('burn.header')" out>
        <p class="lead">{{ t('burn.noToken') }}</p>
        <div class="actions"><UiButton variant="outline" to="/">{{ t('open.gone.action') }}</UiButton></div>
      </Module>
      <Module v-else-if="phase === 'burned'" :title="t('burn.done.header')" out>
        <p class="lead" role="status">{{ t('burn.done.lead') }}</p>
        <div class="actions"><UiButton variant="outline" to="/">{{ t('open.gone.action') }}</UiButton></div>
      </Module>
      <Module v-else-if="phase === 'gone'" :title="t('burn.gone.header')" out>
        <p class="lead" role="status">{{ t('burn.gone.lead') }}</p>
        <div class="actions"><UiButton variant="outline" to="/">{{ t('open.gone.action') }}</UiButton></div>
      </Module>
      <Module v-else :title="t('burn.header')">
        <p class="lead">{{ t('burn.lead') }}</p>
        <div class="actions">
          <UiButton :busy="phase === 'working'" @click="burn"><Icon name="flame" />{{ phase === 'working' ? t('burn.working') : t('burn.action') }}</UiButton>
        </div>
        <p v-if="error" class="error" role="alert"><Icon name="alert" />{{ error }}</p>
      </Module>
    </div>
    <ServerView ciphertext="" mode="stored" :stored-id="id" :state="phase === 'burned' || phase === 'gone' ? 'gone' : 'ready'" />
  </div>
</template>
