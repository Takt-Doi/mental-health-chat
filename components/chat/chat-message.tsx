'use client'

import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // Extract text from message parts
  const text = message.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || ''

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3 shadow-sm',
          isUser 
            ? 'chat-bubble-user rounded-br-md' 
            : 'chat-bubble-ai rounded-bl-md'
        )}
      >
        <div className={cn(
          'text-sm leading-relaxed whitespace-pre-wrap break-words',
          isUser && 'text-white'
        )}>
          {text}
        </div>
      </div>
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
        <Bot className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div className="chat-bubble-ai rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
