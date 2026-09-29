const encoder = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hasSubtleCrypto(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle?.digest === 'function'
}

function fallbackHash(value: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

export function createSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes.buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const payload = `${salt}:${password}`
  if (!hasSubtleCrypto()) return fallbackHash(payload)

  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(payload)))
}
