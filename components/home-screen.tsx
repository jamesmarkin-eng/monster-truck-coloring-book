"use client"

import { useState, useRef, useEffect } from "react"
import { CameraCapture } from "./camera-capture"
import { CustomColoringPage } from "./custom-coloring-page"
import { Camera, Sparkles, ChevronRight, Palette, Star } from "lucide-react"
import { cn } from "@/lib/utils"

// Pre-made coloring pages with categories
const premadePages = [
  {
    id: "wave-wrecker",
    name: "Wave Wrecker",
    src: "/coloring-pages/wave-wrecker.jpg",
    difficulty: "easy",
  },
  {
    id: "megaladon",
    name: "Megaladon",
    src: "/coloring-pages/megaladon.png",
    difficulty: "medium",
  },
  {
    id: "rageasaur",
    name: "Rageasaur",
    src: "/coloring-pages/rageasaur.png",
    difficulty: "easy",
  },
  {
    id: "dino-steg",
    name: "Motosaurus",
    src: "/coloring-pages/dino-steg.jpg",
    difficulty: "hard",
  },
  {
    id: "skelesaurus",
    name: "Skelesaurus",
    src: "/coloring-pages/skelesaurus.png",
    difficulty: "medium",
  },
  {
    id: "zombie",
    name: "Zombie",
    src: "/coloring-pages/zombie.png",
    difficulty: "hard",
  },
  {
    id: "rhinomite",
    name: "Rhinomite",
    src: "/coloring-pages/rhinomite.png",
    difficulty: "medium",
  },
]

const difficultyConfig = {
  easy: { label: "Easy", stars: 1, color: "bg-accent text-accent-foreground" },
  medium: { label: "Medium", stars: 2, color: "bg-primary text-primary-foreground" },
  hard: { label: "Hard", stars: 3, color: "bg-foreground text-background" },
}

type AppView = "home" | "camera" | "coloring"

function FeaturedCard({ page, onClick }: { page: typeof premadePages[0]; onClick: () => void }) {
  const diff = difficultyConfig[page.difficulty as keyof typeof difficultyConfig]
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[280px] snap-center",
        "rounded-3xl overflow-hidden",
        "bg-card shadow-lg",
        "transition-all duration-300 active:scale-[0.97]",
        "group"
      )}
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img
          src={page.src}
          alt={page.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent">
        <div className="flex items-center gap-1.5 mb-1">
          {Array.from({ length: diff.stars }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
          ))}
        </div>
        <h3 className="text-lg font-bold text-background text-left">{page.name}</h3>
      </div>
    </button>
  )
}

function TruckCard({ page, onClick }: { page: typeof premadePages[0]; onClick: () => void }) {
  const diff = difficultyConfig[page.difficulty as keyof typeof difficultyConfig]
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-3 rounded-2xl",
        "bg-card shadow-sm border border-border",
        "transition-all duration-200 active:scale-[0.98]",
        "group w-full text-left"
      )}
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        <img
          src={page.src}
          alt={page.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground text-base truncate">{page.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: diff.stars }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-primary/70 text-primary/70" />
          ))}
          {Array.from({ length: 3 - diff.stars }).map((_, i) => (
            <Star key={i} className="w-3 h-3 text-border" />
          ))}
          <span className="text-xs text-muted-foreground ml-1">{diff.label}</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </button>
  )
}

export function HomeScreen() {
  const [currentView, setCurrentView] = useState<AppView>("home")
  const [coloringImage, setColoringImage] = useState<string | null>(null)
  const [coloringPageName, setColoringPageName] = useState<string>("My Truck")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const featured = premadePages.slice(0, 4)
  const allPages = premadePages

  // Track active featured card for the dot indicators
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft
      const cardWidth = 280 + 16 // card width + gap
      const idx = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(idx, featured.length - 1))
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [featured.length])

  const handleCameraCapture = (imageUrl: string) => {
    setColoringImage(imageUrl)
    setColoringPageName("My Truck")
    setCurrentView("coloring")
  }

  const handleSelectPremade = (page: typeof premadePages[0]) => {
    setColoringImage(page.src)
    setColoringPageName(page.name)
    setCurrentView("coloring")
  }

  const handleBack = () => {
    setCurrentView("home")
    setColoringImage(null)
  }

  if (currentView === "camera") {
    return (
      <CameraCapture
        onImageCaptured={handleCameraCapture}
        onClose={() => setCurrentView("home")}
      />
    )
  }

  if (currentView === "coloring" && coloringImage) {
    return (
      <CustomColoringPage
        imageUrl={coloringImage}
        pageName={coloringPageName}
        onBack={handleBack}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Compact Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight text-balance">
            Monster Trucks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Coloring Book</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Palette className="w-5 h-5 text-primary" />
        </div>
      </header>

      <main className="flex-1 pb-8">
        {/* AI Camera Card */}
        <section className="px-5 mt-2">
          <button
            onClick={() => setCurrentView("camera")}
            className={cn(
              "w-full flex items-center gap-4 p-5 rounded-2xl",
              "bg-foreground text-background",
              "shadow-xl",
              "transition-all duration-200 active:scale-[0.98]",
              "min-h-[80px]"
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <Camera className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-lg font-bold block">Scan Your Toy</span>
              <span className="text-sm opacity-70 block mt-0.5">
                AI turns your photo into a coloring page
              </span>
            </div>
            <Sparkles className="w-5 h-5 opacity-50 flex-shrink-0" />
          </button>
        </section>

        {/* Featured Carousel */}
        <section className="mt-8">
          <div className="flex items-center justify-between px-5 mb-4">
            <h2 className="text-lg font-bold text-foreground">Featured</h2>
            <span className="text-sm text-muted-foreground">{featured.length} trucks</span>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {featured.map((page) => (
              <FeaturedCard
                key={page.id}
                page={page}
                onClick={() => handleSelectPremade(page)}
              />
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {featured.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>
        </section>

        {/* All Trucks List */}
        <section className="mt-8 px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">All Trucks</h2>
            <span className="text-sm text-muted-foreground">{allPages.length} available</span>
          </div>

          <div className="flex flex-col gap-3">
            {allPages.map((page) => (
              <TruckCard
                key={page.id}
                page={page}
                onClick={() => handleSelectPremade(page)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
