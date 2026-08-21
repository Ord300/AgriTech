"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  src: string
  alt: string
  title: string
  subtitle: string
}

const slides: Slide[] = [
  {
    src: "/farmers-hero.jpg",
    alt: "Agriculteurs récoltant dans les champs",
    title: "Du Champ à Votre Table",
    subtitle: "Des produits frais directement des exploitations agricoles",
  },
  {
    src: "/red-gala-apples-fresh.jpg",
    alt: "Pommes Gala fraîches",
    title: "Fruits de Saison",
    subtitle: "Des pommes croquantes cueillies à maturité",
  },
  {
    src: "/honey-jar-lavender.jpg",
    alt: "Miel artisanal à la lavande",
    title: "Produits Artisanaux",
    subtitle: "Miel pur et produits naturels de nos producteurs",
  },
  {
    src: "/fresh-red-tomatoes-on-vine.jpg",
    alt: "Tomates rouges fraîches sur pied",
    title: "Légumes Frais",
    subtitle: "Des tomates gorgées de soleil, cultivées localement",
  },
  {
    src: "/fresh-green-zucchini-vegetables.jpg",
    alt: "Courgettes vertes fraîches",
    title: "Circuit Court",
    subtitle: "Zéro intermédiaire, zéro gaspillage, 100% local",
  },
]

const SLIDE_DURATION = 3000 // 3 secondes

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goToSlide = useCallback((index: number) => {
    setCurrent((prev) => (index + slides.length) % slides.length)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return

    timerRef.current = setInterval(() => {
      nextSlide()
    }, SLIDE_DURATION)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, nextSlide])

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-card shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "hero-slide-active opacity-100" : "opacity-0"
          }`}
          aria-hidden={index !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Overlay dégradé */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Texte superposé */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <p className="text-lg font-bold text-white drop-shadow-md sm:text-xl">{slide.title}</p>
            <p className="mt-1 text-sm text-white/85 drop-shadow sm:text-base">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Flèches de navigation */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Image précédente"
        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-black/60 group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Image suivante"
        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-black/60 group-hover:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicateurs (points) */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Aller à l'image ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current
                ? "w-6 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  )
}