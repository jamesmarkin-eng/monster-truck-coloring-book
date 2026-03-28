"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, X, Check, Loader2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void
  onClose: () => void
}

export function CameraCapture({ onImageCaptured, onClose }: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError("Photo is too big! Please use a smaller image (under 10MB).")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string)
      setError(null)
    }
    reader.onerror = () => {
      setError("Could not read that photo. Please try another one!")
    }
    reader.readAsDataURL(file)
  }, [])

  const handleConfirm = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/convert-to-coloring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: capturedImage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert image")
      }

      onImageCaptured(data.imageUrl)
    } catch {
      setError("Oops! Could not make a coloring page. Try again!")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setError(null)
  }

  const openCamera = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onClose}
          className={cn(
            "flex items-center justify-center",
            "w-10 h-10 rounded-full",
            "bg-muted text-foreground",
            "transition-all active:scale-90",
            "min-h-[44px] min-w-[44px]"
          )}
          aria-label="Close camera"
        >
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Scan Your Toy</h1>
        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">Creating your coloring page...</p>
              <p className="text-sm text-muted-foreground mt-2">AI is working its magic</p>
            </div>
          </div>
        ) : capturedImage ? (
          <>
            {/* Preview */}
            <div className="w-full max-w-sm aspect-square bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured monster truck"
                className="w-full h-full object-cover"
              />
            </div>

            {error && (
              <p className="text-destructive font-semibold text-center text-sm px-4">{error}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 w-full max-w-sm">
              <button
                onClick={handleRetake}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "px-5 py-4 rounded-2xl",
                  "bg-muted text-foreground",
                  "font-bold shadow-sm",
                  "active:scale-95 transition-all",
                  "min-h-[56px]"
                )}
              >
                <Camera className="w-5 h-5" />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "px-5 py-4 rounded-2xl",
                  "bg-primary text-primary-foreground",
                  "font-bold shadow-lg",
                  "active:scale-95 transition-all",
                  "min-h-[56px]"
                )}
              >
                <Check className="w-5 h-5" />
                Convert
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Camera prompt */}
            <div
              onClick={openCamera}
              className={cn(
                "w-full max-w-sm aspect-square",
                "bg-card rounded-2xl shadow-lg border-2 border-dashed border-border",
                "flex flex-col items-center justify-center gap-4",
                "cursor-pointer active:scale-[0.98] transition-transform"
              )}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center px-8">
                <p className="text-lg font-bold text-foreground">Take a photo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Point your camera at a monster truck toy
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute("capture")
                  fileInputRef.current.click()
                  fileInputRef.current.setAttribute("capture", "environment")
                }
              }}
              className={cn(
                "flex items-center justify-center gap-2",
                "px-6 py-4 rounded-2xl",
                "bg-muted text-foreground",
                "font-bold shadow-sm",
                "active:scale-95 transition-all",
                "min-h-[56px]"
              )}
            >
              <ImageIcon className="w-5 h-5" />
              Choose from Photos
            </button>
          </>
        )}
      </main>
    </div>
  )
}
