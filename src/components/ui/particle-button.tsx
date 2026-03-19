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
  children: React.ReactNode
  /** If true, the onClick fires AFTER the particle animation completes */
  awaitAnimation?: boolean
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

  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // 12 particles at even angles for a satisfying burst
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI
    const dist = 28 + Math.random() * 28
    const size = i % 4 === 0 ? 6 : i % 3 === 0 ? 5 : 4
    return { angle, dist, size, delay: i * 0.025 }
  })

  return (
    <AnimatePresence>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: centerX,
            top: centerY,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
            zIndex: 99999,
          }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.3, 0],
            x: [0, Math.cos(p.angle) * p.dist],
            y: [0, Math.sin(p.angle) * p.dist],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.5,
            delay: p.delay,
            ease: [0.2, 0, 0.8, 1],
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
  successDuration = 600,
  variant = "primary",
  loading = false,
  awaitAnimation = true,
  className,
  disabled,
  type = "button",
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false)
  const [pressed, setPressed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const animatingRef = useRef(false)

  const COLORS = {
    primary: "#2baffc",
    emerald: "#55c360",
    ghost: "rgba(244,249,253,0.8)",
  }

  const STYLES: Record<string, React.CSSProperties> = {
    primary: { background: '#2baffc', color: '#010101' },
    emerald: { background: '#55c360', color: '#010101' },
    ghost: {
      background: 'transparent',
      color: 'rgba(244,249,253,0.8)',
      border: '1px solid #1e1e24',
    },
  }

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading || animatingRef.current) return
    animatingRef.current = true

    // Trigger visual burst
    setShowParticles(true)
    setPressed(true)

    // Scale back up quickly
    setTimeout(() => setPressed(false), 100)

    if (awaitAnimation) {
      // Wait for particles to finish THEN fire the action
      await new Promise(res => setTimeout(res, successDuration))
      setShowParticles(false)
      animatingRef.current = false
      onClick?.(e)
      onSuccess?.()
    } else {
      // Fire immediately, animation plays in background
      onClick?.(e)
      onSuccess?.()
      setTimeout(() => {
        setShowParticles(false)
        animatingRef.current = false
      }, successDuration)
    }
  }, [disabled, loading, awaitAnimation, successDuration, onClick, onSuccess])

  const style = STYLES[variant]

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
        style={style}
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
