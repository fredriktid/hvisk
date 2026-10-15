import { describe, expect, it } from 'vitest'
import { open, seal, WrongKeyError } from '../shared/utils/crypto'
import { fromBase64Url, toBase64Url } from '../shared/utils/encoding'

describe('seal and open', () => {
  it('round-trips text', async () => {
    const { key, sealed } = await seal('hunter2 🔑 æøå')
    expect(sealed.hasPassphrase).toBe(false)
    expect(await open(sealed, key)).toBe('hunter2 🔑 æøå')
  })

  it('uses a fresh key and iv each time', async () => {
    const a = await seal('same')
    const b = await seal('same')
    expect(a.key).not.toBe(b.key)
    expect(a.sealed.iv).not.toBe(b.sealed.iv)
    expect(a.sealed.ciphertext).not.toBe(b.sealed.ciphertext)
  })

  it('fails with the wrong link key', async () => {
    const { key, sealed } = await seal('secret')
    const bytes = fromBase64Url(key)
    bytes[0] ^= 1
    await expect(open(sealed, toBase64Url(bytes))).rejects.toBeInstanceOf(WrongKeyError)
  })

  it('needs the passphrase when one was set', async () => {
    const { key, sealed } = await seal('secret', 'correct horse')
    expect(sealed.hasPassphrase).toBe(true)
    await expect(open(sealed, key)).rejects.toBeInstanceOf(WrongKeyError)
    await expect(open(sealed, key, 'wrong')).rejects.toBeInstanceOf(WrongKeyError)
    expect(await open(sealed, key, 'correct horse')).toBe('secret')
  }, 20_000)

  it('ciphertext alone says nothing', async () => {
    const { sealed } = await seal('aaaaaaaaaaaaaaaaaaaa')
    expect(sealed.ciphertext).not.toContain('aaaa')
  })
})

describe('base64url', () => {
  it('round-trips bytes without padding', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255])
    const text = toBase64Url(bytes)
    expect(text).not.toMatch(/[+/=]/)
    expect(Array.from(fromBase64Url(text))).toEqual(Array.from(bytes))
  })
})
