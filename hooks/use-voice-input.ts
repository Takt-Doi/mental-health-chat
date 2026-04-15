'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type SpeechRecognitionCtor = new () => SpeechRecognition

function getSpeechRecognitionAPI(): SpeechRecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition
  )
}

export type VoiceState = 'idle' | 'listening' | 'error'

export interface UseVoiceInputReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  voiceState: VoiceState
  startListening: () => void
  stopListening: () => void
  clearTranscript: () => void
  setTranscript: (text: string) => void
  error: string | null
}

export function useVoiceInput(language = 'ja-JP'): UseVoiceInputReturn {
  const [transcript, setTranscriptState] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<InstanceType<SpeechRecognition> | null>(null)

  const SpeechRecognitionAPI = getSpeechRecognitionAPI()
  const isSupported = !!SpeechRecognitionAPI
  const isListening = voiceState === 'listening'

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setVoiceState('idle')
    setInterimTranscript('')
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported || !SpeechRecognitionAPI) return
    if (voiceState === 'listening') {
      stopListening()
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = language
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setVoiceState('listening')
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        setTranscriptState((prev) => prev + final)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') return
      setVoiceState('error')
      setError(getErrorMessage(event.error))
      setTimeout(() => {
        setVoiceState('idle')
        setError(null)
      }, 2000)
    }

    recognition.onend = () => {
      setVoiceState('idle')
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, SpeechRecognitionAPI, language, voiceState, stopListening])

  const clearTranscript = useCallback(() => {
    setTranscriptState('')
    setInterimTranscript('')
  }, [])

  const setTranscript = useCallback((text: string) => {
    setTranscriptState(text)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  return {
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
    default:
      return `音声認識エラー: ${error}`
  }
}
