'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  language?: string
  continuous?: boolean
}

interface UseVoiceInputReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export function useVoiceInput({
  onResult,
  onError,
  language = 'ja-JP',
  continuous = true,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check for browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      const errorMessage = getErrorMessage(event.error)
      setError(errorMessage)
      onError?.(errorMessage)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(prev => prev + finalTranscript)
      
      if (finalTranscript) {
        onResult?.(finalTranscript)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [language, continuous, onResult, onError])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setError(null)
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Recognition already started
        console.log('[v0] Speech recognition already started')
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return '音声が検出されませんでした。もう一度お試しください。'
    case 'audio-capture':
      return 'マイクにアクセスできません。マイクの設定を確認してください。'
    case 'not-allowed':
      return 'マイクの使用が許可されていません。ブラウザの設定を確認してください。'
    case 'network':
      return 'ネットワークエラーが発生しました。'
    case 'aborted':
      return '音声認識が中断されました。'
    default:
      return `音声認識エラー: ${error}`
  }
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
