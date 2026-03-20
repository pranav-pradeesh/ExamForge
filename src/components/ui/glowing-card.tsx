"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GridBackgroundProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  showDot?: boolean
}

export function GridBackground({
  title,
  description,
  children,
  className,
  showDot = true,
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        'px-6 sm:px-10 py-14 sm:py-20 rounded-2xl relative flex flex-col items-center justify-center text-center overflow-hidden',
        className
      )}
      style={{
        backgroundColor: 'rgba(10, 10, 11, 1)',
        backgroundImage: `
          linear-gradient(rgba(43, 175, 252, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(43, 175, 252, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '28px 28px',
      }}
    >
      {/* Travelling dot */}
      {showDot && (
        <div
          className="w-3 h-3 rounded-full absolute z-10"
          style={{
            background: 'currentColor',
            boxShadow: '0 0 18px 4px currentColor',
            animation: 'ef-border-follow 6s linear infinite, ef-color-change 6s linear infinite',
          }}
        />
      )}

      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-2xl border-2"
        style={{ animation: 'ef-border-color 6s linear infinite' }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-2xl">
        <h2 className="font-mono-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-3"
          style={{ color: '#f4f9fd' }}>
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base mb-7" style={{ color: 'rgba(244,249,253,0.6)' }}>
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
