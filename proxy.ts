import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'mh-session'
const PUBLIC_PATHS = ['/login', '/api/auth', '/api/debug']

/** Web Crypto API（Edge Runtime対応）でHMAC-SHA256を計算 */
async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // パブリックパスはスルー
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(COOKIE_NAME)
  if (!cookie?.value) {
    return redirectToLogin(request, pathname)
  }

  const secret =
    process.env.SESSION_SECRET ?? 'fallback-dev-secret-change-in-production!!'
  const expected = await hmacHex(secret, 'authenticated')

  if (cookie.value !== expected) {
    return redirectToLogin(request, pathname)
  }

  return NextResponse.next()
}

function redirectToLogin(request: NextRequest, from: string) {
  const url = new URL('/login', request.url)
  if (from !== '/') url.searchParams.set('from', from)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)',
  ],
}
