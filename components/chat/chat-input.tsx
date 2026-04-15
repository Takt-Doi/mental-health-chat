'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Send, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/hooks/use-voice-input'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'メッセージを入力...' }: ChatInputProps) {
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [textInput, setTextInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    voiceState,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript,
    error,
  } = useVoiceInput()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [textInput])

  const currentMessage = mode === 'voice' ? transcript : textInput
  const hasContent = currentMessage.trim().length > 0

  const handleSend = () => {
    const text = currentMessage.trim()
    if (!text || disabled) return
    onSend(text)
    if (mode === 'voice') {
      stopListening()
      clearTranscript()
    } else {
      setTextInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleVoice = () => {
    if (voiceState === 'listening') {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'text' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => { setMode('text'); stopListening() }}
          className="gap-2 rounded-full text-xs h-8"
        >
          <Keyboard className="w-3.5 h-3.5" />
          キーボード
        </Button>
        {isSupported && (
          <Button
            variant={mode === 'voice' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('voice')}
            className="gap-2 rounded-full text-xs h-8"
          >
            <Mic className="w-3.5 h-3.5" />
            音声入力
          </Button>
        )}
      </div>

      {/* Text mode */}
      {mode === 'text' && (
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-2xl border-0 glass-panel px-4 py-3',
                'text-sm leading-relaxed placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'min-h-[48px] max-h-[120px]'
              )}
            />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={disabled || !hasContent}
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">送信</span>
          </Button>
        </div>
      )}

      {/* Voice mode */}
      {mode === 'voice' && (
        <div className="flex flex-col gap-3">
          {/* Mic + send controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoice}
              disabled={disabled}
              className={cn(
                'relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
                voiceState === 'listening'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              )}
            >
              {voiceState === 'listening' ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>停止</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>{voiceState === 'error' ? 'エラー' : '話す'}</span>
                </>
              )}
            </button>

            <span className="text-xs text-muted-foreground flex-1">
              {voiceState === 'listening' ? '聞いています...' : ''}
            </span>

            <Button
              size="icon"
              onClick={handleSend}
              disabled={disabled || !hasContent}
              className="rounded-full h-11 w-11 bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">送信</span>
            </Button>
          </div>

          {/* Editable transcript area */}
          <div className="relative">
            <textarea
              value={transcript + interimTranscript}
              onChange={(e) => {
                // interimTranscript 部分は編集不可 — 確定済みテキストのみ更新
                const newVal = e.target.value
                const interimLen = interimTranscript.length
                setTranscript(interimLen > 0
                  ? newVal.slice(0, newVal.length - interimLen)
                  : newVal
                )
              }}
              placeholder="音声認識結果がここに表示されます。誤認識は直接編集できます。"
              className={cn(
                'w-full resize-none rounded-2xl border-0 glass-panel px-4 py-3',
                'text-sm leading-relaxed placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'min-h-[80px] max-h-[120px]'
              )}
              rows={3}
            />
            {transcript && (
              <button
                onClick={clearTranscript}
                className="absolute top-2 right-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                クリア
              </button>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 text-center">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Not supported */}
      {!isSupported && (
        <p className="text-xs text-muted-foreground text-center">
          お使いのブラウザは音声入力に対応していません
        </p>
      )}
    </div>
  )
}
