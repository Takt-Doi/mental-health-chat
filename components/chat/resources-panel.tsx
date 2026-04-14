'use client'

import { OFFICIAL_RESOURCES } from '@/lib/types'
import { Phone, ExternalLink, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ResourcesPanel() {
  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">公的相談窓口</h3>
      </div>
      
      <p className="text-xs text-muted-foreground">
        緊急時や専門的なサポートが必要な場合は、以下の公的機関にご相談ください。
      </p>

      <div className="space-y-3">
        {OFFICIAL_RESOURCES.map((resource, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <h4 className="text-sm font-medium mb-1">{resource.name}</h4>
            <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {resource.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 text-xs"
                >
                  <a href={`tel:${resource.phone.replace(/-/g, '')}`}>
                    <Phone className="w-3 h-3 mr-1" />
                    {resource.phone}
                  </a>
                </Button>
              )}
              {resource.url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 text-xs"
                >
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    サイトを開く
                  </a>
                </Button>
              )}
            </div>
            
            {resource.hours && (
              <p className="text-xs text-primary mt-2">{resource.hours}</p>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">注意:</strong> このAIは医療的な診断や治療を行うものではありません。
          深刻な問題を抱えている場合は、必ず専門家にご相談ください。
        </p>
      </div>
    </div>
  )
}
