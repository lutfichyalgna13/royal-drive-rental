"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashLoaderProps {
  onComplete: () => void;
}

export default function SplashLoader({ onComplete }: SplashLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const duration = 2200; // 2.2 seconds total loading
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsLoaded(true);
            setTimeout(onComplete, 600); // allow fadeout before callback
          }, 400);
          return 100;
        }
        return Math.min(prev + step, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-[#090D1A] flex flex-col items-center justify-center text-white"
        >
          {/* Logo Animation */}
          <div className="flex flex-col items-center max-w-xs px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative mb-6"
            >
              {/* Crown Icon Emblem */}
              <svg
                width="72"
                height="72"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-accent"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d="M2 4L5 12L12 6L19 12L22 4L17 19H7L2 4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="4" r="1" fill="currentColor" />
                <circle cx="2" cy="2" r="1" fill="currentColor" />
                <circle cx="22" cy="2" r="1" fill="currentColor" />
              </svg>
            </motion.div>

            {/* Brand Title */}
            <motion.h1
              initial={{ letterSpacing: "0.2em", opacity: 0 }}
              animate={{ letterSpacing: "0.4em", opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="font-display font-light text-2xl md:text-3xl text-center text-accent tracking-[0.4em] uppercase"
            >
              ROYAL DRIVE
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="font-sans font-light text-xs text-slate-400 mt-2 tracking-widest uppercase text-center"
            >
              Premium Rental Experience
            </motion.p>

            {/* Progress Bar Container */}
            <div className="w-48 h-[1px] bg-slate-800 rounded-full overflow-hidden mt-10 relative">
              <motion.div
                className="h-full bg-accent"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress Percentage */}
            <motion.span
              key={Math.floor(progress)}
              className="font-display font-light text-[10px] text-accent mt-2 tracking-widest"
            >
              {Math.floor(progress)}%
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
