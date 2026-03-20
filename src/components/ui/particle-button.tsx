"use client"

import * as React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MousePointerClick } from "lucide-react"

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSuccess?: () => void
  successDuration?: number
  variant?: "primary" | "emerald" | "ghost"
  loading?: boolean
  awaitAnimation?: boolean
  children: React.ReactNode
}

// Rendered via portal so nothing in the DOM tree can clip or offset it
function ParticlePortal({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const [container] = useState(() => {
    if (typeof document === 'undefined') return null
    return document.body
  })
  if (!container) return null

  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 2 * Math.PI
    const dist = 28 + Math.random() * 36
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist
    const size = [7, 4, 5, 4][i % 4]
    return { dx, dy, size, delay: i * 0.018 }
  })

  return createPortal(
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [1, 1, 0], scale: [0, 1.3, 0], x: p.dx, y: p.dy }}
          transition={{ duration: 0.7, delay: p.delay, ease: [0.2, 0, 0.8, 1] }}
          style={{
            position: 'fixed',
            // Anchor exactly at button center — no transform needed, framer handles x/y
            left: cx,
            top: cy,
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 ${p.size * 2}px 1px ${color}`,
            pointerEvents: 'none',
            zIndex: 999999,
          }}
        />
      ))}
    </>,
    container
  )
}

function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 500,
  variant = "primary",
  loading = false,
  awaitAnimation: _a,
  className,
  disabled,
  type = "button",
  ...props
}: ParticleButtonProps) {
  const [burst, setBurst] = useState<{ cx: number; cy: number } | null>(null)
  const [pressed, setPressed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const busyRef = useRef(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const GLOW: Record<string, string> = {
    primary: "#2baffc",
    emerald: "#55c360",
    ghost:   "rgba(244,249,253,0.85)",
  }
  const BASE: Record<string, React.CSSProperties> = {
    primary: { background: "#2baffc", color: "#010101" },
    emerald: { background: "#55c360", color: "#010101" },
    ghost:   { background: "transparent", color: "rgba(244,249,253,0.8)", border: "1px solid #1e1e24" },
  }

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading || busyRef.current) return
      busyRef.current = true

      // Snapshot rect synchronously at click time
      const rect = btnRef.current!.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      setPressed(true)
      setTimeout(() => setPressed(false), 100)
      setBurst({ cx, cy })

      await new Promise<void>(res => setTimeout(res, successDuration))

      setBurst(null)
      busyRef.current = false
      onClick?.(e)
      onSuccess?.()
    },
    [disabled, loading, successDuration, onClick, onSuccess]
  )

  return (
    <>
      {mounted && burst && (
        <ParticlePortal cx={burst.cx} cy={burst.cy} color={GLOW[variant]} />
      )}
      <button
        ref={btnRef}
        type={type}
        onClick={handleClick}
        disabled={disabled || loading || !!burst}
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "font-mono-display font-bold uppercase tracking-wide rounded-lg",
          "text-xs px-6 py-3 select-none outline-none",
          "transition-transform duration-100",
          pressed ? "scale-90" : burst ? "scale-[0.97]" : "scale-100",
          disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          !disabled && !loading && variant === "primary" && "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(43,175,252,0.35)]",
          !disabled && !loading && variant === "emerald" && "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(85,195,96,0.35)]",
          !disabled && !loading && variant === "ghost"   && "hover:border-[#2baffc] hover:text-[#2baffc]",
          className
        )}
        style={BASE[variant]}
        {...props}
      >
        {loading
          ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          : <>
              {children}
              <AnimatePresence>
                {burst && (
                  <motion.span key="icon"
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}>
                    <MousePointerClick size={13} />
                  </motion.span>
                )}
              </AnimatePresence>
            </>
        }
      </button>
    </>
  )
}

export { ParticleButton }
export type { ParticleButtonProps }
