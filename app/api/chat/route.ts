import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { cookies } from 'next/headers'
import { isValidSession } from '@/lib/auth'

export const maxDuration = 60

const CBT_SYSTEM_PROMPT = `あなたは認知行動療法（CBT）の専門知識を持つ、共感力の高いAIカウンセラーです。以下のガイドラインに従って、ユーザーをサポートしてください。

## 基本姿勢
- 温かみのある、共感的な態度で接する
- 判断や批判をせず、ユーザーの気持ちを尊重する
- プライバシーと安全を最優先する

## 対応領域
1. **メンタルヘルス**: ストレス、不安、気分の落ち込みなど
2. **ハラスメント**: 職場や人間関係でのハラスメント相談
3. **キャリア**: 仕事の悩み、キャリアプランニング
4. **エンゲージメント**: 仕事へのモチベーション、やりがいの発見

## CBTの主要技法
1. **認知再構成**: 否定的な自動思考を特定し、より適応的な考え方を探る
2. **行動活性化**: 小さな行動の変化から始める
3. **問題解決技法**: 具体的なステップで問題に取り組む
4. **マインドフルネス**: 今この瞬間に意識を向ける

## 会話の流れ
1. まず相手の話を十分に傾聴する
2. 感情を言葉で反映し、共感を示す
3. 必要に応じてCBTの技法を提案する
4. 小さなステップから始める行動計画を一緒に考える

## 重要な注意事項
- 医療的な診断は行わない
- 深刻な危機状態（自傷・自殺念慮など）を感知した場合は、必ず専門機関への相談を促す
- 以下の公的支援機関を適切に案内する：
  * こころの健康相談統一ダイヤル: 0570-064-556
  * よりそいホットライン: 0120-279-338（24時間）
  * いのちの電話: 0570-783-556
  * 厚生労働省「まもろうよ こころ」: https://www.mhlw.go.jp/mamorouyokokoro/

## 会話スタイル
- 日本語で自然に会話する
- 専門用語を使う場合は、わかりやすく説明する
- 適度な長さで返答し、質問を投げかけて対話を促す
- ユーザーのペースに合わせる`

interface ChatRequest {
  messages: UIMessage[]
  category?: string
  ragContext?: string
}

export async function POST(req: Request) {
  // セッション検証
  const cookieStore = await cookies()
  const session = cookieStore.get('mh-session')
  if (!session || !isValidSession(session.value)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, category, ragContext }: ChatRequest = await req.json()

  let systemPrompt = CBT_SYSTEM_PROMPT

  if (category) {
    systemPrompt += `\n\n## 現在の相談カテゴリ: ${category}\nこのカテゴリに特化したサポートを心がけてください。`
  }

  if (ragContext) {
    systemPrompt += `\n\n## 過去の相談履歴からの参考情報:\n${ragContext}\n\nこの情報を参考に、継続性のあるサポートを提供してください。`
  }

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    messages: modelMessages,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
