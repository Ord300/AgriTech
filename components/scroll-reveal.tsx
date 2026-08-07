"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** Direction d'apparition : "up" (défaut), "left", "right" ou "zoom" */
  variant?: "up" | "left" | "right" | "zoom"
  /** Si true, l'animation ne joue qu'une fois. Sinon l'élément disparaît/reparaît au scroll. */
  once?: boolean
}

const variantClasses = {
  left: "from-left",
  right: "from-right",
  zoom: "from-zoom",
} as const

export function ScrollReveal({ children, className, delay = 0, variant = "up", once = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-reveal",
        variant !== "up" && variantClasses[variant as keyof typeof variantClasses],
        isVisible && "is-visible",
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
