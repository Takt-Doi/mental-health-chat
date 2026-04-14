import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

export async function GET() {
  const res = NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')
  )
  res.cookies.set(SESSION_COOKIE.name, '', {
    ...SESSION_COOKIE.options,
    maxAge: 0,
  })
  return res
}
