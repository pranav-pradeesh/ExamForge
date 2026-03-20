'use client'
import React, { useEffect, useId, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children?: ReactNode
  className?: string
  glowColor?: 'blue' | 'green' | 'amber' | 'pink' | 'purple' | 'orange'
  customSize?: boolean
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const COLOR_HUE: Record<string, number> = {
  blue: 205, green: 130, amber: 40, pink: 330, purple: 270, orange: 25,
}

function GlowCard({
  children, className = '', glowColor = 'blue',
  width, height, style, onClick,
}: GlowCardProps) {
  const uid = useId().replace(/:/g, 'd')
  const hue = COLOR_HUE[glowColor] ?? 205
  const R = 220 // spotlight radius px

  useEffect(() => {
    const move = (e: PointerEvent) => {
      document.querySelectorAll(`[data-gid="${uid}"]`).forEach(el => {
        ;(el as HTMLElement).style.setProperty('--mx', String(e.clientX))
        ;(el as HTMLElement).style.setProperty('--my', String(e.clientY))
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [uid])

  const css = `
    [data-gid="${uid}"]::before,[data-gid="${uid}"]::after{
      content:"";pointer-events:none;position:absolute;
      inset:-1px;border:1px solid transparent;border-radius:inherit;
      background-attachment:fixed;background-repeat:no-repeat;background-position:50% 50%;
      background-size:calc(100% + 2px) calc(100% + 2px);
      mask:linear-gradient(#0000,#0000),linear-gradient(#fff,#fff);
      mask-clip:padding-box,border-box;mask-composite:intersect;
    }
    [data-gid="${uid}"]::before{
      background-image:radial-gradient(${R}px ${R}px at calc(var(--mx,0)*1px) calc(var(--my,0)*1px),
        hsl(${hue} 100% 58% / 0.85),transparent 100%);
      filter:brightness(1.8);
    }
    [data-gid="${uid}"]::after{
      background-image:radial-gradient(${R * 0.55}px ${R * 0.55}px at calc(var(--mx,0)*1px) calc(var(--my,0)*1px),
        hsl(0 0% 100% / 0.1),transparent 100%);
    }
  `

  const bg = `radial-gradient(${R}px ${R}px at calc(var(--mx,0)*1px) calc(var(--my,0)*1px), hsl(${hue} 100% 65% / 0.055), transparent)`

  const s: React.CSSProperties & Record<string, unknown> = {
    position: 'relative', backgroundImage: bg,
    backgroundAttachment: 'fixed',
    ...style,
  }
  if (width !== undefined) s.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) s.height = typeof height === 'number' ? `${height}px` : height

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div data-gid={uid} style={s} className={cn('rounded-xl relative', className)} onClick={onClick}>
        {children}
      </div>
    </>
  )
}

/** Drop-in replacement for className="card" — same look + glow effect */
function DashCard({
  children, className = '', glowColor = 'blue', style, onClick,
}: GlowCardProps) {
  return (
    <GlowCard
      glowColor={glowColor}
      style={{ background: '#111114', border: '1px solid #1e1e24', padding: '24px', ...style }}
      className={cn('', className)}
      onClick={onClick}
    >
      {children}
    </GlowCard>
  )
}

export { GlowCard, DashCard }
