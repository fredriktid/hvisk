# Security model

This describes what Hvisk does, exactly as the code does it. If the code and this file disagree, the code is the truth and the file is a bug.

## Creating a secret

1. The browser generates `linkKey` (32 random bytes), `salt` (16) and `iv` (12) with `crypto.getRandomValues`.
2. If a password was given: `passKey = PBKDF2-SHA256(password, salt, 600 000 rounds)`, 32 bytes.
3. `aesKey = HKDF-SHA256(ikm = linkKey || passKey?, salt, info = "hvisk/v1/aes-gcm")`, 256 bits.
4. `ciphertext = AES-256-GCM(aesKey, iv, plaintext)`. The GCM tag means a wrong key or a tampered ciphertext fails loudly.
5. `POST /api/secrets` with `{ciphertext, iv, salt, hasPassphrase, lifetime}`. The server validates shape and size, generates a random 128-bit `id` and a random 256-bit `burnToken`, stores `sha256(burnToken)`, and returns `{id, burnToken, expiresAt}`.
6. The link is `/s/<id>#<linkKey>`. The burn link is `/b/<id>#<burnToken>`.

The fragment is never part of an HTTP request. `Referrer-Policy: no-referrer` and `<meta name="referrer" content="no-referrer">` keep the URL out of outbound referrers too.

See `shared/utils/crypto.ts`.

## Opening a secret

1. The receive page is client-rendered. It reads the key from `location.hash` and checks its shape.
2. `GET /api/secrets/<id>` tells it whether the secret is still there. Nothing is deleted. Link previews by chat apps land here.
3. On "Reveal and destroy": `POST /api/secrets/<id>/open` runs `DELETE FROM secrets WHERE id = ? AND expires_at > ? RETURNING ...`. One statement, so concurrent readers cannot both succeed.
4. The browser decrypts, shows the secret, and calls `history.replaceState` to remove the key from the address bar and history.
5. A wrong password can be retried while the page is open; the ciphertext is held in memory. Leaving or reloading the page loses it. The page says so.

## What the database holds

| column | content |
| --- | --- |
| `id` | random 128-bit, base64url |
| `ciphertext` | AES-256-GCM output, base64url |
| `iv` | random 96-bit nonce |
| `salt` | random 128-bit salt |
| `has_passphrase` | 0 or 1 |
| `burn_hash` | SHA-256 of the burn token |
| `created_at`, `expires_at` | unix seconds |

Not stored: the key, the plaintext, the password, IP addresses, user agents, cookies, sessions.

## Threat model

Protected against:

- **Database read access.** Ciphertext under a key the database never had. Guessing a 256-bit key is not realistic.
- **Password brute force from the database.** The password is mixed with `linkKey`; without the link there is nothing to verify a guess against.
- **Replay.** A row is deleted on first successful open. Later opens get 404.
- **Race.** Atomic delete-and-return.
- **Tampering.** GCM authentication.
- **Accidental burn.** Peek does not delete; reveal needs an explicit press.
- **Leaking the key through referrers, logs or history.** Fragment only, no-referrer, `replaceState` after reveal, `Cache-Control: no-store` on `/s/*`, `/b/*` and `/api/*`.
- **Script injection.** `script-src 'self'` plus SHA-256 hashes for Nuxt's own inline config script, computed per response in `server/plugins/csp.ts`. No `unsafe-inline` for scripts, no third-party origins anywhere.
- **Framing, MIME sniffing, downgrade.** `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, HSTS.
- **Abuse.** Cloudflare rate limiting binding per IP on every API route, 32 kB size limit, lifetimes capped at 30 days, hourly cleanup of expired rows.

Not protected against:

- **Someone who gets the link.** The link is the key. Use a channel you trust, or add a password and send it another way.
- **A compromised browser or device** on either end.
- **A malicious or compromised hvisk.dev** serving different JavaScript. The code is open; run it yourself if that matters.
- **Metadata.** The server knows that a secret of a certain size exists and when it expires. It does not log who created or opened it, but Cloudflare's own request logs exist.

## Reporting

Email fredrik@tidemann.dev.
