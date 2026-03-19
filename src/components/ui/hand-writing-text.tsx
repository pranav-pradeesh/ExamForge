"use client"

import { motion } from "framer-motion"

interface HandWrittenTitleProps {
  title?: string
  subtitle?: string
  titleClassName?: string
  subtitleClassName?: string
}

function HandWrittenTitle({
  title = "Forge Your Rank.",
  subtitle = "Authentic CBT mock exams powered by AI.",
  titleClassName = "",
  subtitleClassName = "",
}: HandWrittenTitleProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.8, ease: [0.43, 0.13, 0.23, 0.96] as [number,number,number,number] },
        opacity: { duration: 0.4 },
      },
    },
  }

  const drawDelayed = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.4, ease: [0.43, 0.13, 0.23, 0.96] as [number,number,number,number], delay: 0.3 },
        opacity: { duration: 0.4, delay: 0.3 },
      },
    },
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto py-14">
      {/* Animated SVG loops */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 380"
          initial="hidden"
          animate="visible"
          className="w-full h-full"
        >
          {/* Outer loop — dodger blue */}
          <motion.path
            d="M 920 55
               C 1220 195, 1020 355, 600 375
               C 230 375, 100 315, 100 195
               C 100 75, 320 35, 600 35
               C 880 35, 960 155, 920 155"
            fill="none"
            strokeWidth="2.5"
            stroke="#2baffc"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            style={{ opacity: 0.3 }}
          />
          {/* Inner loop — emerald */}
          <motion.path
            d="M 855 85
               C 1095 215, 955 335, 600 350
               C 290 350, 182 295, 192 195
               C 202 95, 382 65, 600 65
               C 818 65, 876 165, 855 165"
            fill="none"
            strokeWidth="1.5"
            stroke="#55c360"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={drawDelayed}
            style={{ opacity: 0.18 }}
          />
        </motion.svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 text-center">
        <motion.h1
          className={`font-mono-display font-bold tracking-tight leading-none ${titleClassName}`}
          style={{
            color: '#f4f9fd',
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            letterSpacing: '-0.03em',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {title.includes('Rank') ? (
            <>
              {title.split('Rank')[0]}
              <span style={{ color: '#2baffc' }}>Rank</span>
              {title.split('Rank')[1]}
            </>
          ) : title}
        </motion.h1>

        {subtitle && (
          <motion.p
            className={`leading-relaxed ${subtitleClassName}`}
            style={{ color: 'rgba(244,249,253,0.6)', maxWidth: '520px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.9 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  )
}

export { HandWrittenTitle }
