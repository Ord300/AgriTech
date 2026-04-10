"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface StarRatingProps {
  rating: number
  max?: number
  readonly?: boolean
  onChange?: (rating: number) => void
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StarRating({
  rating,
  max = 5,
  readonly = true,
  onChange,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const handleMouseEnter = (index: number) => {
    if (!readonly) setHoverRating(index)
  }

  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(null)
  }

  const handleClick = (index: number) => {
    if (!readonly && onChange) onChange(index)
  }

  return (
    <div className={cn("flex gap-0.5", className)}>
      {[...Array(max)].map((_, i) => {
        const starIndex = i + 1
        const activeRating = hoverRating !== null ? hoverRating : rating
        const isFilled = starIndex <= activeRating
        const isPartial = !isFilled && starIndex - 0.5 <= activeRating

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn(
              "focus:outline-none transition-colors",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : isPartial
                  ? "fill-yellow-400 text-yellow-400 opacity-50"
                  : "text-gray-300"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
