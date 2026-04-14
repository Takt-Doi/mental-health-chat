'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-4 right-4 z-50 rounded-full w-9 h-9 bg-background/60 backdrop-blur-sm border border-border/50 opacity-40 hover:opacity-100 transition-opacity"
      onClick={() => (window.location.href = '/api/auth/logout')}
      title="ログアウト"
    >
      <LogOut className="w-4 h-4" />
    </Button>
  )
}
