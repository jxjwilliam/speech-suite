'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AudioVisualizerProps {
  level: number
  isActive: boolean
  className?: string
}

export function AudioVisualizer({ level, isActive, className }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>([])

  useEffect(() => {
    if (isActive) {
      // Generate random bar heights based on audio level
      const newBars = Array.from({ length: 20 }, () => 
        Math.random() * (level / 100) * 100
      )
      setBars(newBars)
    } else {
      setBars(Array(20).fill(0))
    }
  }, [level, isActive])

  return (
    <div className={cn("flex items-end justify-center space-x-1", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 bg-gradient-to-t from-teal-500 via-cyan-500 to-cyan-300 rounded-full transition-all duration-100",
            isActive ? "opacity-100" : "opacity-30"
          )}
          style={{
            height: `${Math.max(height, 4)}px`,
            minHeight: '4px'
          }}
        />
      ))}
    </div>
  )
}
