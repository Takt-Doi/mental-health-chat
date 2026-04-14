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
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text')
  const [textInput, setTextInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useVoiceInput({
    onResult: () => {
      // Append to existing text
    },
  })

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [textInput])

  const handleSend = () => {
    const messageToSend = inputMode === 'voice' ? transcript : textInput
    if (messageToSend.trim() && !disabled) {
      onSend(messageToSend.trim())
      if (inputMode === 'voice') {
        resetTranscript()
        stopListening()
      } else {
        setTextInput('')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const currentMessage = inputMode === 'voice' ? transcript : textInput

  return (
    <div className="space-y-3">
      {/* Voice mode visualization */}
      {inputMode === 'voice' && (
        <div className="space-y-3">
          {/* Voice button */}
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={toggleVoice}
              disabled={disabled || !isSupported}
              className={cn(
                'relative w-16 h-16 rounded-full flex items-center justify-center transition-all',
                isListening
                  ? 'bg-primary text-primary-foreground glow-effect'
                  : 'bg-primary/10 text-primary hover:bg-primary/20',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-primary/30 voice-pulse" />
                  <span className="absolute inset-0 rounded-full bg-primary/20 voice-pulse" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              {isListening ? (
                <MicOff className="w-6 h-6 relative z-10" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              {isListening ? '話しかけてください...' : 'タップして話す'}
            </p>
          </div>

          {/* Transcript display */}
          {transcript && (
            <div className="glass-panel rounded-xl p-3">
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {/* Send button for voice mode */}
          {transcript && (
            <div className="flex justify-center">
              <Button
                onClick={handleSend}
                disabled={disabled || !transcript.trim()}
                className="gap-2 rounded-full px-6"
              >
                <Send className="w-4 h-4" />
                送信
              </Button>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 text-center">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Text input area */}
      {inputMode === 'text' && (
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
                'w-full resize-none rounded-2xl border-0 glass-panel px-4 py-3 pr-12',
                'text-sm leading-relaxed placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'min-h-[48px] max-h-[120px]'
              )}
            />
            
            {/* Voice toggle inside input */}
            {isSupported && (
              <button
                type="button"
                onClick={() => {
                  setInputMode('voice')
                  startListening()
                }}
                className="absolute right-12 bottom-3 p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Send button */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={disabled || !textInput.trim()}
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">送信</span>
          </Button>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={inputMode === 'voice' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setInputMode('voice')}
          disabled={!isSupported}
          className="gap-2 rounded-full text-xs h-8"
        >
          <Mic className="w-3.5 h-3.5" />
          音声
        </Button>
        <Button
          variant={inputMode === 'text' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setInputMode('text')}
          className="gap-2 rounded-full text-xs h-8"
        >
          <Keyboard className="w-3.5 h-3.5" />
          テキスト
        </Button>
      </div>

      {/* Not supported message */}
      {!isSupported && inputMode === 'voice' && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            お使いのブラウザは音声入力に対応していません
          </p>
        </div>
      )}
    </div>
  )
}
