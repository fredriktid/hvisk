<script setup lang="ts">
import { open, WrongKeyError, type Sealed } from '#shared/utils/crypto'
import { ID_CHARS, KEY_CHARS } from '#shared/utils/limits'
import { isBase64Url } from '#shared/utils/encoding'

definePageMeta({ ssr: false })
const route = useRoute()
const { t, formatDateTime } = useLocale()

type Phase = 'checking' | 'nokey' | 'ready' | 'revealing' | 'revealed' | 'gone' | 'wrongkey'
const phase = ref<Phase>('checking')
const id = String(route.params.id ?? '')
const key = ref('')
const needsPassphrase = ref(false)
const expiresAt = ref<number | null>(null)
const passphrase = ref('')
const error = ref<string | null>(null)
const secret = ref('')
const sealed = ref<Sealed | null>(null)

onMounted(async () => {
  key.value = location.hash.slice(1)
  if (!isBase64Url(id) || id.length !== ID_CHARS) {
    phase.value = 'gone'
    return
  }
  if (!isBase64Url(key.value) || key.value.length !== KEY_CHARS) {
    phase.value = 'nokey'
    return
  }
  try {
    const peek = await $fetch<{ state: 'ready' | 'gone'; hasPassphrase?: boolean; expiresAt?: number }>(`/api/secrets/${id}`)
    if (peek.state !== 'ready') {
      phase.value = 'gone'
      return
    }
    needsPassphrase.value = Boolean(peek.hasPassphrase)
    expiresAt.value = peek.expiresAt ?? null
    phase.value = 'ready'
  } catch {
    phase.value = 'gone'
  }
})

async function reveal() {
  error.value = null
  phase.value = 'revealing'
  try {
    if (!sealed.value) {
      sealed.value = await $fetch<Sealed>(`/api/secrets/${id}/open`, { method: 'POST' })
      history.replaceState(null, '', location.pathname)
    }
    secret.value = await open(sealed.value, key.value, passphrase.value || undefined)
    phase.value = 'revealed'
    await nextTick()
    document.getElementById('secret-out')?.focus()
  } catch (e) {
    if (e instanceof WrongKeyError) {
      if (needsPassphrase.value) {
        error.value = t('open.wrongPass')
        phase.value = 'ready'
      } else {
        phase.value = 'wrongkey'
      }
      return
    }
    const status = (e as { statusCode?: number }).statusCode
    if (status === 404) {
      phase.value = 'gone'
    } else {
      error.value = t('open.network')
      phase.value = 'ready'
    }
  }
}

const sectorState = computed(() => {
  if (phase.value === 'revealed') return 'delivered'
  if (phase.value === 'gone' || phase.value === 'nokey') return 'gone'
  if (phase.value === 'wrongkey' || error.value) return 'error'
  return 'ready'
})

onBeforeUnmount(() => {
  secret.value = ''
  sealed.value = null
})
</script>

<template>
  <div class="grid">
    <div class="open">
      <Module v-if="phase === 'checking'" :title="t('open.checking')">
        <p class="lead soft" aria-live="polite">{{ t('open.checking') }}</p>
        <div class="pad" />
      </Module>

      <Module v-else-if="phase === 'nokey'" :title="t('open.noKey.header')" out>
        <p class="lead">{{ t('open.noKey.lead') }}</p>
        <div class="actions"><UiButton variant="outline" to="/">{{ t('open.gone.action') }}</UiButton></div>
      </Module>

      <Module v-else-if="phase === 'gone'" :title="t('open.gone.header')" out>
        <p class="lead">{{ t('open.gone.lead') }}</p>
        <div class="actions"><UiButton variant="outline" to="/">{{ t('open.gone.action') }}</UiButton></div>
      </Module>

      <Module v-else-if="phase === 'wrongkey'" :title="t('state.error')" out>
        <p class="lead">{{ t('open.wrongKey') }}</p>
        <div class="actions"><UiButton variant="outline" to="/">{{ t('open.gone.action') }}</UiButton></div>
      </Module>

      <form v-else-if="phase === 'ready' || phase === 'revealing'" novalidate @submit.prevent="reveal">
        <Module :title="t('open.header')">
          <template v-if="expiresAt" #readout>{{ t('open.expires', { time: formatDateTime(expiresAt, true) }) }}</template>
          <p class="lead">{{ t('open.lead') }}</p>
          <p class="warn"><Icon name="alert" />{{ t('open.warn') }}</p>
          <div v-if="needsPassphrase" class="field pass">
            <label for="pass" class="plabel">{{ t('open.passphrase') }}</label>
            <input id="pass" v-model="passphrase" class="input" type="password" autocomplete="off" required :aria-describedby="error ? 'pass-error' : 'pass-note'" />
            <p id="pass-note" class="note">{{ t('open.passphrase.note') }}</p>
          </div>
          <div class="actions">
            <UiButton type="submit" :busy="phase === 'revealing'"><Icon name="eye" />{{ phase === 'revealing' ? t('open.revealing') : t('open.reveal') }}</UiButton>
          </div>
          <p v-if="error" id="pass-error" class="error" role="alert"><Icon name="alert" />{{ error }}</p>
        </Module>
      </form>

      <Module v-else :title="t('revealed.header')" class="lit">
        <template #readout>{{ t('state.delivered') }}</template>
        <div class="beam" aria-hidden="true" />
        <p class="lead">{{ t('revealed.lead') }}</p>
        <div class="field">
          <pre id="secret-out" class="secret-text mono" tabindex="0">{{ secret }}</pre>
        </div>
        <div class="actions">
          <CopyButton :text="secret" :label="t('revealed.copy')" :done="t('revealed.copied')" variant="primary" />
          <UiButton variant="outline" to="/">{{ t('revealed.done') }}</UiButton>
        </div>
      </Module>
    </div>

    <ServerView :ciphertext="sealed?.ciphertext ?? ''" mode="stored" :stored-id="id" :state="sectorState" />
  </div>
</template>

<style scoped>
.soft {
  color: var(--text-soft);
}
.pad {
  height: 160px;
}
.warn {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 0 16px 16px;
  font-size: 14px;
  color: var(--text-soft);
  max-width: 50ch;
}
.warn svg {
  margin-top: 3px;
  color: var(--action);
}
.pass {
  border-top: 1px solid var(--rule);
}
.plabel {
  display: block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.4;
  color: var(--text-soft);
  margin-bottom: 8px;
}
.lit {
  overflow: hidden;
}
.beam {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(100deg, transparent 35%, var(--beam) 50%, transparent 65%);
  transform: translateX(-100%);
  animation: sweep var(--sweep) var(--sweep-ease) 1 forwards;
  mix-blend-mode: var(--beam-blend);
}
.secret-text {
  margin: 0;
  min-height: 160px;
  padding: 16px;
  border: 1px solid var(--rule);
  background: var(--ground);
  font-size: 17px;
  line-height: 1.6;
  max-height: min(70vh, 720px);
  overflow: auto;
  overscroll-behavior: contain;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  animation: lit var(--sweep) var(--sweep-ease) 1 both;
}
@keyframes sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
@keyframes lit {
  0% {
    opacity: 0.12;
  }
  45% {
    opacity: 0.12;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}
</style>
