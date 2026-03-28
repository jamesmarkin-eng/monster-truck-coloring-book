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
  Maximize,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomColoringPageProps {
  imageUrl: string
  pageName?: string
  onBack: () => void
}

type Tool = "brush" | "eraser"
type GestureMode = "none" | "draw" | "pan-zoom"

const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.5

export function CustomColoringPage({ imageUrl, pageName = "My Truck", onBack }: CustomColoringPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedColor, setSelectedColor] = useState("#EF4444")
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(12)
  const [activeTool, setActiveTool] = useState<Tool>("brush")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const canvasSizeRef = useRef({ width: 0, height: 0 })

  // Zoom & pan state
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const gestureModeRef = useRef<GestureMode>("none")
  const lastPinchDistRef = useRef(0)
  const lastPinchCenterRef = useRef({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })
  const panOffsetRef = useRef({ x: 0, y: 0 })
  const zoomRef = useRef(1)
  const drawTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Undo/Redo history
  const historyRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const brushSizes = [4, 8, 12, 20, 32]

  // Keep zoom ref in sync
  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const clampPan = useCallback((px: number, py: number, z: number) => {
    const container = containerRef.current
    if (!container) return { x: px, y: py }
    const { width, height } = canvasSizeRef.current
    const containerRect = container.getBoundingClientRect()
    const scaledW = width * z
    const scaledH = height * z
    const maxPanX = Math.max(0, (scaledW - containerRect.width) / 2)
    const maxPanY = Math.max(0, (scaledH - containerRect.height) / 2)
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, px)),
      y: Math.max(-maxPanY, Math.min(maxPanY, py)),
    }
  }, [])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(imageData)

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

  // Convert screen coords to canvas coords accounting for zoom + pan
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const rect = canvas.getBoundingClientRect()
      const { width, height } = canvasSizeRef.current
      const scaleX = width / rect.width
      const scaleY = height / rect.height

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    },
    []
  )

  const draw = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      // Scale brush size inversely with zoom so it feels consistent
      const scaledBrush = brushSize / zoomRef.current

      if (activeTool === "eraser") {
        const img = imageRef.current
        if (!img) return
        const { width, height } = canvasSizeRef.current
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, scaledBrush, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, 0, 0, width, height)
        ctx.restore()
      } else {
        ctx.globalCompositeOperation = "multiply"
        ctx.fillStyle = selectedColor
        ctx.beginPath()
        ctx.arc(x, y, scaledBrush, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = "source-over"
      }
    },
    [selectedColor, brushSize, activeTool]
  )

  // --- Touch gesture handlers ---
  const getTouchDistance = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (t1: Touch, t2: Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  })

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (e.touches.length >= 2) {
        // Multi-touch: switch to pan-zoom, cancel any pending draw
        gestureModeRef.current = "pan-zoom"
        setIsDrawing(false)
        if (drawTimerRef.current) {
          clearTimeout(drawTimerRef.current)
          drawTimerRef.current = null
        }

        const t1 = e.touches[0]
        const t2 = e.touches[1]
        lastPinchDistRef.current = getTouchDistance(t1, t2)
        lastPinchCenterRef.current = getTouchCenter(t1, t2)
        panStartRef.current = { x: panX, y: panY }
        panOffsetRef.current = { x: 0, y: 0 }
        return
      }

      // Single touch: start drawing after a tiny delay
      // to allow a second finger to arrive for pinch
      gestureModeRef.current = "draw"
      const touch = e.touches[0]
      const cx = touch.clientX
      const cy = touch.clientY

      drawTimerRef.current = setTimeout(() => {
        if (gestureModeRef.current !== "draw") return
        const coords = getCanvasCoordinates(cx, cy)
        if (coords) {
          setIsDrawing(true)
          draw(coords.x, coords.y)
        }
      }, 60)
    },
    [panX, panY, getCanvasCoordinates, draw]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (e.touches.length >= 2 && gestureModeRef.current === "pan-zoom") {
        const t1 = e.touches[0]
        const t2 = e.touches[1]

        // Pinch zoom
        const newDist = getTouchDistance(t1, t2)
        const scale = newDist / lastPinchDistRef.current
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current * scale))
        lastPinchDistRef.current = newDist

        // Pan
        const center = getTouchCenter(t1, t2)
        const dx = center.x - lastPinchCenterRef.current.x
        const dy = center.y - lastPinchCenterRef.current.y
        lastPinchCenterRef.current = center

        const newPanX = panX + dx
        const newPanY = panY + dy
        const clamped = clampPan(newPanX, newPanY, newZoom)

        setZoom(newZoom)
        zoomRef.current = newZoom
        setPanX(clamped.x)
        setPanY(clamped.y)
        return
      }

      // Single finger drawing
      if (gestureModeRef.current === "draw") {
        // If timer hasn't fired yet, start drawing now
        if (drawTimerRef.current) {
          clearTimeout(drawTimerRef.current)
          drawTimerRef.current = null
          setIsDrawing(true)
        }

        const touch = e.touches[0]
        const coords = getCanvasCoordinates(touch.clientX, touch.clientY)
        if (coords) {
          draw(coords.x, coords.y)
        }
      }
    },
    [panX, panY, getCanvasCoordinates, draw, clampPan]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 0) {
        if (drawTimerRef.current) {
          clearTimeout(drawTimerRef.current)
          drawTimerRef.current = null
        }

        if (gestureModeRef.current === "draw" && isDrawing) {
          setIsDrawing(false)
          saveToHistory()
        }

        // After pinch-zoom, clamp the pan
        if (gestureModeRef.current === "pan-zoom") {
          const clamped = clampPan(panX, panY, zoom)
          setPanX(clamped.x)
          setPanY(clamped.y)
        }

        gestureModeRef.current = "none"
      } else if (e.touches.length === 1 && gestureModeRef.current === "pan-zoom") {
        // One finger lifted from pinch, keep panning with remaining finger
        const t = e.touches[0]
        lastPinchCenterRef.current = { x: t.clientX, y: t.clientY }
      }
    },
    [isDrawing, saveToHistory, panX, panY, zoom, clampPan]
  )

  // --- Mouse handlers (for desktop) ---
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      gestureModeRef.current = "draw"
      setIsDrawing(true)
      const coords = getCanvasCoordinates(e.clientX, e.clientY)
      if (coords) {
        draw(coords.x, coords.y)
      }
    },
    [getCanvasCoordinates, draw]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || gestureModeRef.current !== "draw") return
      e.preventDefault()
      const coords = getCanvasCoordinates(e.clientX, e.clientY)
      if (coords) {
        draw(coords.x, coords.y)
      }
    },
    [isDrawing, getCanvasCoordinates, draw]
  )

  const handleMouseEnd = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
    }
    gestureModeRef.current = "none"
  }, [isDrawing, saveToHistory])

  // Desktop scroll-to-zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.2 : 0.2
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta))
      const clamped = clampPan(panX, panY, newZoom)
      setZoom(newZoom)
      zoomRef.current = newZoom
      setPanX(clamped.x)
      setPanY(clamped.y)
    },
    [zoom, panX, panY, clampPan]
  )

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP)
    const clamped = clampPan(panX, panY, newZoom)
    setZoom(newZoom)
    zoomRef.current = newZoom
    setPanX(clamped.x)
    setPanY(clamped.y)
  }, [zoom, panX, panY, clampPan])

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP)
    const clamped = clampPan(panX, panY, newZoom)
    setZoom(newZoom)
    zoomRef.current = newZoom
    setPanX(clamped.x)
    setPanY(clamped.y)
  }, [zoom, panX, panY, clampPan])

  const handleFitToScreen = useCallback(() => {
    setZoom(1)
    zoomRef.current = 1
    setPanX(0)
    setPanY(0)
  }, [])

  const handleReset = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const img = imageRef.current
    if (!ctx || !img || !canvas) return

    const { width, height } = canvasSizeRef.current
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    saveToHistory()
    handleFitToScreen()
  }, [saveToHistory, handleFitToScreen])

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

  const isZoomed = zoom > 1.05

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

        {/* Zoom indicator pill - shows when zoomed */}
        {isZoomed && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-tool-surface/90 text-tool-surface-foreground rounded-full text-xs font-bold backdrop-blur-sm">
            <ZoomIn className="w-3 h-3" />
            {Math.round(zoom * 100)}%
          </div>
        )}

        {/* Zoom controls - floating on the right */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-xl",
              "bg-card shadow-lg border border-border",
              "transition-all duration-200 active:scale-90",
              "min-h-[44px] min-w-[44px]",
              zoom >= MAX_ZOOM ? "opacity-30" : "text-foreground"
            )}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-xl",
              "bg-card shadow-lg border border-border",
              "transition-all duration-200 active:scale-90",
              "min-h-[44px] min-w-[44px]",
              zoom <= MIN_ZOOM ? "opacity-30" : "text-foreground"
            )}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          {isZoomed && (
            <button
              onClick={handleFitToScreen}
              className={cn(
                "flex items-center justify-center",
                "w-10 h-10 rounded-xl",
                "bg-primary text-primary-foreground shadow-lg",
                "transition-all duration-200 active:scale-90",
                "min-h-[44px] min-w-[44px]"
              )}
              aria-label="Fit to screen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Canvas container with zoom & pan transform */}
        <div
          ref={containerRef}
          className="w-full max-w-2xl bg-card rounded-2xl shadow-lg overflow-hidden border border-border"
        >
          {!imageLoaded && (
            <div className="aspect-[3/4] flex items-center justify-center">
              <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: gestureModeRef.current === "pan-zoom" ? "none" : "transform 0.2s ease-out",
            }}
          >
            <canvas
              ref={canvasRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseEnd}
              onMouseLeave={handleMouseEnd}
              onWheel={handleWheel}
              className={cn(
                "w-full h-auto touch-none",
                !imageLoaded && "hidden",
                activeTool === "eraser" && "cursor-cell"
              )}
              style={{ touchAction: "none" }}
            />
          </div>
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
