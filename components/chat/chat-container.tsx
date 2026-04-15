'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatMessage, ChatMessageSkeleton } from './chat-message'
import { ChatInput } from './chat-input'
import { FileUploader } from './file-uploader'
import { ResourcesPanel } from './resources-panel'
import { AIAvatar } from './ai-avatar'
import { MoodTracker } from './mood-tracker'
import { RelaxationTips } from './relaxation-tips'
import { SidebarNav } from './sidebar-nav'
import { QuickTopics } from './quick-topics'
import { GuidedSessionButton } from './guided-session-button'
import { useFileUpload } from '@/hooks/use-file-upload'
import type { ConsultationCategory, HistoryEntry } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Mic, Menu, X, Upload, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatContainer() {
  const [category, setCategory] = useState<ConsultationCategory | null>(null)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('sessions')
  const [currentMood, setCurrentMood] = useState(50)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { entries, isLoading: fileLoading, error: fileError, uploadFile, clearEntries } = useFileUpload()

  // Build RAG context from uploaded entries
  const ragContext = useMemo(() => {
    if (entries.length === 0) return undefined
    
    return entries
      .map((entry: HistoryEntry) => {
        const parts = []
        if (entry.date) parts.push(`日付: ${entry.date}`)
        if (entry.category) parts.push(`カテゴリ: ${entry.category}`)
        if (entry.summary) parts.push(`内容: ${entry.summary}`)
        if (entry.keywords.length > 0) parts.push(`キーワード: ${entry.keywords.join(', ')}`)
        return parts.join(' | ')
      })
      .join('\n')
  }, [entries])

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          messages,
          category: category ? getCategoryLabel(category) : undefined,
          ragContext,
          mood: currentMood,
        },
      }),
    })
  }, [category, ragContext, currentMood])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = (text: string) => {
    sendMessage({ text })
  }

  const handleTopicSelect = (topic: string) => {
    sendMessage({ text: `${topic}について相談したいです。` })
  }

  const handleTipSelect = (tip: string) => {
    sendMessage({ text: `${tip}の方法を教えてください。` })
  }

  const handleGuidedSession = () => {
    sendMessage({ text: 'ガイド付きセッションを始めたいです。今の気持ちを整理する手伝いをしてください。' })
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen overflow-hidden gradient-bg">
      {/* Left Sidebar - Navigation */}
      <aside className={cn(
        'hidden lg:flex flex-col w-48 border-r border-border/50 sidebar-glass transition-all duration-300',
        !showLeftPanel && 'w-0 overflow-hidden'
      )}>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">AI Counseling</span>
          </div>
        </div>
        
        <SidebarNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          className="flex-1"
        />

        <div className="p-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="w-4 h-4" />
            <span className="text-xs">履歴インポート</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] glass-panel border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">AI Counseling</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:pt-0 pt-16">
        {/* Compact avatar header - shown during conversation */}
        {hasMessages && (
          <div className="flex-shrink-0 border-b border-border/50 glass-panel px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              {/* Small avatar circle */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30 bg-gradient-to-b from-primary/20 to-primary/5">
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                    <defs>
                      <linearGradient id="compactAvatarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00CC99" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00CC99" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="compactFaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F5E6D3" />
                        <stop offset="100%" stopColor="#E8D5C4" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#compactAvatarGradient)" />
                    <ellipse cx="50" cy="95" rx="35" ry="25" fill="#00A87B" />
                    <ellipse cx="50" cy="95" rx="30" ry="20" fill="#00CC99" />
                    <rect x="43" y="68" width="14" height="12" fill="url(#compactFaceGradient)" />
                    <ellipse cx="50" cy="45" rx="22" ry="26" fill="url(#compactFaceGradient)" />
                    <path d="M28 40 C28 25 38 15 50 15 C62 15 72 25 72 40 C72 45 70 48 68 50 L68 35 C68 28 60 22 50 22 C40 22 32 28 32 35 L32 50 C30 48 28 45 28 40Z" fill="#3A2A1F" />
                    <ellipse cx="40" cy="43" rx="4" ry="5" fill="white" />
                    <ellipse cx="60" cy="43" rx="4" ry="5" fill="white" />
                    <circle cx="40" cy="44" r="2.5" fill="#2A5A4A" />
                    <circle cx="60" cy="44" r="2.5" fill="#2A5A4A" />
                    <circle cx="41" cy="43" r="1" fill="white" />
                    <circle cx="61" cy="43" r="1" fill="white" />
                    <path d="M42 58 Q50 64 58 58" stroke="#D4A88C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M25 45 C25 30 35 20 50 20 C65 20 75 30 75 45" stroke="#333" strokeWidth="3" fill="none" />
                    <circle cx="25" cy="48" r="5" fill="#333" />
                    <circle cx="75" cy="48" r="5" fill="#333" />
                    <path d="M22 52 L22 58 C22 60 24 62 27 62" stroke="#333" strokeWidth="2" fill="none" />
                    <circle cx="30" cy="62" r="3" fill="#333" />
                  </svg>
                </div>
                {/* Status dot */}
                <div className={cn(
                  'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card transition-colors',
                  isLoading ? 'bg-green-500' : 'bg-muted-foreground'
                )} />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">こころのサポートAI</p>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? '入力中...' : 'オンライン'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat content with avatar */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* AI Avatar section - show when no messages */}
            {!hasMessages && (
              <div className="py-8 space-y-6">
                <AIAvatar isActive={isLoading} className="mx-auto" />

                {/* Welcome message */}
                <div className="glass-panel rounded-2xl p-4 max-w-md mx-auto text-center">
                  <p className="text-sm">
                    こんにちは！今日はどんな気分ですか？
                  </p>
                </div>
              </div>
            )}

            {/* Quick topic chips */}
            {!hasMessages && (
              <QuickTopics 
                onSelectTopic={handleTopicSelect}
                className="py-4"
              />
            )}

            {/* Messages */}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <ChatMessageSkeleton />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border/50 glass-panel p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              placeholder="メッセージを入力..."
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Mood & Tips */}
      <aside className={cn(
        'hidden lg:flex flex-col w-72 border-l border-border/50 sidebar-glass transition-all duration-300 overflow-hidden',
        !showRightPanel && 'w-0'
      )}>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* User avatar placeholder */}
          <div className="flex justify-end">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Mood Tracker */}
          <MoodTracker onMoodChange={setCurrentMood} />

          {/* Relaxation Tips */}
          <RelaxationTips onSelectTip={handleTipSelect} />

          {/* Guided Session Button */}
          <GuidedSessionButton onClick={handleGuidedSession} />

          {/* Resources */}
          <ResourcesPanel />
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 w-80 max-w-[85vw] sidebar-glass border-l border-border/50 z-50 lg:hidden overflow-y-auto">
            <div className="p-4 pt-20 space-y-4">
              <MoodTracker onMoodChange={setCurrentMood} />
              <RelaxationTips onSelectTip={handleTipSelect} />
              <GuidedSessionButton onClick={handleGuidedSession} />
              <ResourcesPanel />
              
              <div className="pt-4 border-t border-border/50">
                <FileUploader
                  onUpload={uploadFile}
                  isLoading={fileLoading}
                  error={fileError}
                  entries={entries}
                  onClear={clearEntries}
                />
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 glass-panel rounded-2xl p-6 glow-effect">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">履歴インポート</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUploadModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <FileUploader
              onUpload={uploadFile}
              isLoading={fileLoading}
              error={fileError}
              entries={entries}
              onClear={clearEntries}
            />
          </div>
        </>
      )}
    </div>
  )
}

function getCategoryLabel(category: ConsultationCategory): string {
  const labels: Record<ConsultationCategory, string> = {
    'mental-health': 'メンタルヘルス',
    harassment: 'ハラスメント',
    career: 'キャリア',
    engagement: 'エンゲージメント',
    other: 'その他',
  }
  return labels[category]
}
