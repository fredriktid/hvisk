import { CRYPTO_VERSION, type Sealed } from '#shared/utils/crypto'

// One statement deletes and returns the row, so two readers racing for the same id cannot both win.
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'open')
  const id = requireId(getRouterParam(event, 'id'))
  const { DB } = useEnv(event)

  const row = await DB.prepare(
    `DELETE FROM secrets WHERE id = ?1 AND expires_at > ?2
     RETURNING ciphertext, iv, salt, has_passphrase`,
  )
    .bind(id, now())
    .first<{ ciphertext: string; iv: string; salt: string; has_passphrase: number }>()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'This secret has already been opened, or it expired.' })

  const sealed: Sealed = {
    v: CRYPTO_VERSION,
    ciphertext: row.ciphertext,
    iv: row.iv,
    salt: row.salt,
    hasPassphrase: row.has_passphrase === 1,
  }
  return sealed
})
