"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MousePointerClick } from "lucide-react"

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSuccess?: () => void
  /**
   * How long (ms) to run the particle burst BEFORE the onClick fires.
   * Defaults to 1500ms as requested.
   */
  successDuration?: number
  variant?: "primary" | "emerald" | "ghost"
  loading?: boolean
  children: React.ReactNode
}

function SuccessParticles({
  buttonRef,
  color,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>
  color: string
}) {
  const rect = buttonRef.current?.getBoundingClientRect()
  if (!rect) return null

  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  // 14 particles — mix of sizes and distances for a rich burst
  const particles = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * 2 * Math.PI + (Math.random() - 0.5) * 0.3
    const dist = 30 + Math.random() * 36
    const size = [6, 4, 5, 4, 6, 4, 5, 4, 6, 4, 5, 4, 6, 4][i]
    return { angle, dist, size, delay: i * 0.022 }
  })

  return (
    <AnimatePresence>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: cx,
            top: cy,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 2.5}px ${color}99`,
            zIndex: 99999,
          }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale:   [0, 1.4, 0],
            x:       [0, Math.cos(p.angle) * p.dist],
            y:       [0, Math.sin(p.angle) * p.dist],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.65,
            delay: p.delay,
            ease: [0.15, 0, 0.75, 1],
          }}
        />
      ))}
    </AnimatePresence>
  )
}

function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 1500,   // ← 1.5 s default
  variant = "primary",
  loading = false,
  className,
  disabled,
  type = "button",
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false)
  const [pressed, setPressed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const busyRef = useRef(false)

  const COLORS = {
    primary: "#2baffc",
    emerald: "#55c360",
    ghost:   "rgba(244,249,253,0.9)",
  }

  const BASE_STYLES: Record<string, React.CSSProperties> = {
    primary: { background: "#2baffc", color: "#010101" },
    emerald: { background: "#55c360", color: "#010101" },
    ghost:   { background: "transparent", color: "rgba(244,249,253,0.8)", border: "1px solid #1e1e24" },
  }

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading || busyRef.current) return
      busyRef.current = true

      // 1. Instant press-down
      setPressed(true)
      setTimeout(() => setPressed(false), 110)

      // 2. Fire particles
      setShowParticles(true)

      // 3. Wait full successDuration (1500 ms) BEFORE doing anything
      await new Promise<void>(res => setTimeout(res, successDuration))

      // 4. Clean up particles
      setShowParticles(false)
      busyRef.current = false

      // 5. NOW fire the real action
      onClick?.(e)
      onSuccess?.()
    },
    [disabled, loading, successDuration, onClick, onSuccess]
  )

  return (
    <>
      {showParticles && (
        <SuccessParticles buttonRef={buttonRef} color={COLORS[variant]} />
      )}

      <button
        ref={buttonRef}
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "font-mono-display font-bold uppercase tracking-wide",
          "rounded-lg select-none outline-none",
          "text-xs px-6 py-3",
          // press & particle scale states
          pressed
            ? "scale-90 transition-transform duration-75"
            : showParticles
            ? "scale-95 transition-transform duration-150"
            : "scale-100 transition-all duration-200",
          disabled || loading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer",
          // hover lifts — only when not animating
          !disabled && !loading && !showParticles && variant === "primary" &&
            "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(43,175,252,0.35)]",
          !disabled && !loading && !showParticles && variant === "emerald" &&
            "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(85,195,96,0.35)]",
          !disabled && !loading && !showParticles && variant === "ghost" &&
            "hover:border-[#2baffc] hover:text-[#2baffc]",
          className
        )}
        style={BASE_STYLES[variant]}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {children}

            {/* Cursor icon pops in when particles are flying */}
            <AnimatePresence>
              {showParticles && (
                <motion.span
                  key="click-icon"
                  initial={{ scale: 0, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.18 }}
                >
                  <MousePointerClick size={13} />
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}
      </button>
    </>
  )
}

export { ParticleButton }
export type { ParticleButtonProps }
