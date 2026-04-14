'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic, Lock, AlertCircle, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!passphrase.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      })

      if (res.ok) {
        const from = searchParams.get('from') ?? '/'
        router.push(from)
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? '合言葉が正しくありません')
      }
    } catch {
      setError('接続エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* ロゴ・タイトル */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 glow-effect">
          <Mic className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">こころのサポートAI</h1>
        <p className="text-sm text-muted-foreground mt-2">
          CBTベースのカウンセリングチャットボット
        </p>
      </div>

      {/* フォームカード */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4 shrink-0" />
          <span>合言葉を入力してください</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passphrase">合言葉</Label>
            <Input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !passphrase.trim()}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                確認中...
              </>
            ) : (
              '入室する'
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        このサービスはAIによる会話サポートであり、医療行為ではありません
      </p>
    </div>
  )
}
