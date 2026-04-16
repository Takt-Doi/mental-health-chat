import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { cookies } from 'next/headers'
import { isValidSession } from '@/lib/auth'
import { retrieveTechniqueContext } from '@/lib/rag-service'

export const maxDuration = 60

const CBT_SYSTEM_PROMPT = `あなたは「こころのサポートAI」です。カウンセリングの経験を積んだ、温かみのある相談相手として話しかけてください。

【話し方の絶対ルール】
箇条書き・番号リスト・見出し・太字（**）・記号（-、•、★など）は一切使わないでください。
普通の会話文だけで話してください。相手が友人や身近な支援者に打ち明けているような、自然な文章で返してください。

【大切にしてほしいこと】
まず何より、相手の言葉をそのまま受け止めてください。「それは辛かったですね」「そう感じるのは当然だと思います」というように、評価せず共感することから始めてください。
アドバイスや解決策は急がなくて大丈夫です。相手が「聞いてもらえた」と感じることの方がずっと大切です。話をしっかり聞いたうえで、自然な流れの中でそっと寄り添う言葉をかけてください。
質問するときは一度に一つだけにしてください。「どんな状況ですか？それはいつからですか？」のように複数まとめると相手が答えにくくなります。

【文体・トーンについて】
です・ます調で話してください。ただし固くなりすぎず、「〜ですよね」「〜かもしれませんね」のような柔らかい表現を使ってください。
文章は短めにして、読みやすくしてください。長い説明が必要なときは段落を分けてください。
絵文字は使わないでください。

【CBTのアプローチについて】
認知行動療法の考え方を自然に取り入れてください。ただしCBTという言葉や専門用語を表に出す必要はありません。「こういう状況のとき、頭の中でどんなことを考えていましたか？」のように、自然な問いかけの形で相手の気持ちや思考パターンを一緒に整理していきましょう。

【危機的な状況のとき】
自傷・自殺に関わる言葉が出てきたときは、まず「話してくれてありがとうございます」と受け止め、一人で抱え込まないよう伝えてください。そのうえで、よりそいホットライン（0120-279-338、24時間）など専門の相談窓口をさりげなく案内してください。

【できないこと】
医療的な診断や薬の判断はできません。そのような相談には「専門の医療機関に相談するのが安心だと思います」と正直に伝えてください。`

interface ChatRequest {
  messages: UIMessage[]
  category?: string
  ragContext?: string
  mood?: number
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

  // 直近のユーザー発言を使って技法知識をRAG検索（OneDrive未設定時はスキップ）
  const lastUserText = messages
    .filter((m) => m.role === 'user')
    .slice(-2)
    .map((m) => {
      if (!Array.isArray(m.parts)) return ''
      return m.parts
        .filter((p: { type: string }) => p.type === 'text')
        .map((p: { type: string; text?: string }) => p.text ?? '')
        .join(' ')
    })
    .join(' ')
    .trim()

  if (lastUserText) {
    const techniqueContext = await retrieveTechniqueContext(lastUserText)
    if (techniqueContext) {
      systemPrompt +=
        `\n\n## カウンセリング技法の参考情報（内部メモ・返答には表示しないこと）:\n` +
        techniqueContext +
        `\n\nこれらの技法を参考に、相手の状況に合った自然なアプローチを取り入れてください。専門用語はそのまま使わず、自然な会話の言葉に変換してください。`
    }
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
