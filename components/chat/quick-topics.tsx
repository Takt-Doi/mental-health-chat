'use client'

import { Briefcase, Moon, Heart, Users, Brain, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickTopicsProps {
  onSelectTopic?: (topic: string) => void
  className?: string
}

const topics = [
  { id: 'work-stress', icon: Briefcase, label: '仕事のストレス', labelEn: 'Work stress' },
  { id: 'sleep', icon: Moon, label: '睡眠の悩み', labelEn: 'Difficulty sleeping', highlight: true },
  { id: 'relationships', icon: Users, label: '人間関係', labelEn: 'Relationship issues' },
  { id: 'anxiety', icon: Brain, label: '不安・焦り', labelEn: 'Anxiety' },
  { id: 'motivation', icon: Sparkles, label: 'やる気', labelEn: 'Motivation' },
]

export function QuickTopics({ onSelectTopic, className }: QuickTopicsProps) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {topics.map((topic) => (
        <Button
          key={topic.id}
          variant="outline"
          size="sm"
          className={cn(
            'rounded-full gap-2 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all',
            topic.highlight && 'border-primary/30 bg-primary/5'
          )}
          onClick={() => onSelectTopic?.(topic.label)}
        >
          <topic.icon className="w-3.5 h-3.5" />
          <span className="text-xs">{topic.label}</span>
        </Button>
      ))}
    </div>
  )
}
