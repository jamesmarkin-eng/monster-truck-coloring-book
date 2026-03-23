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

    // Limit file size to 10MB to avoid API and memory issues
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo is too big! Please use a smaller image (under 10MB).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string)
      setError(null)
    }
    reader.onerror = () => {
      setError('Could not read that photo. Please try another one!')
    }
    reader.readAsDataURL(file)
  }, [])

  const handleConfirm = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/convert-to-coloring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: capturedImage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert image')
      }

      onImageCaptured(data.imageUrl)
    } catch {
      setError('Oops! Could not make a coloring page. Try again!')
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
      <header className="flex items-center justify-between p-4 bg-card shadow-md border-b-4 border-primary/30">
        <button
          onClick={onClose}
          className={cn(
            "flex items-center justify-center",
            "w-12 h-12 rounded-full",
            "bg-secondary text-secondary-foreground",
            "shadow-md active:scale-95 transition-transform",
            "min-h-[48px] min-w-[48px]"
          )}
          aria-label="Close camera"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-bold text-foreground">
          Take a Picture!
        </h1>
        
        <div className="w-12" /> {/* Spacer for centering */}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <p className="text-xl font-bold text-foreground text-center">
              Making your coloring page...
            </p>
            <p className="text-muted-foreground text-center">
              This is so cool!
            </p>
          </div>
        ) : capturedImage ? (
          <>
            {/* Preview */}
            <div className="w-full max-w-sm aspect-square bg-card rounded-3xl shadow-2xl border-4 border-primary/20 overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Captured monster truck" 
                className="w-full h-full object-cover"
              />
            </div>

            {error && (
              <p className="text-destructive font-bold text-center px-4">
                {error}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleRetake}
                className={cn(
                  "flex items-center justify-center gap-2",
                  "px-6 py-4 rounded-2xl",
                  "bg-secondary text-secondary-foreground",
                  "font-bold text-lg shadow-lg",
                  "active:scale-95 transition-transform",
                  "min-h-[56px]"
                )}
              >
                <Camera className="w-6 h-6" />
                Try Again
              </button>
              
              <button
                onClick={handleConfirm}
                className={cn(
                  "flex items-center justify-center gap-2",
                  "px-6 py-4 rounded-2xl",
                  "bg-accent text-accent-foreground",
                  "font-bold text-lg shadow-lg",
                  "active:scale-95 transition-transform",
                  "min-h-[56px]"
                )}
              >
                <Check className="w-6 h-6" />
                Make It!
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
                "bg-card rounded-3xl shadow-2xl border-4 border-dashed border-primary/40",
                "flex flex-col items-center justify-center gap-4",
                "cursor-pointer active:scale-98 transition-transform"
              )}
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground text-center px-4">
                Tap to take a photo of your monster truck!
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Alternative: choose from gallery */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture')
                  fileInputRef.current.click()
                  fileInputRef.current.setAttribute('capture', 'environment')
                }
              }}
              className={cn(
                "flex items-center justify-center gap-2",
                "px-6 py-4 rounded-2xl",
                "bg-secondary text-secondary-foreground",
                "font-bold text-lg shadow-lg",
                "active:scale-95 transition-transform",
                "min-h-[56px]"
              )}
            >
              <ImageIcon className="w-6 h-6" />
              Pick from Photos
            </button>
          </>
        )}
      </main>
    </div>
  )
}
