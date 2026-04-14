'use client'

import { Heart, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GuidedSessionButtonProps {
  onClick?: () => void
  className?: string
}

export function GuidedSessionButton({ onClick, className }: GuidedSessionButtonProps) {
  return (
    <Button
      className={cn(
        'w-full bg-card/80 backdrop-blur-sm border border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all group',
        className
      )}
      variant="outline"
      onClick={onClick}
    >
      <Heart className="w-4 h-4 text-primary mr-2" />
      <span className="font-medium">Guided Session</span>
      <ChevronRight className="w-4 h-4 ml-auto text-primary group-hover:translate-x-1 transition-transform" />
    </Button>
  )
}
