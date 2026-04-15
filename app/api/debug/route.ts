import { cookies } from 'next/headers'
import { isValidSession } from '@/lib/auth'
import { convertToModelMessages, streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

// 一時的なデバッグ用エンドポイント（本番では削除）
export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. セッション確認
  const cookieStore = await cookies()
  const session = cookieStore.get('mh-session')
  results.sessionExists = !!session
  results.sessionValid = session ? isValidSession(session.value) : false

  // 2. Anthropic APIキー確認
  results.apiKeySet = !!process.env.ANTHROPIC_API_KEY
  results.apiKeyPrefix = process.env.ANTHROPIC_API_KEY?.slice(0, 10)

  // 3. convertToModelMessages 確認
  const testMessages = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'テスト' }] }]
  try {
    const converted = await convertToModelMessages(testMessages as any)
    results.convertOk = true
    results.convertResult = JSON.stringify(converted).slice(0, 200)
  } catch (e: any) {
    results.convertError = e.message
  }

  // 4. Anthropic API疎通確認
  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      messages: [{ role: 'user', content: 'Hi, reply with just "OK"' }],
    })
    const text = await result.text
    results.anthropicOk = true
    results.anthropicReply = text.slice(0, 100)
  } catch (e: any) {
    results.anthropicError = e.message
  }

  return Response.json(results)
}
