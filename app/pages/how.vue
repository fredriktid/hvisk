<script setup lang="ts">
import { how } from '~/content/how'
import { CREDIT } from '~/credit'

const { t, locale } = useLocale()
const sections = computed(() => how[locale.value])
useHead({ title: computed(() => `${t('how.title')} · Hvisk`) })
</script>

<template>
  <article class="how">
    <header class="intro">
      <h1 class="title">{{ t('how.title') }}</h1>
      <p class="lede">{{ t('how.lead') }}</p>
    </header>
    <div class="flow">
      <svg class="diagram" viewBox="0 0 560 170" aria-hidden="true">
        <g class="node"><rect x="8" y="40" width="150" height="60" /><text x="83" y="65">{{ locale === 'nb' ? 'Avsender' : 'Sender' }}</text><text x="83" y="86" class="small">AES-256-GCM</text></g>
        <g class="node"><rect x="205" y="40" width="150" height="60" /><text x="280" y="65">Hvisk</text><text x="280" y="86" class="small">ciphertext, iv, salt</text></g>
        <g class="node"><rect x="402" y="40" width="150" height="60" /><text x="477" y="65">{{ locale === 'nb' ? 'Mottaker' : 'Receiver' }}</text><text x="477" y="86" class="small">AES-256-GCM</text></g>
        <g class="node"><rect x="205" y="128" width="150" height="38" /><text x="280" y="152">D1 <tspan class="small">{{ locale === 'nb' ? 'tilfeldige byte' : 'random bytes' }}</tspan></text></g>
        <path class="wire" d="M158 70h47M355 70h47M280 100v28" />
        <path class="key" d="M83 40V18h165M312 18h165v22" />
        <text x="280" y="22" class="keylabel">#key</text>
      </svg>
    </div>
    <section v-for="s in sections" :key="s.title" class="sec">
      <h2>{{ s.title }}</h2>
      <p v-if="s.intro" class="p">{{ s.intro }}</p>
      <ol v-if="s.steps" class="steps">
        <li v-for="step in s.steps" :key="step">{{ step }}</li>
      </ol>
      <table v-if="s.table" class="table">
        <thead><tr><th>{{ s.table.head[0] }}</th><th>{{ s.table.head[1] }}</th></tr></thead>
        <tbody><tr v-for="r in s.table.rows" :key="r[0]"><td class="mono">{{ r[0] }}</td><td>{{ r[1] }}</td></tr></tbody>
      </table>
      <p v-if="s.notStored" class="p not"><b>{{ s.notStored.label }}</b> {{ s.notStored.items.join(', ') }}.</p>
    </section>
    <section class="sec">
      <p class="p"><a :href="CREDIT.source">{{ t('footer.source') }}</a></p>
    </section>
  </article>
</template>

<style scoped>
.how {
  max-width: 72ch;
}
.title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  text-wrap: balance;
}
.lede {
  margin-top: 16px;
  font-size: 19px;
  line-height: 1.55;
  color: var(--text-soft);
  max-width: 62ch;
}
.flow {
  margin: 32px 0 8px;
  border: 1px solid var(--rule);
  background: var(--panel);
  padding: 20px 16px 12px;
}
.diagram {
  width: 100%;
  height: auto;
  display: block;
}
.node rect {
  fill: var(--ground);
  stroke: var(--rule-strong);
  stroke-width: 1.5;
}
.node text {
  fill: var(--text);
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 700;
  text-anchor: middle;
}
tspan.small {
  font-weight: 400;
  font-size: 11px;
  fill: var(--text-soft);
  font-family: var(--font-mono);
}
.node .small {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  fill: var(--text-soft);
}
.wire {
  stroke: var(--rule-strong);
  stroke-width: 1.5;
  fill: none;
}
.key {
  stroke: var(--action);
  stroke-width: 2;
  stroke-dasharray: 6 5;
  fill: none;
}
.keylabel {
  fill: var(--action);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-anchor: middle;
}
.sec {
  margin-top: 40px;
}
.sec h2 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--rule-strong);
}
.p {
  margin-top: 14px;
  max-width: 66ch;
}
.steps {
  margin-top: 14px;
  padding-left: 0;
  list-style: none;
  counter-reset: step;
  display: grid;
  gap: 10px;
}
.steps li {
  counter-increment: step;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 8px;
  max-width: 66ch;
}
.steps li::before {
  content: counter(step);
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--action);
  border: 1px solid var(--rule);
  height: 24px;
  width: 24px;
  display: grid;
  place-items: center;
  font-size: 13px;
  margin-top: 1px;
}
.table {
  width: 100%;
  margin-top: 14px;
  border-collapse: collapse;
  border: 1px solid var(--rule);
  font-size: 15px;
}
.table th,
.table td {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid var(--rule);
  vertical-align: top;
}
.table th {
  background: var(--panel-2);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-soft);
}
.table td.mono {
  font-weight: 700;
  overflow-wrap: anywhere;
}
.not {
  font-size: 15px;
}
</style>
