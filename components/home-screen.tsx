"use client"

import { useState } from "react"
import { CameraCapture } from "./camera-capture"
import { CustomColoringPage } from "./custom-coloring-page"
import { Camera, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Pre-made coloring pages
const premadePages = [
  {
    id: "wave-wrecker",
    name: "Wave Wrecker",
    src: "/coloring-pages/wave-wrecker.jpg",
  },
  {
    id: "dino-steg",
    name: "Dino-Steg",
    src: "/coloring-pages/dino-steg.jpg",
  },
]

type AppView = "home" | "camera" | "coloring"

export function HomeScreen() {
  const [currentView, setCurrentView] = useState<AppView>("home")
  const [coloringImage, setColoringImage] = useState<string | null>(null)
  const [coloringPageName, setColoringPageName] = useState<string>("My Truck")

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

  // Camera capture view
  if (currentView === "camera") {
    return (
      <CameraCapture
        onImageCaptured={handleCameraCapture}
        onClose={() => setCurrentView("home")}
      />
    )
  }

  // Coloring page view
  if (currentView === "coloring" && coloringImage) {
    return (
      <CustomColoringPage
        imageUrl={coloringImage}
        pageName={coloringPageName}
        onBack={handleBack}
      />
    )
  }

  // Home screen
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 pt-8 text-center bg-card shadow-md border-b-4 border-primary/30">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Monster Trucks
        </h1>
        <p className="text-lg text-muted-foreground">
          Coloring Book
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Hero camera button */}
          <section className="mt-4">
            <button
              onClick={() => setCurrentView("camera")}
              className={cn(
                "w-full flex flex-col items-center justify-center gap-4",
                "p-8 rounded-3xl",
                "bg-primary text-primary-foreground",
                "font-bold shadow-xl",
                "transition-all duration-200 active:scale-[0.98]",
                "min-h-[160px]"
              )}
            >
              <Camera className="w-16 h-16" />
              <span className="text-2xl">Take a Photo</span>
              <span className="text-base opacity-80 font-normal">
                Turn your toy into a coloring page
              </span>
            </button>
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-1 bg-border rounded-full" />
            <span className="text-muted-foreground font-medium">or pick one</span>
            <div className="flex-1 h-1 bg-border rounded-full" />
          </div>

          {/* Pre-made coloring pages gallery */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Ready to Color</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {premadePages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPremade(page)}
                  className={cn(
                    "flex flex-col items-center gap-2",
                    "p-3 rounded-2xl",
                    "bg-card border-2 border-border",
                    "shadow-md hover:shadow-lg",
                    "transition-all duration-200 active:scale-[0.98]"
                  )}
                >
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                    <img
                      src={page.src}
                      alt={page.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {page.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
