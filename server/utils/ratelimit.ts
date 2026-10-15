import type { H3Event } from 'h3'
import { useEnv } from './env'

let warned = false

export async function enforceRateLimit(event: H3Event, scope: string): Promise<void> {
  const env = useEnv(event)
  if (!env.RATE_LIMITER) {
    if (!warned) {
      console.warn('[hvisk] RATE_LIMITER binding missing, requests are not rate limited')
      warned = true
    }
    return
  }
  const ip = getHeader(event, 'cf-connecting-ip') ?? getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const { success } = await env.RATE_LIMITER.limit({ key: `${scope}:${ip}` })
  if (!success) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Try again in a minute.' })
  }
}
