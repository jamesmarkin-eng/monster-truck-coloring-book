"use client"

import { cn } from "@/lib/utils"
import { monsterTrucks } from "./monster-trucks"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TruckSelectorProps {
  currentTruckIndex: number
  onSelectTruck: (index: number) => void
}

export function TruckSelector({ currentTruckIndex, onSelectTruck }: TruckSelectorProps) {
  const goToPrevious = () => {
    const newIndex = currentTruckIndex === 0 ? monsterTrucks.length - 1 : currentTruckIndex - 1
    onSelectTruck(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentTruckIndex === monsterTrucks.length - 1 ? 0 : currentTruckIndex + 1
    onSelectTruck(newIndex)
  }

  return (
    <div className="flex items-center justify-center gap-3 px-4">
      {/* Previous button */}
      <button
        onClick={goToPrevious}
        className={cn(
          "flex items-center justify-center",
          "w-14 h-14 md:w-16 md:h-16 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200 active:scale-90",
          "min-h-[48px] min-w-[48px]"
        )}
        aria-label="Previous truck"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Truck name display */}
      <div className="flex-1 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-sm">
          {monsterTrucks[currentTruckIndex].name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {currentTruckIndex + 1} / {monsterTrucks.length}
        </p>
      </div>

      {/* Next button */}
      <button
        onClick={goToNext}
        className={cn(
          "flex items-center justify-center",
          "w-14 h-14 md:w-16 md:h-16 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200 active:scale-90",
          "min-h-[48px] min-w-[48px]"
        )}
        aria-label="Next truck"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  )
}
