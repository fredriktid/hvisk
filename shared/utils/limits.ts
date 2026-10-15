export const LIFETIMES = [3600, 86400, 604800, 2592000] as const
export type Lifetime = (typeof LIFETIMES)[number]
export const DEFAULT_LIFETIME: Lifetime = 604800

export const MAX_PLAINTEXT_BYTES = 32 * 1024
export const MAX_CIPHERTEXT_CHARS = Math.ceil(((MAX_PLAINTEXT_BYTES + 16) * 4) / 3) + 4

export const ID_CHARS = 22 // 16 bytes base64url
export const KEY_CHARS = 43 // 32 bytes base64url
