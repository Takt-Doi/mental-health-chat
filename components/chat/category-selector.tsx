'use client'

import { CATEGORIES, type ConsultationCategory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Heart, Shield, Briefcase, Flame, MessageCircle } from 'lucide-react'

interface CategorySelectorProps {
  selected: ConsultationCategory | null
  onSelect: (category: ConsultationCategory) => void
}

const iconMap = {
  heart: Heart,
  shield: Shield,
  briefcase: Briefcase,
  flame: Flame,
  'message-circle': MessageCircle,
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">相談カテゴリを選択</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap]
          const isSelected = selected === category.id

          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-card-foreground'
              )}
            >
              <Icon className={cn('w-6 h-6', isSelected && 'text-primary')} />
              <span className="text-sm font-medium text-center">{category.label}</span>
            </button>
          )
        })}
      </div>
      {selected && (
        <p className="text-xs text-muted-foreground text-center">
          {CATEGORIES.find(c => c.id === selected)?.description}
        </p>
      )}
    </div>
  )
}
