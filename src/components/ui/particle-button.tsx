"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MousePointerClick } from "lucide-react"

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSuccess?: () => void
  successDuration?: number
  variant?: "primary" | "emerald" | "ghost"
  loading?: boolean
  /** Kept for API compatibility — animation always awaits now */
  awaitAnimation?: boolean
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

  return (
    <AnimatePresence>
      {Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * 2 * Math.PI
        const dist = 30 + Math.random() * 32
        const size = i % 4 === 0 ? 7 : i % 3 === 0 ? 5 : 4
        return (
          <motion.div
            key={i}
            className="fixed rounded-full pointer-events-none"
            style={{
              left: cx, top: cy,
              width: size, height: size,
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              zIndex: 99999,
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.4, 0],
              x: [0, Math.cos(angle) * dist],
              y: [0, Math.sin(angle) * dist],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.65, delay: i * 0.022, ease: [0.2, 0, 0.8, 1] }}
          />
        )
      })}
    </AnimatePresence>
  )
}

function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 2000,
  variant = "primary",
  loading = false,
  awaitAnimation: _awaitAnimation, // consumed, not passed to DOM
  className,
  disabled,
  type = "button",
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false)
  const [pressed, setPressed] = useState(false)
  const busyRef = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const COLORS = { primary: "#2baffc", emerald: "#55c360", ghost: "rgba(244,249,253,0.9)" }
  const STYLES: Record<string, React.CSSProperties> = {
    primary: { background: "#2baffc", color: "#010101" },
    emerald: { background: "#55c360", color: "#010101" },
    ghost:   { background: "transparent", color: "rgba(244,249,253,0.8)", border: "1px solid #1e1e24" },
  }

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading || busyRef.current) return
      busyRef.current = true

      // 1. Instant press-down feel
      setPressed(true)
      setTimeout(() => setPressed(false), 110)

      // 2. Burst particles
      setShowParticles(true)

      // 3. Always wait full successDuration BEFORE navigating/acting
      await new Promise<void>(res => setTimeout(res, successDuration))

      // 4. Clean up
      setShowParticles(false)
      busyRef.current = false

      // 5. Fire action after animation completes
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
        disabled={disabled || loading || showParticles}
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "font-mono-display font-bold uppercase tracking-wide",
          "rounded-lg transition-all duration-150 select-none outline-none",
          "text-xs px-6 py-3",
          pressed ? "scale-90" : showParticles ? "scale-95" : "scale-100",
          disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          !disabled && !loading && variant !== "ghost" && "hover:-translate-y-0.5",
          !disabled && !loading && variant === "primary" && "hover:shadow-[0_8px_24px_rgba(43,175,252,0.35)]",
          !disabled && !loading && variant === "emerald" && "hover:shadow-[0_8px_24px_rgba(85,195,96,0.35)]",
          !disabled && !loading && variant === "ghost" && "hover:border-[#2baffc] hover:text-[#2baffc]",
          className
        )}
        style={STYLES[variant]}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {children}
            <AnimatePresence>
              {showParticles && (
                <motion.span
                  initial={{ scale: 0, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
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
