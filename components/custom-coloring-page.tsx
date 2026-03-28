"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { ColorPalette } from "./color-palette"
import {
  RotateCcw,
  ArrowLeft,
  Download,
  Printer,
  Minus,
  Plus,
  Eraser,
  Paintbrush,
  Undo2,
  Redo2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomColoringPageProps {
  imageUrl: string
  pageName?: string
  onBack: () => void
}

type Tool = "brush" | "eraser"

export function CustomColoringPage({ imageUrl, pageName = "My Truck", onBack }: CustomColoringPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState("#EF4444")
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(12)
  const [activeTool, setActiveTool] = useState<Tool>("brush")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const canvasSizeRef = useRef({ width: 0, height: 0 })

  // Undo/Redo history
  const historyRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const brushSizes = [4, 8, 12, 20, 32]

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Trim any redo states beyond current index
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(imageData)

    // Limit history to 30 entries
    if (historyRef.current.length > 30) {
      historyRef.current.shift()
    } else {
      historyIndexRef.current++
    }

    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(false)
  }, [])

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    historyIndexRef.current--
    const imageData = historyRef.current[historyIndexRef.current]
    ctx.putImageData(imageData, 0, 0)

    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(true)
  }, [])

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    historyIndexRef.current++
    const imageData = historyRef.current[historyIndexRef.current]
    ctx.putImageData(imageData, 0, 0)

    setCanUndo(true)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }, [])

  // Load the coloring page image
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    setImageLoaded(false)

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      imageRef.current = img

      const maxWidth = Math.min(window.innerWidth - 32, 600)
      const aspectRatio = img.height / img.width
      const displayWidth = maxWidth
      const displayHeight = maxWidth * aspectRatio

      canvasSizeRef.current = { width: displayWidth, height: displayHeight }

      const dpr = window.devicePixelRatio || 1
      canvas.width = displayWidth * dpr
      canvas.height = displayHeight * dpr
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight)

      setImageLoaded(true)

      // Save initial state to history
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      historyRef.current = [imageData]
      historyIndexRef.current = 0
      setCanUndo(false)
      setCanRedo(false)
    }

    img.onerror = () => {
      console.error("Image failed to load:", imageUrl)
    }

    if (imageUrl.startsWith("/")) {
      img.src = `${window.location.origin}${imageUrl}`
    } else {
      img.src = imageUrl
    }
  }, [imageUrl])

  const getCanvasCoordinates = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const rect = canvas.getBoundingClientRect()
      const { width, height } = canvasSizeRef.current
      const scaleX = width / rect.width
      const scaleY = height / rect.height

      if ("touches" in e) {
        const touch = e.touches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      } else {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        }
      }
    },
    []
  )

  const draw = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      if (activeTool === "eraser") {
        // Eraser: redraw the original image in that area
        const img = imageRef.current
        if (!img) return
        const { width, height } = canvasSizeRef.current
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, brushSize, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, 0, 0, width, height)
        ctx.restore()
      } else {
        ctx.globalCompositeOperation = "multiply"
        ctx.fillStyle = selectedColor
        ctx.beginPath()
        ctx.arc(x, y, brushSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = "source-over"
      }
    },
    [selectedColor, brushSize, activeTool]
  )

  const handleStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      setIsDrawing(true)
      const coords = getCanvasCoordinates(e)
      if (coords) {
        draw(coords.x, coords.y)
      }
    },
    [getCanvasCoordinates, draw]
  )

  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDrawing) return
      e.preventDefault()
      const coords = getCanvasCoordinates(e)
      if (coords) {
        draw(coords.x, coords.y)
      }
    },
    [isDrawing, getCanvasCoordinates, draw]
  )

  const handleEnd = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
    }
  }, [isDrawing, saveToHistory])

  const handleReset = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const img = imageRef.current
    if (!ctx || !img || !canvas) return

    const { width, height } = canvasSizeRef.current
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    saveToHistory()
  }, [saveToHistory])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${pageName.toLowerCase().replace(/\s+/g, "-")}-colored.png`
    link.href = canvas.toDataURL("image/png")
    link.click()

    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 2000)
  }, [pageName])

  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const imageData = canvas.toDataURL("image/png")
    const safeName = pageName.replace(/[<>"'&]/g, "")

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

  const decreaseBrush = () => {
    const idx = brushSizes.indexOf(brushSize)
    if (idx > 0) setBrushSize(brushSizes[idx - 1])
  }

  const increaseBrush = () => {
    const idx = brushSizes.indexOf(brushSize)
    if (idx < brushSizes.length - 1) setBrushSize(brushSizes[idx + 1])
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header bar */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-background">
        <button
          onClick={onBack}
          className={cn(
            "flex items-center justify-center",
            "w-10 h-10 rounded-full",
            "bg-muted text-foreground",
            "transition-all duration-200 active:scale-90",
            "min-h-[44px] min-w-[44px]"
          )}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground text-center flex-1 px-2 truncate">
          {pageName}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "bg-muted text-foreground",
              "transition-all duration-200 active:scale-90",
              "min-h-[44px] min-w-[44px]"
            )}
            aria-label="Save"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "bg-muted text-foreground",
              "transition-all duration-200 active:scale-90",
              "min-h-[44px] min-w-[44px]"
            )}
            aria-label="Print"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main coloring area */}
      <main className="flex-1 relative px-4 flex items-center justify-center overflow-hidden">
        {/* Save success toast */}
        {showSaveSuccess && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-bold shadow-lg text-sm animate-in fade-in slide-in-from-top-2">
            Saved to device
          </div>
        )}

        {/* Canvas container */}
        <div className="w-full max-w-2xl bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
          {!imageLoaded && (
            <div className="aspect-[3/4] flex items-center justify-center">
              <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
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
            className={cn(
              "w-full h-auto touch-none",
              !imageLoaded && "hidden",
              activeTool === "eraser" && "cursor-cell"
            )}
            style={{ touchAction: "none" }}
          />
        </div>
      </main>

      {/* Bottom toolbar */}
      <footer className="p-4 pb-8 bg-background">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {/* Tool bar - dark surface */}
          <div className="flex items-center justify-between bg-tool-surface rounded-2xl p-2 shadow-lg">
            {/* Tool selection */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool("brush")}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl transition-all",
                  "min-h-[44px] min-w-[44px]",
                  activeTool === "brush"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-tool-surface-foreground/60 hover:text-tool-surface-foreground"
                )}
                aria-label="Brush tool"
              >
                <Paintbrush className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTool("eraser")}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl transition-all",
                  "min-h-[44px] min-w-[44px]",
                  activeTool === "eraser"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-tool-surface-foreground/60 hover:text-tool-surface-foreground"
                )}
                aria-label="Eraser tool"
              >
                <Eraser className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-tool-surface-foreground/20 mx-1" />

              {/* Undo / Redo */}
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl transition-all",
                  "min-h-[44px] min-w-[44px]",
                  canUndo
                    ? "text-tool-surface-foreground/80 active:scale-90"
                    : "text-tool-surface-foreground/20"
                )}
                aria-label="Undo"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl transition-all",
                  "min-h-[44px] min-w-[44px]",
                  canRedo
                    ? "text-tool-surface-foreground/80 active:scale-90"
                    : "text-tool-surface-foreground/20"
                )}
                aria-label="Redo"
              >
                <Redo2 className="w-5 h-5" />
              </button>
            </div>

            {/* Brush size */}
            <div className="flex items-center gap-1">
              <button
                onClick={decreaseBrush}
                disabled={brushSizes.indexOf(brushSize) === 0}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
                  "min-h-[44px] min-w-[36px]",
                  brushSizes.indexOf(brushSize) > 0
                    ? "text-tool-surface-foreground/80 active:scale-90"
                    : "text-tool-surface-foreground/20"
                )}
                aria-label="Smaller brush"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div
                className="flex items-center justify-center w-8 h-8"
                aria-label={`Brush size ${brushSize}`}
              >
                <div
                  className="rounded-full bg-tool-surface-foreground"
                  style={{
                    width: `${Math.max(6, brushSize * 0.8)}px`,
                    height: `${Math.max(6, brushSize * 0.8)}px`,
                  }}
                />
              </div>
              <button
                onClick={increaseBrush}
                disabled={brushSizes.indexOf(brushSize) === brushSizes.length - 1}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
                  "min-h-[44px] min-w-[36px]",
                  brushSizes.indexOf(brushSize) < brushSizes.length - 1
                    ? "text-tool-surface-foreground/80 active:scale-90"
                    : "text-tool-surface-foreground/20"
                )}
                aria-label="Bigger brush"
              >
                <Plus className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-tool-surface-foreground/20 mx-1" />

              <button
                onClick={handleReset}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl transition-all",
                  "min-h-[44px] min-w-[44px]",
                  "text-tool-surface-foreground/60 active:scale-90"
                )}
                aria-label="Reset canvas"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Color picker row with active color preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-3 border-foreground shadow-md flex-shrink-0"
              style={{ backgroundColor: activeTool === "eraser" ? "transparent" : selectedColor }}
              aria-label="Current color"
            >
              {activeTool === "eraser" && (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-muted">
                  <Eraser className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <ColorPalette
                selectedColor={selectedColor}
                onColorSelect={(color) => {
                  setSelectedColor(color)
                  setActiveTool("brush")
                }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
