<script setup lang="ts">
import { seal } from '#shared/utils/crypto'
import { DEFAULT_LIFETIME, LIFETIMES, MAX_PLAINTEXT_BYTES, type Lifetime } from '#shared/utils/limits'

const { t, formatDateTime, formatBytes } = useLocale()

const text = ref('')
const lifetime = ref<number>(DEFAULT_LIFETIME)
const passphrase = ref('')
const sealing = ref(false)
const error = ref<string | null>(null)
const preview = ref('')
const result = ref<{ id: string; key: string; burnToken: string; expiresAt: number; ciphertext: string } | null>(null)

const timeKeys: Record<Lifetime, '1h' | '1d' | '7d' | '30d'> = { 3600: '1h', 86400: '1d', 604800: '7d', 2592000: '30d' }
const options = computed(() => LIFETIMES.map((value) => ({ value, short: t(`time.${timeKeys[value]}`), long: t(`time.${timeKeys[value]}.long`) })))
const chosen = computed(() => options.value.find((o) => o.value === lifetime.value))
const bytes = computed(() => new TextEncoder().encode(text.value).length)
const tooLong = computed(() => bytes.value > MAX_PLAINTEXT_BYTES)

let previewTimer: ReturnType<typeof setTimeout> | undefined
watch(text, (value) => {
  clearTimeout(previewTimer)
  if (!value) {
    preview.value = ''
    return
  }
  previewTimer = setTimeout(async () => {
    const { sealed } = await seal(value.slice(0, 4096))
    preview.value = sealed.ciphertext
  }, 120)
})

const origin = computed(() => (import.meta.client ? location.origin : ''))
const link = computed(() => (result.value ? `${origin.value}/s/${result.value.id}#${result.value.key}` : ''))
const burnLink = computed(() => (result.value ? `${origin.value}/b/${result.value.id}#${result.value.burnToken}` : ''))

async function submit() {
  error.value = null
  if (!text.value.trim()) {
    error.value = t('create.error.empty')
    return
  }
  if (tooLong.value) {
    error.value = t('create.error.tooLong', { max: formatBytes(MAX_PLAINTEXT_BYTES) })
    return
  }
  sealing.value = true
  try {
    const { key, sealed } = await seal(text.value, passphrase.value || undefined)
    const res = await $fetch<{ id: string; burnToken: string; expiresAt: number }>('/api/secrets', {
      method: 'POST',
      body: { ...sealed, lifetime: lifetime.value as Lifetime },
    })
    result.value = { ...res, key, ciphertext: sealed.ciphertext }
    text.value = ''
    passphrase.value = ''
    await nextTick()
    document.getElementById('link-field')?.focus()
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode
    error.value = status === 429 ? t('create.error.rate') : t('create.error.network')
  } finally {
    sealing.value = false
  }
}

function reset() {
  result.value = null
  preview.value = ''
}
</script>

<template>
  <div class="grid">
    <form v-if="!result" class="create" novalidate @submit.prevent="submit">
      <Module :title="t('create.header')">
        <template #readout>{{ t('create.readout', { lifetime: chosen?.short ?? '' }) }}</template>
        <div class="field">
          <label for="secret" class="sr-only">{{ t('create.label') }}</label>
          <textarea
            id="secret"
            v-model="text"
            class="secret"
            :placeholder="t('create.placeholder')"
            rows="9"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :aria-invalid="tooLong || undefined"
            aria-describedby="size"
          />
          <p id="size" class="size mono" :class="{ bad: tooLong }">{{ t('create.size', { used: formatBytes(bytes), max: formatBytes(MAX_PLAINTEXT_BYTES) }) }}</p>
        </div>
        <div class="row">
          <Module :title="t('create.lifetime')" level="h3" sub>
            <div class="field">
              <Segmented v-model="lifetime" name="lifetime" :label="t('create.lifetime')" :options="options" />
              <p class="note">{{ t('create.lifetime.note', { time: chosen?.long ?? '' }) }}</p>
            </div>
          </Module>
          <Module :title="t('create.passphrase')" level="h3" sub>
            <template #tag>{{ t('create.optional') }}</template>
            <div class="field">
              <label for="passphrase" class="sr-only">{{ t('create.passphrase') }}</label>
              <input id="passphrase" v-model="passphrase" class="input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" :placeholder="t('create.passphrase.placeholder')" />
              <p class="note">{{ t('create.passphrase.note') }}</p>
            </div>
          </Module>
        </div>
        <div class="actions">
          <UiButton type="submit" :busy="sealing">{{ sealing ? t('create.sealing') : t('create.submit') }}</UiButton>
          <p class="note">{{ t('create.reassure') }}</p>
        </div>
        <p v-if="error" class="error" role="alert"><Icon name="alert" />{{ error }}</p>
      </Module>
    </form>

    <div v-else class="create">
      <Module :title="t('result.header')">
        <template #readout>{{ t('state.ready') }}</template>
        <p class="lead">{{ t('result.lead') }}</p>
        <div class="field">
          <label for="link-field" class="sr-only">{{ t('result.header') }}</label>
          <textarea id="link-field" class="input mono linkbox" readonly rows="2" :value="link" @focus="($event.target as HTMLTextAreaElement).select()" />
          <div class="copyrow">
            <CopyButton :text="link" :label="t('result.copy')" :done="t('result.copied')" variant="primary" lamp />
          </div>
        </div>
        <div class="row">
          <Module :title="t('result.expires')" level="h3" sub>
            <div class="field">
              <p class="mono big">{{ formatDateTime(result.expiresAt) }}</p>
              <p class="note">{{ t('result.expires.note') }}</p>
            </div>
          </Module>
          <Module :title="t('result.burn')" level="h3" sub>
            <div class="field">
              <CopyButton :text="burnLink" :label="t('result.burn.copy')" :done="t('result.copied')" />
              <p class="note">{{ t('result.burn.note') }}</p>
            </div>
          </Module>
        </div>
        <div class="actions">
          <UiButton variant="outline" @click="reset">{{ t('result.another') }}</UiButton>
        </div>
      </Module>
    </div>

    <ServerView :ciphertext="result ? result.ciphertext : preview" :mode="result ? 'stored' : 'live'" :stored-id="result?.id" state="ready" />
  </div>
</template>

<style scoped>
.secret {
  display: block;
  width: 100%;
  min-height: 240px;
  padding: 14px 16px;
  border: 1px solid var(--rule);
  background: var(--ground);
  color: var(--text);
  font-size: 18px;
  line-height: 1.5;
  resize: vertical;
}
.secret:focus-visible {
  outline-offset: 0;
  border-color: var(--focus);
}
.size {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-soft);
  text-align: right;
}
.size.bad {
  color: var(--bad);
  font-weight: 700;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--rule);
}
.row > :first-child {
  border-right: 1px solid var(--rule);
}
@media (max-width: 720px) {
  .row {
    grid-template-columns: 1fr;
  }
  .row > :first-child {
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }
}
.linkbox {
  display: block;
  height: auto;
  padding: 12px 14px;
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: 0.02em;
  overflow-wrap: anywhere;
  resize: none;
}
.copyrow {
  margin-top: 12px;
}
.big {
  font-size: 18px;
  font-weight: 700;
  min-height: 44px;
  display: flex;
  align-items: center;
}
</style>
