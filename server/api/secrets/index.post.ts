import { LIFETIMES, MAX_CIPHERTEXT_CHARS, type Lifetime } from '#shared/utils/limits'
import { isBase64Url, randomBytes, sha256, toBase64Url } from '#shared/utils/encoding'
import { CRYPTO_VERSION } from '#shared/utils/crypto'

interface Body {
  v: number
  ciphertext: string
  iv: string
  salt: string
  hasPassphrase: boolean
  lifetime: Lifetime
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'create')
  const body = await readBody<Partial<Body>>(event)

  if (body?.v !== CRYPTO_VERSION) throw createError({ statusCode: 400, statusMessage: 'Unknown format version.' })
  if (typeof body.ciphertext !== 'string' || !isBase64Url(body.ciphertext, MAX_CIPHERTEXT_CHARS) || body.ciphertext.length < 22) {
    throw createError({ statusCode: 400, statusMessage: 'Ciphertext is missing, malformed or too large.' })
  }
  if (typeof body.iv !== 'string' || !isBase64Url(body.iv, 16) || body.iv.length !== 16) {
    throw createError({ statusCode: 400, statusMessage: 'Malformed iv.' })
  }
  if (typeof body.salt !== 'string' || !isBase64Url(body.salt, 22) || body.salt.length !== 22) {
    throw createError({ statusCode: 400, statusMessage: 'Malformed salt.' })
  }
  if (!LIFETIMES.includes(body.lifetime as Lifetime)) {
    throw createError({ statusCode: 400, statusMessage: 'Lifetime must be one of the offered values.' })
  }

  const { DB } = useEnv(event)
  const id = toBase64Url(randomBytes(16))
  const burnToken = toBase64Url(randomBytes(32))
  const burnHash = await sha256(burnToken)
  const createdAt = now()
  const expiresAt = createdAt + (body.lifetime as Lifetime)

  await DB.prepare(
    `INSERT INTO secrets (id, ciphertext, iv, salt, has_passphrase, burn_hash, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
  )
    .bind(id, body.ciphertext, body.iv, body.salt, body.hasPassphrase ? 1 : 0, burnHash, createdAt, expiresAt)
    .run()

  setResponseStatus(event, 201)
  return { id, burnToken, expiresAt }
})
