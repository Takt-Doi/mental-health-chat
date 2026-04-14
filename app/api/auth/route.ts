import { NextResponse } from 'next/server'
import { verifyPassphrase, createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { passphrase } = await req.json()

    if (!passphrase || typeof passphrase !== 'string') {
      return NextResponse.json(
        { error: '合言葉を入力してください' },
        { status: 400 }
      )
    }

    if (!verifyPassphrase(passphrase)) {
      // タイミング攻撃対策のため少し待機
      await new Promise((r) => setTimeout(r, 300))
      return NextResponse.json(
        { error: '合言葉が正しくありません' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(
      SESSION_COOKIE.name,
      createSessionToken(),
      SESSION_COOKIE.options
    )
    return res
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
