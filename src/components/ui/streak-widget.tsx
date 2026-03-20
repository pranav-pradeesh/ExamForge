'use client'
import { useEffect, useState } from 'react'
import { Flame, Zap, Trophy } from 'lucide-react'
import { DashCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

interface StreakWidgetProps {
  current: number
  longest: number
  isOnFireToday: boolean
  justExtended: boolean
  className?: string
}

export function StreakWidget({ current, longest, isOnFireToday, justExtended, className }: StreakWidgetProps) {
  const [showBurst, setShowBurst] = useState(false)

  useEffect(() => {
    if (justExtended) {
      setShowBurst(true)
      const t = setTimeout(() => setShowBurst(false), 2500)
      return () => clearTimeout(t)
    }
  }, [justExtended])

  // Build last-7-days dots (simplified — no DB query needed, just visual)
  const dots = Array.from({ length: 7 }, (_, i) => {
    // Days 0..current-1 are active if current >= 7, else only last `current` days
    const active = i >= (7 - Math.min(current, 7))
    const isToday = i === 6
    return { active, isToday }
  })

  const flameColor = current >= 7 ? '#f59e0b' : current >= 3 ? '#fb923c' : '#2baffc'
  const flameSize = current >= 14 ? 36 : current >= 7 ? 30 : 24

  return (
    <DashCard glowColor={current >= 7 ? 'amber' : 'blue'} className={cn('relative overflow-hidden', className)}>
      {/* Burst animation when streak extends */}
      {showBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-4xl animate-bounce">🔥</div>
          <div className="absolute inset-0 rounded-xl animate-ping"
            style={{ background: 'rgba(245,158,11,0.15)', animationDuration: '0.6s', animationIterationCount: 3 }} />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-mono-display font-bold flex items-center gap-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>
          <Flame size={11} style={{ color: flameColor }} /> STUDY STREAK
        </div>
        {current >= 7 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-mono-display font-bold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
            🏆 On fire!
          </span>
        )}
      </div>

      {/* Big number */}
      <div className="flex items-end gap-3 mb-5">
        <div className="relative">
          <Flame
            size={flameSize}
            style={{
              color: flameColor,
              filter: `drop-shadow(0 0 8px ${flameColor}80)`,
              transition: 'all 0.5s ease',
              animation: isOnFireToday ? 'flicker 1.5s ease-in-out infinite' : 'none',
            }}
          />
        </div>
        <div>
          <span className="font-mono-display font-bold" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', color: flameColor, lineHeight: 1 }}>
            {current}
          </span>
          <span className="text-sm ml-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>days</span>
        </div>
      </div>

      {/* Last 7 days dots */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-md transition-all duration-300"
                style={{
                  height: '6px',
                  background: dots[i].active
                    ? dots[i].isToday
                      ? flameColor
                      : flameColor + '80'
                    : '#1e1e24',
                  boxShadow: dots[i].active && dots[i].isToday ? `0 0 6px ${flameColor}60` : 'none',
                }}
              />
              <span className="text-xs font-mono-display" style={{ color: 'rgba(244,249,253,0.3)', fontSize: '9px' }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #1e1e24' }}>
        <div className="text-center">
          <div className="font-mono-display font-bold text-base" style={{ color: '#f4f9fd' }}>{longest}</div>
          <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>best streak</div>
        </div>
        <div className="text-center">
          {isOnFireToday ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#55c360' }} />
              <span className="text-xs" style={{ color: '#55c360' }}>Active today</span>
            </div>
          ) : (
            <div className="text-xs" style={{ color: '#ff8080' }}>Study today to keep it!</div>
          )}
        </div>
        <div className="text-center">
          <div className="font-mono-display font-bold text-base" style={{ color: '#f4f9fd' }}>
            {current >= 30 ? '🏆' : current >= 14 ? '⚡' : current >= 7 ? '🔥' : '💪'}
          </div>
          <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>
            {current >= 30 ? 'legend' : current >= 14 ? 'warrior' : current >= 7 ? 'on fire' : 'getting there'}
          </div>
        </div>
      </div>
    </DashCard>
  )
}
