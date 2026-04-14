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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50 px-4 py-3">
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
