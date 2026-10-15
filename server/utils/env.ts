import type { H3Event } from 'h3'
import type { D1Database } from '@cloudflare/workers-types'

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export interface Env {
  DB: D1Database
  RATE_LIMITER?: RateLimiter
}

export function useEnv(event: H3Event): Env {
  const env = event.context.cloudflare?.env as unknown as Env | undefined
  if (!env?.DB) {
    throw createError({ statusCode: 500, statusMessage: 'Database binding DB is not configured.' })
  }
  return env
}

export function now(): number {
  return Math.floor(Date.now() / 1000)
}
