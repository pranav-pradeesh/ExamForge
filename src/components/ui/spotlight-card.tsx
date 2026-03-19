'use client'
import React, { useEffect, useRef, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'blue' | 'green' | 'amber' | 'pink' | 'purple' | 'orange'
  customSize?: boolean
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
}

const glowColorMap = {
  blue:   { base: 205, spread: 30 },
  green:  { base: 130, spread: 30 },
  amber:  { base: 40,  spread: 30 },
  pink:   { base: 330, spread: 30 },
  purple: { base: 270, spread: 30 },
  orange: { base: 25,  spread: 30 },
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  customSize = true,
  width,
  height,
  style,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2))
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2))
        cardRef.current.style.setProperty('--y', y.toFixed(2))
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2))
      }
    }
    document.addEventListener('pointermove', syncPointer)
    return () => document.removeEventListener('pointermove', syncPointer)
  }, [])

  const { base, spread } = glowColorMap[glowColor]

  const inlineStyles: React.CSSProperties & Record<string, string | number> = {
    '--base': base,
    '--spread': spread,
    '--radius': '12',
    '--border': '1',
    '--backdrop': 'rgba(17,17,20,0.7)',
    '--backup-border': 'rgba(255,255,255,0.06)',
    '--size': '260',
    '--outer': '1',
    '--border-size': 'calc(var(--border, 1) * 1px)',
    '--spotlight-size': 'calc(var(--size, 200) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) 100% 65% / 0.07), transparent
    )`,
    backgroundColor: 'var(--backdrop, transparent)',
    backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
    backgroundPosition: '50% 50%',
    backgroundAttachment: 'fixed',
    border: 'var(--border-size) solid var(--backup-border)',
    position: 'relative',
    touchAction: 'none',
    ...style,
  }

  if (width !== undefined) inlineStyles.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) inlineStyles.height = typeof height === 'number' ? `${height}px` : height

  const css = `
    [data-ef-glow]::before,
    [data-ef-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    [data-ef-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) 100% 55% / 0.9), transparent 100%
      );
      filter: brightness(2);
    }
    [data-ef-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.4) calc(var(--spotlight-size) * 0.4) at
        calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / 0.15), transparent 100%
      );
    }
    [data-ef-glow] [data-ef-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    [data-ef-glow] > [data-ef-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={cardRef}
        data-ef-glow
        style={inlineStyles}
        className={`rounded-xl relative backdrop-blur-sm ${className}`}
      >
        <div data-ef-glow />
        {children}
      </div>
    </>
  )
}

export { GlowCard }
