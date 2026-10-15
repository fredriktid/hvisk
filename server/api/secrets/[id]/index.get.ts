export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'peek')
  const id = requireId(getRouterParam(event, 'id'))
  const { DB } = useEnv(event)

  const row = await DB.prepare('SELECT has_passphrase, expires_at FROM secrets WHERE id = ?1 AND expires_at > ?2')
    .bind(id, now())
    .first<{ has_passphrase: number; expires_at: number }>()

  if (!row) return { state: 'gone' as const }
  return { state: 'ready' as const, hasPassphrase: row.has_passphrase === 1, expiresAt: row.expires_at }
})
