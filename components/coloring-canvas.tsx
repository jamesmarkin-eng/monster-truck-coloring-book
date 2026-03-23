"use client"

import { useState, useRef, useCallback } from "react"
import { MonsterTruckSVG, monsterTrucks } from "./monster-trucks"
import { ColorPalette } from "./color-palette"
import { TruckSelector } from "./truck-selector"
import { CameraCapture } from "./camera-capture"
import { CustomColoringPage } from "./custom-coloring-page"
import { RotateCcw, Sparkles, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

export function ColoringCanvas() {
  const [currentTruckIndex, setCurrentTruckIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState("#EF4444")
  const [truckColors, setTruckColors] = useState<Record<number, Record<string, string>>>({})
  const [showCelebration, setShowCelebration] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [customColoringImage, setCustomColoringImage] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const currentTruck = monsterTrucks[currentTruckIndex]
  const currentColors = truckColors[currentTruckIndex] || {}

  const handlePathClick = useCallback((pathId: string) => {
    setTruckColors(prev => ({
      ...prev,
      [currentTruckIndex]: {
        ...(prev[currentTruckIndex] || {}),
        [pathId]: selectedColor
      }
    }))

    // Fun celebration when coloring
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 300)
  }, [currentTruckIndex, selectedColor])

  const handleReset = () => {
    setTruckColors(prev => ({
      ...prev,
      [currentTruckIndex]: {}
    }))
  }

  const handleTruckChange = (index: number) => {
    setCurrentTruckIndex(index)
  }

  const handleImageCaptured = (imageUrl: string) => {
    setCustomColoringImage(imageUrl)
    setShowCamera(false)
  }

  // Show camera capture screen
  if (showCamera) {
    return (
      <CameraCapture 
        onImageCaptured={handleImageCaptured}
        onClose={() => setShowCamera(false)}
      />
    )
  }

  // Show custom coloring page if we have one
  if (customColoringImage) {
    return (
      <CustomColoringPage 
        imageUrl={customColoringImage}
        onBack={() => setCustomColoringImage(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card shadow-md border-b-4 border-primary/30">
        {/* Camera button - take photo of real truck */}
        <button
          onClick={() => setShowCamera(true)}
          className={cn(
            "flex items-center justify-center gap-2",
            "px-4 py-3 rounded-xl",
            "bg-accent text-accent-foreground",
            "font-bold shadow-md",
            "transition-all duration-200 active:scale-95",
            "min-h-[48px]"
          )}
          aria-label="Take a photo of your truck"
        >
          <Camera className="w-5 h-5" />
          <span className="hidden sm:inline">Photo</span>
        </button>
        
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Color Me!
        </h1>
        
        {/* Reset button */}
        <button
          onClick={handleReset}
          className={cn(
            "flex items-center justify-center gap-2",
            "px-4 py-3 rounded-xl",
            "bg-secondary text-secondary-foreground",
            "font-bold shadow-md",
            "transition-all duration-200 active:scale-95",
            "min-h-[48px]"
          )}
          aria-label="Start over"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="hidden sm:inline">New</span>
        </button>
      </header>

      {/* Truck selector */}
      <div className="py-4 bg-card/50">
        <TruckSelector 
          currentTruckIndex={currentTruckIndex}
          onSelectTruck={handleTruckChange}
        />
      </div>

      {/* Main coloring area */}
      <main className="flex-1 relative p-4 flex items-center justify-center overflow-hidden">
        {/* Celebration effect */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <Sparkles className="w-16 h-16 text-yellow-400 animate-ping" />
          </div>
        )}

        {/* Canvas container */}
        <div className="w-full max-w-2xl aspect-[4/3] bg-card rounded-3xl shadow-2xl border-4 border-primary/20 overflow-hidden">
          <MonsterTruckSVG
            truck={currentTruck}
            colors={currentColors}
            onPathClick={handlePathClick}
            svgRef={svgRef}
          />
        </div>
      </main>

      {/* Color palette - fixed at bottom */}
      <footer className="p-4 pb-6 bg-card/80 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-2xl mx-auto">
          {/* Currently selected color indicator */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-sm font-medium text-muted-foreground">Tap a color:</span>
            <div 
              className="w-8 h-8 rounded-full border-4 border-foreground shadow-md"
              style={{ backgroundColor: selectedColor }}
              aria-label="Currently selected color"
            />
          </div>
          
          <ColorPalette 
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
        </div>
      </footer>
    </div>
  )
}
