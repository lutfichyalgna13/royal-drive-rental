"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 40, stiffness: 400, mass: 0.4 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only show custom cursor on devices that support hover (fine pointing devices like a mouse)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;
    
    Promise.resolve().then(() => {
      setEnabled(true);
    });

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]') ||
        target.classList.contains("interactive-cursor")
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <>
      {/* Inner Dot */}
      <motion.div
        className="custom-cursor"
        style={{ left: mouseX, top: mouseY }}
        animate={{
          scale: hovered ? 1.5 : 1,
          backgroundColor: hovered ? "#FFFFFF" : "#DC2626",
        }}
      />
      {/* Outer Ring */}
      <motion.div
        className="custom-cursor-ring"
        style={{ left: ringX, top: ringY }}
        animate={{
          scale: hovered ? 1.8 : 1,
          borderColor: hovered ? "#FFFFFF" : "rgba(220, 38, 38, 0.5)",
          borderWidth: hovered ? "2px" : "1px",
        }}
      />
    </>
  );
}
