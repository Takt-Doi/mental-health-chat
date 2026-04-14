'use client'

import { Home, MessageSquare, Heart, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarNavProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  className?: string
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'sessions', icon: MessageSquare, label: 'Sessions' },
  { id: 'wellness', icon: Heart, label: 'Wellness Tips' },
  { id: 'progress', icon: BarChart3, label: 'Progress' },
]

export function SidebarNav({ activeTab = 'home', onTabChange, className }: SidebarNavProps) {
  return (
    <nav className={cn('flex flex-col gap-1 p-2', className)}>
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 h-auto py-3 px-3 transition-all',
            activeTab === item.id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
          onClick={() => onTabChange?.(item.id)}
        >
          <item.icon className={cn(
            'w-5 h-5',
            activeTab === item.id && 'text-primary'
          )} />
          <span className="text-sm">{item.label}</span>
        </Button>
      ))}
    </nav>
  )
}
