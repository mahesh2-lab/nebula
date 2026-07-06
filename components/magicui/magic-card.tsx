"use client"

import React, { useCallback, useEffect, useRef } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion"

import { cn } from "@/lib/utils"

interface MagicCardProps {
  children?: React.ReactNode
  className?: string
  gradientSize?: number
  gradientColor?: string
  gradientOpacity?: number
  gradientFrom?: string
  gradientTo?: string
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)
  const gradientSizeRef = useRef(gradientSize)

  useEffect(() => {
    gradientSizeRef.current = gradientSize
  }, [gradientSize])

  const reset = useCallback(() => {
    const off = -gradientSizeRef.current
    mouseX.set(off)
    mouseY.set(off)
  }, [mouseX, mouseY])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY]
  )

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) reset()
    }
    const handleBlur = () => reset()
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") reset()
    }

    window.addEventListener("pointerout", handleGlobalPointerOut)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("pointerout", handleGlobalPointerOut)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [reset])

  // Build gradient strings outside of JSX
  const borderBg = useMotionTemplate`
    linear-gradient(#09090B 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      #1f1f1f 100%
    ) border-box
  `

  const innerBg = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `

  return (
    <motion.div
      className={cn(
        "group/magic relative isolate overflow-hidden rounded-xl border border-transparent",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{
        background: borderBg,
      }}
    >
      {/* Solid background behind content */}
      <div className="absolute inset-px z-20 rounded-[inherit] bg-[#09090B]" />

      {/* Hover gradient overlay */}
      <motion.div
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/magic:opacity-100"
        style={{
          background: innerBg,
          opacity: gradientOpacity,
        }}
      />

      {/* Content layer */}
      <div className="relative z-40">{children}</div>
    </motion.div>
  )
}
