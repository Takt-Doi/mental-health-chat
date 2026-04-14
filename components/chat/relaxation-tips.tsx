'use client'

import { Wind, Brain, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RelaxationTipsProps {
  onSelectTip?: (tip: string) => void
  className?: string
}

const tips = [
  {
    id: 'breathing',
    icon: Wind,
    label: 'Breathing Exercises',
    labelJa: '呼吸エクササイズ',
    description: 'Deep breathing to calm your mind',
  },
  {
    id: 'meditation',
    icon: Brain,
    label: 'Mindfulness Meditation',
    labelJa: 'マインドフルネス瞑想',
    description: 'Focus on the present moment',
  },
  {
    id: 'break',
    icon: Coffee,
    label: 'Take a Break',
    labelJa: '休憩を取る',
    description: 'Step away and recharge',
  },
]

export function RelaxationTips({ onSelectTip, className }: RelaxationTipsProps) {
  return (
    <div className={cn(
      'glass-panel rounded-xl p-4 space-y-3',
      className
    )}>
      <h3 className="font-semibold text-sm">Relaxation Tips</h3>
      
      <div className="space-y-2">
        {tips.map((tip) => (
          <Button
            key={tip.id}
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-primary/10"
            onClick={() => onSelectTip?.(tip.labelJa)}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <tip.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">{tip.label}</div>
              <div className="text-xs text-muted-foreground">{tip.labelJa}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
