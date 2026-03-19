"use client";

import { motion } from "framer-motion";

interface HandWrittenTitleProps {
  title?: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

function HandWrittenTitle({
  title = "Hand Written",
  subtitle,
  titleClassName = "",
  subtitleClassName = "",
}: HandWrittenTitleProps) {
  const drawMain = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] as const },
        opacity: { duration: 0.5 },
      },
    },
  };

  const drawSecond = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 3.2, delay: 0.4, ease: [0.43, 0.13, 0.23, 0.96] as const },
        opacity: { duration: 0.5, delay: 0.4 },
      },
    },
  };

  const drawAccent = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, delay: 0.8, ease: [0.43, 0.13, 0.23, 0.96] as const },
        opacity: { duration: 0.5, delay: 0.8 },
      },
    },
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-16">
      {/* Animated SVG rings drawn behind text */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 400"
          initial="hidden"
          animate="visible"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Outer dodger-blue orbital */}
          <motion.path
            d="M 950 55 C 1210 175, 1060 345, 600 362 C 245 362, 95 308, 95 198 C 95 88, 298 38, 600 38 C 872 38, 952 118, 952 118"
            fill="none"
            strokeWidth="2"
            stroke="#2baffc"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={drawMain}
            style={{ opacity: 0.28 }}
          />
          {/* Inner emerald orbital */}
          <motion.path
            d="M 875 78 C 1095 198, 948 332, 600 347 C 288 347, 158 293, 158 198 C 158 103, 338 63, 600 63 C 818 63, 876 143, 876 143"
            fill="none"
            strokeWidth="1.5"
            stroke="#55c360"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={drawSecond}
            style={{ opacity: 0.18 }}
          />
          {/* Small accent dot trail */}
          <motion.path
            d="M 598 38 C 598 38, 602 42, 598 48"
            fill="none"
            strokeWidth="6"
            stroke="#2baffc"
            strokeLinecap="round"
            variants={drawAccent}
            style={{ opacity: 0.7 }}
          />
          <motion.path
            d="M 598 362 C 598 362, 602 356, 598 350"
            fill="none"
            strokeWidth="6"
            stroke="#55c360"
            strokeLinecap="round"
            variants={drawAccent}
            style={{ opacity: 0.7 }}
          />
        </motion.svg>
      </div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 text-center">
        <motion.h1
          className={`font-mono-display font-bold leading-none tracking-tight ${titleClassName}`}
          style={{ color: '#f4f9fd' }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* "Forge Your" plain, "Rank." in dodger blue */}
          {title.includes('Rank') ? (
            <>
              {title.replace(' Rank.', '')}{' '}
              <span style={{ color: '#2baffc' }}>Rank.</span>
            </>
          ) : title}
        </motion.h1>

        {subtitle && (
          <motion.p
            className={subtitleClassName}
            style={{ color: 'rgba(244,249,253,0.6)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export { HandWrittenTitle };
