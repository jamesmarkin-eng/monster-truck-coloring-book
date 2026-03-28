"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

// Organized color groups for a professional palette
const colorGroups = [
  {
    name: "Reds",
    colors: [
      { name: "Cherry", hex: "#DC2626" },
      { name: "Red", hex: "#EF4444" },
      { name: "Rose", hex: "#F87171" },
      { name: "Coral", hex: "#FB7185" },
    ],
  },
  {
    name: "Oranges",
    colors: [
      { name: "Rust", hex: "#C2410C" },
      { name: "Orange", hex: "#F97316" },
      { name: "Amber", hex: "#F59E0B" },
      { name: "Peach", hex: "#FDBA74" },
    ],
  },
  {
    name: "Yellows",
    colors: [
      { name: "Gold", hex: "#CA8A04" },
      { name: "Yellow", hex: "#EAB308" },
      { name: "Lemon", hex: "#FDE047" },
      { name: "Cream", hex: "#FEF9C3" },
    ],
  },
  {
    name: "Greens",
    colors: [
      { name: "Forest", hex: "#15803D" },
      { name: "Green", hex: "#22C55E" },
      { name: "Lime", hex: "#84CC16" },
      { name: "Mint", hex: "#86EFAC" },
    ],
  },
  {
    name: "Blues",
    colors: [
      { name: "Navy", hex: "#1E40AF" },
      { name: "Blue", hex: "#3B82F6" },
      { name: "Sky", hex: "#38BDF8" },
      { name: "Ice", hex: "#BAE6FD" },
    ],
  },
  {
    name: "Others",
    colors: [
      { name: "Pink", hex: "#EC4899" },
      { name: "Brown", hex: "#92400E" },
      { name: "Gray", hex: "#6B7280" },
      { name: "Black", hex: "#1F2937" },
      { name: "White", hex: "#FFFFFF" },
    ],
  },
]

// Quick palette: the most used colors shown by default
const quickColors = [
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F97316" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#22C55E" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Sky", hex: "#38BDF8" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Brown", hex: "#92400E" },
  { name: "Black", hex: "#1F2937" },
  { name: "White", hex: "#FFFFFF" },
]

interface ColorPaletteProps {
  selectedColor: string
  onColorSelect: (color: string) => void
}

export function ColorPalette({ selectedColor, onColorSelect }: ColorPaletteProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {/* Quick palette row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {quickColors.map((color) => (
          <button
            key={color.hex}
            onClick={() => onColorSelect(color.hex)}
            className={cn(
              "w-10 h-10 rounded-full flex-shrink-0 transition-all duration-150",
              "border-2 active:scale-90",
              "min-h-[44px] min-w-[44px]",
              selectedColor === color.hex
                ? "border-foreground scale-110 shadow-lg ring-2 ring-primary/30"
                : "border-card shadow-sm"
            )}
            style={{ backgroundColor: color.hex }}
            aria-label={`Select ${color.name} color`}
          />
        ))}
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
            "bg-muted text-muted-foreground border-2 border-border",
            "min-h-[44px] min-w-[44px]",
            "transition-all active:scale-90"
          )}
          aria-label={expanded ? "Show fewer colors" : "Show more colors"}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded palette */}
      {expanded && (
        <div className="flex flex-col gap-3 bg-card rounded-2xl p-3 border border-border shadow-inner animate-in slide-in-from-bottom-2 duration-200">
          {colorGroups.map((group) => (
            <div key={group.name}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                {group.name}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {group.colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => onColorSelect(color.hex)}
                    className={cn(
                      "w-9 h-9 rounded-lg transition-all duration-150",
                      "border active:scale-90",
                      "min-h-[44px] min-w-[44px]",
                      selectedColor === color.hex
                        ? "border-foreground scale-105 shadow-md ring-2 ring-primary/30"
                        : "border-border/50 shadow-sm"
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
