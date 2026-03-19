"use client"

import React, { useEffect, useRef, useId } from 'react'
import { cn } from '@/lib/utils'

interface SiriOrbProps {
  size?: number
  className?: string
  /** Speed multiplier — higher = faster. Default 1 */
  speed?: number
  /** Whether the orb is "speaking" / active — pulses faster and brighter */
  active?: boolean
  colors?: {
    c1?: string
    c2?: string
    c3?: string
  }
}

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = 80,
  className,
  speed = 1,
  active = false,
  colors,
}) => {
  const id = useId().replace(/:/g, '')
  const duration = active ? (12 / speed) : (22 / speed)

  const c1 = colors?.c1 ?? (active ? 'oklch(72% 0.22 210)' : 'oklch(62% 0.18 210)')  // #2baffc dodger blue
  const c2 = colors?.c2 ?? (active ? 'oklch(76% 0.20 155)' : 'oklch(66% 0.16 155)')  // #55c360 emerald green
  const c3 = colors?.c3 ?? (active ? 'oklch(95% 0.04 210)' : 'oklch(85% 0.03 210)')  // #f4f9fd polar white

  const blur = Math.max(size * 0.09, 7)
  const contrast = active ? 2.2 : 1.8
  const saturation = active ? 1.6 : 1.2

  const css = `
    @property --orb-angle-${id} {
      syntax: "<angle>";
      inherits: false;
      initial-value: 0deg;
    }
    .siri-orb-${id} {
      display: block;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
    }
    .siri-orb-${id}::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background:
        conic-gradient(from calc(var(--orb-angle-${id}) * 1.2) at 30% 65%, ${c3} 0deg, transparent 45deg 315deg, ${c3} 360deg),
        conic-gradient(from calc(var(--orb-angle-${id}) * 0.8) at 70% 35%, ${c2} 0deg, transparent 60deg 300deg, ${c2} 360deg),
        conic-gradient(from calc(var(--orb-angle-${id}) * -1.5) at 65% 75%, ${c1} 0deg, transparent 90deg 270deg, ${c1} 360deg),
        conic-gradient(from calc(var(--orb-angle-${id}) * 2.1) at 25% 25%, ${c2} 0deg, transparent 30deg 330deg, ${c2} 360deg),
        conic-gradient(from calc(var(--orb-angle-${id}) * -0.7) at 80% 80%, ${c1} 0deg, transparent 45deg 315deg, ${c1} 360deg),
        radial-gradient(ellipse 120% 80% at 40% 60%, ${c3} 0%, transparent 55%);
      filter: blur(${blur}px) contrast(${contrast}) saturate(${saturation});
      animation: siri-rotate-${id} ${duration}s linear infinite;
      transform: translateZ(0);
      will-change: transform;
    }
    .siri-orb-${id}::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 40%, rgba(255,255,255,0.12) 0%, transparent 55%);
      mix-blend-mode: overlay;
    }
    @keyframes siri-rotate-${id} {
      from { --orb-angle-${id}: 0deg; }
      to   { --orb-angle-${id}: 360deg; }
    }
    @media (prefers-reduced-motion: reduce) {
      .siri-orb-${id}::before { animation: none; }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        className={cn(`siri-orb-${id}`, className)}
        style={{ filter: active ? `drop-shadow(0 0 ${size * 0.15}px ${c1})` : undefined }}
      />
    </>
  )
}

export { SiriOrb }
