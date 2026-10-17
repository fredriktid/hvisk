import type { Locale } from '~/composables/useLocale'

export interface HowSection {
  title: string
  intro?: string
  steps?: string[]
  table?: { head: [string, string]; rows: [string, string][] }
  notStored?: { label: string; items: string[] }
  then?: string
}

const en: HowSection[] = [
  {
    title: 'When you make a link',
    steps: [
      'Your browser makes a random 256-bit key and a random salt. If you set a password, it is stretched with PBKDF2-SHA256 (600 000 rounds) and mixed into the key with HKDF.',
      'The secret is encrypted with AES-256-GCM. GCM adds an authentication tag, so a changed ciphertext or a wrong key is detected instead of shown as garbage.',
      'The browser sends only the ciphertext, the iv and the salt. The server answers with a random id and a burn token.',
      'The link is /s/‹id›#‹key›. Everything after # is the fragment. Browsers never send the fragment in a request, so the key does not reach Hvisk, its logs, or Cloudflare.',
    ],
  },
  {
    title: 'When the link is opened',
    steps: [
      'The page first asks the server if the secret is still there. That does not delete anything, so a chat app that previews the link does no harm.',
      'When the receiver presses Reveal and destroy, one database statement deletes the row and returns it. Two people opening the same link at the same moment cannot both get it.',
      'The browser decrypts with the key from the fragment, then removes the key from the address bar so it does not stay in history.',
      'A password that does not fit can be tried again while the page is open. The server copy is already gone, so a reload shows nothing.',
    ],
  },
  {
    title: 'What the database holds',
    intro: 'One row per secret, in Cloudflare D1:',
    table: {
      head: ['Column', 'What it is'],
      rows: [
        ['id', 'Random 128-bit id, the part of the link before #'],
        ['ciphertext', 'AES-256-GCM output. Random bytes without the key'],
        ['iv', 'Random 96-bit nonce for GCM'],
        ['salt', 'Random 128-bit salt for HKDF and PBKDF2'],
        ['has_passphrase', 'Yes or no, so the receive page can ask for it'],
        ['burn_hash', 'SHA-256 of the burn token, so the sender can delete early'],
        ['created_at, expires_at', 'Unix timestamps'],
      ],
    },
    notStored: {
      label: 'Not stored, ever:',
      items: ['the key', 'the plain text', 'the password', 'your IP address', 'your browser', 'cookies or sessions'],
    },
    then: 'Say the database leaks, or someone gets in:',
    steps: [
      'They can see how many secrets exist, how large they are, and when they expire. They can delete them.',
      'They cannot read a secret. The ciphertext is AES-256-GCM output under a key they do not have, and guessing a 256-bit key is not a realistic attack.',
      'They cannot brute-force a password. The password is mixed with the link key, so without the link there is nothing to test a guess against.',
    ],
  },
  {
    title: 'What Hvisk does not protect against',
    steps: [
      'Someone who gets the link before the receiver. The link is the key. Send it over a channel you trust, or add a password and send that another way.',
      'A compromised device or browser on either end. Encryption in the browser is only as good as the browser.',
      'The site itself serving different code. Hvisk is open source, but you still trust hvisk.dev to serve the code it says it does. Read the source or run it yourself if that matters to you.',
    ],
  },
  {
    title: 'Limits and housekeeping',
    steps: [
      'A secret can be up to 32 kB of text.',
      'Lifetimes run from 1 hour to 30 days. Expired secrets are refused on read and deleted every hour by a scheduled job.',
      'Create, peek, open and burn requests are rate limited per IP address.',
      'There is no tracking and there are no ads: no analytics script, no cookies, no third-party request of any kind. The Content-Security-Policy forbids them, so even a mistake could not add one.',
      'Every response carries a strict Content-Security-Policy with no inline scripts and no third-party sources, a no-referrer policy, no framing, and the receive pages are never cached.',
      'It runs on Cloudflare Workers with D1. The same build runs locally in workerd through wrangler, and in Docker.',
    ],
  },
]

const nb: HowSection[] = [
  {
    title: 'Når du lager en lenke',
    steps: [
      'Nettleseren din lager en tilfeldig 256-bits nøkkel og et tilfeldig salt. Setter du et passord, strekkes den med PBKDF2-SHA256 (600 000 runder) og blandes inn i nøkkelen med HKDF.',
      'Hemmeligheten krypteres med AES-256-GCM. GCM legger til en autentiseringskode, så en endret chiffertekst eller en feil nøkkel oppdages i stedet for å vises som støy.',
      'Nettleseren sender bare chifferteksten, iv-en og saltet. Serveren svarer med en tilfeldig id og en brennekode.',
      'Lenken er /s/‹id›#‹nøkkel›. Alt etter # er fragmentet. Nettlesere sender aldri fragmentet i en forespørsel, så nøkkelen når ikke Hvisk, loggene eller Cloudflare.',
    ],
  },
  {
    title: 'Når lenken åpnes',
    steps: [
      'Siden spør først serveren om hemmeligheten fortsatt finnes. Det sletter ingenting, så en chat-app som forhåndsviser lenken gjør ingen skade.',
      'Når mottakeren trykker Vis og slett, sletter én databasesetning raden og returnerer den. To som åpner samme lenke i samme øyeblikk kan ikke begge få den.',
      'Nettleseren dekrypterer med nøkkelen fra fragmentet, og fjerner så nøkkelen fra adresselinjen så den ikke blir liggende i historikken.',
      'Et passord som ikke passer kan prøves igjen så lenge siden er åpen. Serverkopien er allerede borte, så en oppdatering viser ingenting.',
    ],
  },
  {
    title: 'Hva som lagres i databasen',
    intro: 'Én rad per hemmelighet, i Cloudflare D1:',
    table: {
      head: ['Kolonne', 'Hva det er'],
      rows: [
        ['id', 'Tilfeldig 128-bits id, delen av lenken før #'],
        ['ciphertext', 'AES-256-GCM-resultat. Tilfeldige byte uten nøkkelen'],
        ['iv', 'Tilfeldig 96-bits nonce for GCM'],
        ['salt', 'Tilfeldig 128-bits salt for HKDF og PBKDF2'],
        ['has_passphrase', 'Ja eller nei, så mottakersiden kan spørre etter det'],
        ['burn_hash', 'SHA-256 av brennekoden, så avsenderen kan slette tidlig'],
        ['created_at, expires_at', 'Unix-tidsstempler'],
      ],
    },
    notStored: {
      label: 'Lagres aldri:',
      items: ['nøkkelen', 'klarteksten', 'passordet', 'IP-adressen din', 'nettleseren din', 'cookies eller økter'],
    },
    then: 'Si at databasen lekkes, eller at noen får tilgang:',
    steps: [
      'De kan se hvor mange hemmeligheter som finnes, hvor store de er, og når de utløper. De kan slette dem.',
      'De kan ikke lese en hemmelighet. Chifferteksten er AES-256-GCM-resultat under en nøkkel de ikke har, og å gjette en 256-bits nøkkel er ikke et realistisk angrep.',
      'De kan ikke knekke et passord med rå kraft. Passordet er blandet med lenkenøkkelen, så uten lenken finnes det ingenting å teste en gjetning mot.',
    ],
  },
  {
    title: 'Det Hvisk ikke beskytter mot',
    steps: [
      'Noen som får tak i lenken før mottakeren. Lenken er nøkkelen. Send den over en kanal du stoler på, eller legg til et passord og send det på en annen måte.',
      'En kompromittert enhet eller nettleser i en av endene. Kryptering i nettleseren er ikke bedre enn nettleseren.',
      'At nettstedet selv serverer annen kode. Hvisk er åpen kildekode, men du stoler fortsatt på at hvisk.dev serverer koden den sier. Les kildekoden eller kjør den selv hvis det betyr noe for deg.',
    ],
  },
  {
    title: 'Grenser og vedlikehold',
    steps: [
      'En hemmelighet kan være opptil 32 kB tekst.',
      'Levetid fra 1 time til 30 dager. Utløpte hemmeligheter avvises ved lesing og slettes hver time av en planlagt jobb.',
      'Forespørsler for å lage, sjekke, åpne og brenne er begrenset per IP-adresse.',
      'Det er ingen sporing og ingen reklame: ingen analyseskript, ingen cookies, ingen forespørsler til tredjeparter. Content-Security-Policy forbyr dem, så selv en feil kunne ikke lagt til en.',
      'Hvert svar har en streng Content-Security-Policy uten innebygde skript og uten tredjepartskilder, ingen referrer, ingen innramming, og mottakersidene mellomlagres aldri.',
      'Det kjører på Cloudflare Workers med D1. Samme bygg kjører lokalt i workerd gjennom wrangler, og i Docker.',
    ],
  },
]

export const how: Record<Locale, HowSection[]> = { en, nb }
