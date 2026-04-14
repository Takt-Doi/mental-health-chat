'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface MoodTrackerProps {
  onMoodChange?: (mood: number) => void
  className?: string
}

const moodLabels = [
  { value: 0, label: '穏やか', icon: '😌' },
  { value: 50, label: '普通', icon: '😐' },
  { value: 100, label: '不安', icon: '😰' },
]

function getMoodLabel(value: number) {
  if (value <= 25) return { label: '穏やか', color: 'text-green-600' }
  if (value <= 50) return { label: 'やや穏やか', color: 'text-teal-600' }
  if (value <= 75) return { label: 'やや不安', color: 'text-amber-600' }
  return { label: '不安', color: 'text-orange-600' }
}

export function MoodTracker({ onMoodChange, className }: MoodTrackerProps) {
  const [mood, setMood] = useState(50)

  const handleChange = (value: number[]) => {
    const newMood = value[0]
    setMood(newMood)
    onMoodChange?.(newMood)
  }

  const currentMood = getMoodLabel(mood)

  return (
    <div className={cn(
      'glass-panel rounded-xl p-4 space-y-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Mood Tracker</h3>
        <div className="text-2xl">
          {mood <= 33 ? '😌' : mood <= 66 ? '😐' : '😰'}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>Current Mood:</span>
          <span className={cn('font-medium', currentMood.color)}>
            {currentMood.label}
          </span>
        </div>

        <div className="relative pt-2 pb-1">
          <div className="absolute inset-x-0 top-0 h-2 rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-orange-400 opacity-20" />
          <Slider
            value={[mood]}
            onValueChange={handleChange}
            max={100}
            step={1}
            className="relative"
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Calm</span>
          <span>Neutral</span>
          <span>Anxious</span>
        </div>
      </div>
    </div>
  )
}
