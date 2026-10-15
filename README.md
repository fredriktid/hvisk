# Hvisk

Share a secret with a link that works once. Paste a password, a key or a note, get a link, send it. The receiver opens it one time, then it is gone.

Try it at [hvisk.dev](https://hvisk.dev). Norwegian for "whisper".

## What makes it trustworthy

- The secret is encrypted in the browser with a random 256-bit key before anything is sent.
- The key travels in the URL fragment (after `#`), which browsers never send to a server. Hvisk, its logs and Cloudflare never see it.
- The server stores ciphertext it cannot read. Someone with full database access sees random bytes.
- Opening a secret is one atomic `DELETE ... RETURNING`. Two readers racing for the same link cannot both win.
- Optional password, mixed into the key with PBKDF2 and HKDF, so the link alone is not enough.
- Lifetimes from 1 hour to 30 days, hourly cleanup, a burn link for the sender, per-IP rate limits.
- No login, no cookies, no tracking, no ads, no third-party requests. Fonts are self-hosted.
- Strict Content-Security-Policy with hashed inline scripts, no referrer, no framing, no caching on receive pages.

[SECURITY.md](SECURITY.md) has the full model, and the same text is on the site under "How it works" in English and bokmål.

## Stack

Nuxt 4 on Cloudflare Workers, Cloudflare D1 for storage, Web Crypto in the browser, pnpm. No UI library.

## Running it

```sh
pnpm install
pnpm db:migrate      # creates the local D1
pnpm dev             # http://localhost:3000 with D1 and rate limit bindings emulated
```

The local D1 is tied to the database id in the wrangler config. If that id changes, run `pnpm db:migrate` again.

Tests cover the crypto round trip:

```sh
pnpm test
```

### Production build, locally

Runs the real build inside workerd, the runtime Cloudflare uses:

```sh
pnpm build
pnpm preview         # http://localhost:8787
```

### Docker

Same thing, but in a container with the D1 file on a volume:

```sh
docker compose up --build
```

Then open http://localhost:8787. The cron job can be triggered with `curl "http://localhost:8787/__scheduled?cron=17+*+*+*+*"`.

## Deploying

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 create hvisk          # paste the id into the wrangler config
pnpm db:migrate:remote
pnpm deploy
```

Point `hvisk.dev` at the worker in the Cloudflare dashboard (Workers → Settings → Domains).

## Design notes

Night is the sea off a Norwegian lighthouse, day is the white tower in daylight. The one action is the lamp. "Fl 7d" in the header is a wink at chart notation for light characteristics: flashes once, then dark. Revealing a secret sweeps a beam across it once. Type is Atkinson Hyperlegible Next and Mono (Braille Institute, SIL Open Font License), chosen because receivers read passwords and `0`/`O`, `l`/`1` must not be confused. The fonts are self-hosted, preloaded, and have metric-matched local fallbacks so the swap does not reflow.

Language is remembered in `localStorage`, so the server renders English and the page switches to bokmål right after it loads if that is what you picked. A cookie would avoid that short flash, and would also be the first cookie on the site.

Made by [Fredrik Tidemann](https://tidemann.dev). Also: [Fikser](https://fikser.dev), a video converter that runs in your browser.
