import { ID_CHARS } from '#shared/utils/limits'
import { isBase64Url } from '#shared/utils/encoding'

export function requireId(value: unknown): string {
  if (typeof value !== 'string' || value.length !== ID_CHARS || !isBase64Url(value)) {
    throw createError({ statusCode: 400, statusMessage: 'Malformed id.' })
  }
  return value
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
