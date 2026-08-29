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
      className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] border bg-card p-1.5 shadow-2xl shadow-primary/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
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
            {/* Overlay dégradé premium */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent mix-blend-overlay" />

            {/* Texte superposé */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {index === 0 ? "À la une" : `TerraFrais • ${slide.title}`}
              </span>
              <p className="mt-3 text-xl font-extrabold leading-tight text-white drop-shadow-md sm:text-2xl">{slide.title}</p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-white/90 drop-shadow sm:text-[14px]">{slide.subtitle}</p>
            </div>
          </div>
        ))}

        {/* Flèches de navigation */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Image précédente"
          className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-white group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Image suivante"
          className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-white group-hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Indicateurs (points) */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Aller à l'image ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            key={current}
            className="h-full bg-white"
            style={{
              animation: isPaused ? "none" : `progress ${SLIDE_DURATION}ms linear forwards`,
              width: isPaused ? "0%" : undefined,
            }}
          />
        </div>
      </div>
    </div>
  )
}