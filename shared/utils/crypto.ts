// Runs in the browser only. The server stores what seal() returns, minus the key.
//
//   linkKey   32 random bytes, travels only in the URL fragment (#...), which browsers do not send.
//   salt      16 random bytes, stored next to the ciphertext.
//   passKey   optional, PBKDF2-SHA256(passphrase, salt, 600 000 rounds), 32 bytes.
//   aesKey    HKDF-SHA256(ikm = linkKey || passKey, salt, info = "hvisk/v1/aes-gcm"), 256 bits.
//   cipher    AES-256-GCM(aesKey, iv = 12 random bytes, plaintext).
//
// Without linkKey the ciphertext is random bytes to anyone, including someone holding the database.

import { fromBase64Url, randomBytes, toBase64Url } from './encoding'

export const CRYPTO_VERSION = 1
export const PBKDF2_ROUNDS = 600_000
const HKDF_INFO = new TextEncoder().encode('hvisk/v1/aes-gcm')

export interface Sealed {
  v: typeof CRYPTO_VERSION
  ciphertext: string
  iv: string
  salt: string
  hasPassphrase: boolean
}

export class WrongKeyError extends Error {
  constructor() {
    super('The key or passphrase does not fit this secret.')
    this.name = 'WrongKeyError'
  }
}

async function deriveAesKey(linkKey: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>, passphrase?: string): Promise<CryptoKey> {
  let ikm: Uint8Array<ArrayBuffer> = linkKey
  if (passphrase) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveBits'])
    const passKey = new Uint8Array(
      await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ROUNDS }, base, 256),
    )
    ikm = new Uint8Array(linkKey.length + passKey.length)
    ikm.set(linkKey)
    ikm.set(passKey, linkKey.length)
  }
  const hkdf = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: HKDF_INFO },
    hkdf,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function seal(plaintext: string, passphrase?: string): Promise<{ key: string; sealed: Sealed }> {
  const linkKey = randomBytes(32)
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const aesKey = await deriveAesKey(linkKey, salt, passphrase || undefined)
  const data = new TextEncoder().encode(plaintext)
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, data))
  return {
    key: toBase64Url(linkKey),
    sealed: {
      v: CRYPTO_VERSION,
      ciphertext: toBase64Url(ciphertext),
      iv: toBase64Url(iv),
      salt: toBase64Url(salt),
      hasPassphrase: Boolean(passphrase),
    },
  }
}

export async function open(sealed: Sealed, key: string, passphrase?: string): Promise<string> {
  if (sealed.v !== CRYPTO_VERSION) throw new Error(`Unknown version ${sealed.v}`)
  const linkKey = fromBase64Url(key)
  if (linkKey.length !== 32) throw new WrongKeyError()
  const salt = fromBase64Url(sealed.salt)
  const iv = fromBase64Url(sealed.iv)
  const aesKey = await deriveAesKey(linkKey, salt, passphrase || undefined)
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, fromBase64Url(sealed.ciphertext))
    return new TextDecoder().decode(plain)
  } catch {
    throw new WrongKeyError()
  }
}

export function groups(ciphertext: string, perRow = 3, rows = 6): string[] {
  const out: string[] = []
  const clean = ciphertext.replace(/[-_]/g, (c) => (c === '-' ? '7' : '2')).toUpperCase()
  for (let r = 0; r < rows; r++) {
    const row: string[] = []
    for (let g = 0; g < perRow; g++) {
      const start = (r * perRow + g) * 5
      row.push(clean.slice(start, start + 5).padEnd(5, '·'))
    }
    out.push(row.join(' '))
  }
  return out
}
