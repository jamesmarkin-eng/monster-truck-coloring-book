"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { ColorPalette } from "./color-palette"
import { RotateCcw, ArrowLeft, Sparkles, Download, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomColoringPageProps {
  imageUrl: string
  pageName?: string
  onBack: () => void
}

export function CustomColoringPage({ imageUrl, pageName = "My Truck", onBack }: CustomColoringPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState("#EF4444")
  const [isDrawing, setIsDrawing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [brushSize] = useState(12)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const canvasSizeRef = useRef({ width: 0, height: 0 })

  // Load the coloring page image
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const img = new Image()
    // Only set crossOrigin for external URLs (data: or https:)
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('https:')) {
      img.crossOrigin = "anonymous"
    }
    
    img.onload = () => {
      imageRef.current = img

      // Calculate display size based on container
      const maxWidth = Math.min(window.innerWidth - 48, 600)
      const aspectRatio = img.height / img.width
      const displayWidth = maxWidth
      const displayHeight = maxWidth * aspectRatio

      // Store dimensions for coordinate calculations
      canvasSizeRef.current = { width: displayWidth, height: displayHeight }

      // Scale canvas buffer for high-DPI screens
      const dpr = window.devicePixelRatio || 1
      canvas.width = displayWidth * dpr
      canvas.height = displayHeight * dpr
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight)

      setImageLoaded(true)
    }
    
    img.onerror = () => {
      // Retry without crossOrigin for local images
      const retryImg = new Image()
      retryImg.onload = () => {
        imageRef.current = retryImg
        const maxWidth = Math.min(window.innerWidth - 48, 600)
        const aspectRatio = retryImg.height / retryImg.width
        const dpr = window.devicePixelRatio || 1
        canvasSizeRef.current = { width: maxWidth, height: maxWidth * aspectRatio }
        canvas.width = maxWidth * dpr
        canvas.height = maxWidth * aspectRatio * dpr
        canvas.style.width = `${maxWidth}px`
        canvas.style.height = `${maxWidth * aspectRatio}px`
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(dpr, dpr)
          ctx.drawImage(retryImg, 0, 0, maxWidth, maxWidth * aspectRatio)
        }
        setImageLoaded(true)
      }
      retryImg.src = imageUrl
    }
    
    img.src = imageUrl
  }, [imageUrl])

  const getCanvasCoordinates = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    // Scale from CSS pixels to our logical canvas coordinates
    const { width, height } = canvasSizeRef.current
    const scaleX = width / rect.width
    const scaleY = height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
  }, [])

  const draw = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = selectedColor
    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }, [selectedColor, brushSize])

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const coords = getCanvasCoordinates(e)
    if (coords) {
      draw(coords.x, coords.y)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 200)
    }
  }, [getCanvasCoordinates, draw])

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const coords = getCanvasCoordinates(e)
    if (coords) {
      draw(coords.x, coords.y)
    }
  }, [isDrawing, getCanvasCoordinates, draw])

  const handleEnd = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleReset = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    if (!ctx || !img || !canvas) return

    const { width, height } = canvasSizeRef.current
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
  }, [])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a download link
    const link = document.createElement('a')
    link.download = `${pageName.toLowerCase().replace(/\s+/g, '-')}-colored.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    // Show success feedback
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 2000)
  }, [pageName])

  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const imageData = canvas.toDataURL('image/png')
    // Sanitize pageName to prevent XSS via document.write
    const safeName = pageName.replace(/[<>"'&]/g, '')

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>${safeName} - Coloring Page</title>
<style>
@page { margin: 0.5in; }
body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
img { max-width: 100%; max-height: 100vh; object-fit: contain; }
</style>
</head>
<body>
<img src="${imageData}" alt="Coloring Page" onload="window.print();window.close();" />
</body>
</html>`)
    printWindow.document.close()
  }, [pageName])

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card shadow-md border-b-4 border-accent/30">
        <button
          onClick={onBack}
          className={cn(
            "flex items-center justify-center",
            "p-3 rounded-xl",
            "bg-secondary text-secondary-foreground",
            "font-bold shadow-md",
            "transition-all duration-200 active:scale-95",
            "min-h-[48px] min-w-[48px]"
          )}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h1 className="text-lg md:text-xl font-bold text-foreground text-center flex-1 px-2 truncate">
          {pageName}
        </h1>
        
        <button
          onClick={handleReset}
          className={cn(
            "flex items-center justify-center",
            "p-3 rounded-xl",
            "bg-secondary text-secondary-foreground",
            "font-bold shadow-md",
            "transition-all duration-200 active:scale-95",
            "min-h-[48px] min-w-[48px]"
          )}
          aria-label="Start over"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Main coloring area */}
      <main className="flex-1 relative p-4 flex items-center justify-center overflow-hidden">
        {/* Celebration effect */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <Sparkles className="w-16 h-16 text-yellow-400 animate-ping" />
          </div>
        )}

        {/* Save success toast */}
        {showSaveSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-accent text-accent-foreground rounded-full font-bold shadow-lg animate-bounce">
            Saved!
          </div>
        )}

        {/* Canvas container */}
        <div className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl border-4 border-accent/20 overflow-hidden p-2">
          {!imageLoaded && (
            <div className="aspect-[3/4] flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            className={cn("w-full h-auto rounded-2xl touch-none", !imageLoaded && "hidden")}
            style={{ touchAction: 'none' }}
          />
        </div>
      </main>

      {/* Color palette and actions */}
      <footer className="p-4 pb-6 bg-card/80 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Save and Print buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center justify-center gap-2",
                "px-5 py-3 rounded-xl",
                "bg-accent text-accent-foreground",
                "font-bold shadow-md",
                "transition-all duration-200 active:scale-95",
                "min-h-[48px]"
              )}
            >
              <Download className="w-5 h-5" />
              <span>Save</span>
            </button>
            <button
              onClick={handlePrint}
              className={cn(
                "flex items-center justify-center gap-2",
                "px-5 py-3 rounded-xl",
                "bg-primary text-primary-foreground",
                "font-bold shadow-md",
                "transition-all duration-200 active:scale-95",
                "min-h-[48px]"
              )}
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
          </div>

          {/* Currently selected color indicator */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Draw with:</span>
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
