import { timingSafeEqual, createHmac } from 'crypto'

const COOKIE_NAME = 'mh-session'

function getSecret(): string {
  return process.env.SESSION_SECRET ?? 'fallback-dev-secret-change-in-production!!'
}

function getPassphrase(): string {
  return process.env.PASSPHRASE ?? 'test'
}

function hmacHex(secret: string, message: string): string {
  return createHmac('sha256', secret).update(message).digest('hex')
}

/** 合言葉を検証する（タイミング攻撃耐性あり） */
export function verifyPassphrase(input: string): boolean {
  const secret = getSecret()
  const a = Buffer.from(hmacHex(secret, input))
  const b = Buffer.from(hmacHex(secret, getPassphrase()))
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** セッショントークンを生成する */
export function createSessionToken(): string {
  return hmacHex(getSecret(), 'authenticated')
}

/** セッショントークンを検証する（Node.js API route用） */
export function isValidSession(token: string): boolean {
  const expected = createSessionToken()
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export const SESSION_COOKIE = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: '/',
  },
} as const
