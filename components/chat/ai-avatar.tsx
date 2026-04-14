'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AIAvatarProps {
  isActive?: boolean
  className?: string
}

export function AIAvatar({ isActive = false, className }: AIAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Audio waveform animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bars = 40
    const barWidth = 3
    const gap = 2
    const maxHeight = 30
    const heights = new Array(bars).fill(0).map(() => Math.random() * maxHeight)
    const speeds = new Array(bars).fill(0).map(() => 0.5 + Math.random() * 2)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < bars; i++) {
        if (isActive) {
          heights[i] += speeds[i] * (Math.random() > 0.5 ? 1 : -1)
          heights[i] = Math.max(4, Math.min(maxHeight, heights[i]))
        } else {
          heights[i] = heights[i] * 0.95 + 4 * 0.05
        }

        const x = i * (barWidth + gap)
        const height = heights[i]
        const y = (canvas.height - height) / 2

        // Gradient fill
        const gradient = ctx.createLinearGradient(x, y, x, y + height)
        gradient.addColorStop(0, 'rgba(0, 204, 153, 0.9)')
        gradient.addColorStop(1, 'rgba(0, 204, 153, 0.4)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, height, 1.5)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* Waveform */}
      <canvas
        ref={canvasRef}
        width={200}
        height={40}
        className="mb-4"
      />

      {/* Avatar container with glow effect */}
      <div className="relative">
        {/* Glow rings */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-primary/20 blur-xl transition-all duration-500',
          isActive ? 'scale-125 opacity-100' : 'scale-100 opacity-50'
        )} />
        <div className={cn(
          'absolute inset-0 rounded-full bg-primary/10 blur-2xl transition-all duration-500',
          isActive ? 'scale-150 opacity-100' : 'scale-110 opacity-30'
        )} />

        {/* Avatar */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-primary/30 bg-gradient-to-b from-primary/20 to-primary/5">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
          >
            {/* Simple stylized avatar */}
            <defs>
              <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00CC99" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00CC99" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5E6D3" />
                <stop offset="100%" stopColor="#E8D5C4" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle cx="50" cy="50" r="48" fill="url(#avatarGradient)" />

            {/* Body/shoulders */}
            <ellipse cx="50" cy="95" rx="35" ry="25" fill="#00A87B" />
            <ellipse cx="50" cy="95" rx="30" ry="20" fill="#00CC99" />

            {/* Neck */}
            <rect x="43" y="68" width="14" height="12" fill="url(#faceGradient)" />

            {/* Face */}
            <ellipse cx="50" cy="45" rx="22" ry="26" fill="url(#faceGradient)" />

            {/* Hair */}
            <path
              d="M28 40 C28 25 38 15 50 15 C62 15 72 25 72 40 C72 45 70 48 68 50 L68 35 C68 28 60 22 50 22 C40 22 32 28 32 35 L32 50 C30 48 28 45 28 40Z"
              fill="#3A2A1F"
            />
            <path
              d="M30 50 C28 45 28 40 28 40 C28 38 29 36 30 35 L30 55 C30 53 30 51 30 50Z"
              fill="#3A2A1F"
            />
            <path
              d="M70 50 C72 45 72 40 72 40 C72 38 71 36 70 35 L70 55 C70 53 70 51 70 50Z"
              fill="#3A2A1F"
            />

            {/* Eyes */}
            <ellipse cx="40" cy="43" rx="4" ry="5" fill="white" />
            <ellipse cx="60" cy="43" rx="4" ry="5" fill="white" />
            <circle cx="40" cy="44" r="2.5" fill="#2A5A4A" />
            <circle cx="60" cy="44" r="2.5" fill="#2A5A4A" />
            <circle cx="41" cy="43" r="1" fill="white" />
            <circle cx="61" cy="43" r="1" fill="white" />

            {/* Eyebrows */}
            <path d="M34 36 Q40 34 46 36" stroke="#3A2A1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M54 36 Q60 34 66 36" stroke="#3A2A1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Nose */}
            <path d="M50 48 L48 54 L52 54" stroke="#D4C4B5" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Smile */}
            <path
              d="M42 58 Q50 64 58 58"
              stroke="#D4A88C"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Headset */}
            <path
              d="M25 45 C25 30 35 20 50 20 C65 20 75 30 75 45"
              stroke="#333"
              strokeWidth="3"
              fill="none"
            />
            <circle cx="25" cy="48" r="5" fill="#333" />
            <circle cx="75" cy="48" r="5" fill="#333" />
            <path d="M22 52 L22 58 C22 60 24 62 27 62" stroke="#333" strokeWidth="2" fill="none" />
            <circle cx="30" cy="62" r="3" fill="#333" />
          </svg>
        </div>

        {/* Status indicator */}
        <div className={cn(
          'absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-card transition-colors',
          isActive ? 'bg-green-500' : 'bg-muted-foreground'
        )} />
      </div>
    </div>
  )
}
