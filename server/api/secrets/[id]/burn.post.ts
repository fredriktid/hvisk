import { isBase64Url, sha256 } from '#shared/utils/encoding'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'burn')
  const id = requireId(getRouterParam(event, 'id'))
  const body = await readBody<{ token?: string }>(event)
  if (typeof body?.token !== 'string' || body.token.length !== 43 || !isBase64Url(body.token)) {
    throw createError({ statusCode: 400, statusMessage: 'Malformed token.' })
  }
  const { DB } = useEnv(event)

  const row = await DB.prepare('SELECT burn_hash FROM secrets WHERE id = ?1').bind(id).first<{ burn_hash: string }>()
  if (!row || !timingSafeEqual(row.burn_hash, await sha256(body.token))) {
    throw createError({ statusCode: 404, statusMessage: 'Nothing to burn. It is already gone, or the token is wrong.' })
  }

  await DB.prepare('DELETE FROM secrets WHERE id = ?1 AND burn_hash = ?2').bind(id, row.burn_hash).run()
  return { burned: true }
})
