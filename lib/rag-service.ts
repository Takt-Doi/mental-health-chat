/**
 * RAG サービス — OneDrive から技法知識ベースを取得してキーワード検索する。
 * 教科書の内容は GitHub にも Vercel のコードにも含まれず、
 * ARMG テナントの OneDrive 上にのみ存在する。
 */

interface KnowledgeChunk {
  technique: string
  issue_type: string
  source: string
  text: string
}

interface KnowledgeBase {
  version: string
  created: string
  chunk_count: number
  chunks: KnowledgeChunk[]
}

// モジュールスコープキャッシュ（同一インスタンス内でリクエスト間共有）
let _chunks: KnowledgeChunk[] | null = null
let _accessToken: string | null = null
let _tokenExpiresAt = 0

// ---- Microsoft Graph 認証 ----------------------------------------

async function refreshAccessToken(): Promise<string> {
  // キャッシュが有効なら再利用（5分バッファ）
  if (_accessToken && Date.now() < _tokenExpiresAt - 5 * 60 * 1000) {
    return _accessToken
  }

  const tenantId = process.env.ONEDRIVE_TENANT_ID
  const clientId = process.env.ONEDRIVE_CLIENT_ID
  const refreshToken = process.env.ONEDRIVE_REFRESH_TOKEN

  if (!tenantId || !clientId || !refreshToken) {
    throw new Error(
      'RAG: ONEDRIVE_TENANT_ID / CLIENT_ID / REFRESH_TOKEN が未設定です'
    )
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: refreshToken,
        scope: 'https://graph.microsoft.com/Files.Read offline_access',
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`RAG: トークン更新失敗 ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  _accessToken = data.access_token as string
  _tokenExpiresAt = Date.now() + (data.expires_in as number) * 1000
  return _accessToken
}

// ---- 知識ベースの取得 --------------------------------------------

async function loadKnowledgeBase(): Promise<KnowledgeChunk[]> {
  if (_chunks) return _chunks

  const fileId = process.env.ONEDRIVE_FILE_ID
  if (!fileId) {
    throw new Error('RAG: ONEDRIVE_FILE_ID が未設定です')
  }

  const token = await refreshAccessToken()

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    throw new Error(`RAG: ファイル取得失敗 ${res.status}`)
  }

  const kb: KnowledgeBase = await res.json()
  _chunks = kb.chunks
  console.log(`[RAG] 知識ベース読み込み完了: ${_chunks.length} チャンク`)
  return _chunks
}

// ---- キーワードマッチ検索 ----------------------------------------

const STOPWORDS = new Set([
  'です', 'ます', 'した', 'ている', 'について', 'という', 'ため',
  'こと', 'もの', 'ので', 'から', 'けど', 'でも', 'って', 'たい',
  'いる', 'ある', 'する', 'なる', 'れる', 'られる', 'てい', 'てし',
  'ない', 'ので', 'ます', 'でし', 'まし', 'てく', 'てあ',
])

function extractTerms(text: string): string[] {
  const raw = text.split(/[\s、。「」『』（）・…　\n]+/)
  const terms = raw.filter(
    (t) => t.length >= 2 && !STOPWORDS.has(t)
  )
  return [...new Set(terms)]
}

function scoreChunk(chunk: KnowledgeChunk, terms: string[]): number {
  const haystack = chunk.text + ' ' + chunk.technique
  let score = 0
  for (const term of terms) {
    if (haystack.includes(term)) {
      score += term.length // 長いマッチほど高スコア
    }
  }
  return score
}

// ---- 公開API -------------------------------------------------------

/**
 * ユーザーメッセージに関連する技法チャンクを取得し、
 * システムプロンプトに注入するテキストを返す。
 * OneDrive 未設定の場合は空文字列を返す（RAGなしでフォールバック）。
 */
export async function retrieveTechniqueContext(
  userMessage: string,
  topK = 3
): Promise<string> {
  // 環境変数が未設定なら RAG スキップ
  if (!process.env.ONEDRIVE_FILE_ID) return ''

  try {
    const chunks = await loadKnowledgeBase()
    const terms = extractTerms(userMessage)

    if (terms.length === 0) return ''

    const scored = chunks
      .map((chunk) => ({ chunk, score: scoreChunk(chunk, terms) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    if (scored.length === 0) return ''

    const lines = scored.map(
      ({ chunk }) => `【${chunk.technique}】\n${chunk.text.slice(0, 400)}`
    )
    return lines.join('\n\n---\n\n')
  } catch (err) {
    // RAG 失敗はチャットの動作を止めない
    console.error('[RAG] エラー（チャットは継続）:', err)
    return ''
  }
}
