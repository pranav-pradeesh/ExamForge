"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MousePointerClick } from "lucide-react"

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSuccess?: () => void
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

  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const angles = [0, 60, 120, 180, 240, 300, 45, 135, 225, 315]

  return (
    <AnimatePresence>
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const dist = Math.random() * 40 + 25
        return (
          <motion.div
            key={i}
            className="fixed rounded-full pointer-events-none z-[9999]"
            style={{
              left: centerX,
              top: centerY,
              width: i % 3 === 0 ? 6 : 4,
              height: i % 3 === 0 ? 6 : 4,
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 0],
              x: [0, Math.cos(rad) * dist],
              y: [0, Math.sin(rad) * dist],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.55,
              delay: i * 0.03,
              ease: "easeOut",
            }}
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
  successDuration = 800,
  variant = "primary",
  loading = false,
  className,
  disabled,
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const COLORS = {
    primary: "#2baffc",
    emerald: "#55c360",
    ghost: "#f4f9fd",
  }

  const STYLES = {
    primary: {
      background: showParticles ? "#4dc4ff" : "#2baffc",
      color: "#010101",
    },
    emerald: {
      background: showParticles ? "#6dd978" : "#55c360",
      color: "#010101",
    },
    ghost: {
      background: "transparent",
      color: showParticles ? "#2baffc" : "rgba(244,249,253,0.8)",
      border: "1px solid #1e1e24",
    },
  }

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled || loading || showParticles) return
    setShowParticles(true)
    onClick?.(e)
    onSuccess?.()
    setTimeout(() => setShowParticles(false), successDuration)
  }

  const style = STYLES[variant]

  return (
    <>
      {showParticles && (
        <SuccessParticles buttonRef={buttonRef} color={COLORS[variant]} />
      )}
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-mono-display font-bold uppercase tracking-wide rounded-lg transition-all duration-150 select-none",
          "text-xs px-6 py-3",
          showParticles && "scale-95",
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
            {showParticles && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MousePointerClick size={13} />
              </motion.span>
            )}
          </>
        )}
      </button>
    </>
  )
}

export { ParticleButton }
export type { ParticleButtonProps }
