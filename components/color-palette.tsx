"use client"

import { cn } from "@/lib/utils"

// Kid-friendly color palette with big, easy-to-tap swatches
export const colorPalette = [
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F97316" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#22C55E" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Black", hex: "#1F2937" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Brown", hex: "#92400E" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Sky", hex: "#7DD3FC" },
]

interface ColorPaletteProps {
  selectedColor: string
  onColorSelect: (color: string) => void
}

export function ColorPalette({ selectedColor, onColorSelect }: ColorPaletteProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-3 bg-card rounded-2xl shadow-lg border-4 border-primary/20">
      {colorPalette.map((color) => (
        <button
          key={color.hex}
          onClick={() => onColorSelect(color.hex)}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-xl border-4 transition-all duration-200 active:scale-95",
            "shadow-md hover:shadow-lg hover:scale-105",
            "min-h-[48px] min-w-[48px]", // Ensure 44px+ touch target
            selectedColor === color.hex 
              ? "border-foreground ring-4 ring-primary scale-110" 
              : "border-white/50"
          )}
          style={{ backgroundColor: color.hex }}
          aria-label={`Select ${color.name} color`}
        >
          {selectedColor === color.hex && (
            <span className="sr-only">Selected</span>
          )}
        </button>
      ))}
    </div>
  )
}
