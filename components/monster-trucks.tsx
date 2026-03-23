"use client"

import { type RefObject } from "react"

// Monster Truck SVG outlines - simple shapes perfect for kids to color
export const monsterTrucks = [
  {
    id: "bigfoot",
    name: "Bigfoot",
    viewBox: "0 0 400 300",
    paths: [
      // Truck body
      { id: "body", d: "M80 120 L80 180 L320 180 L320 100 L240 100 L220 70 L120 70 L100 100 L80 100 Z", defaultFill: "#ffffff" },
      // Cab window
      { id: "window", d: "M125 80 L215 80 L200 105 L110 105 Z", defaultFill: "#e0f4ff" },
      // Front bumper
      { id: "bumper-front", d: "M60 150 L80 140 L80 180 L60 170 Z", defaultFill: "#ffffff" },
      // Rear bumper
      { id: "bumper-rear", d: "M320 140 L340 150 L340 170 L320 180 Z", defaultFill: "#ffffff" },
      // Front wheel
      { id: "wheel-front", d: "M120 180 A50 50 0 1 1 120 181 Z", defaultFill: "#333333" },
      // Front wheel hub
      { id: "hub-front", d: "M120 205 A25 25 0 1 1 120 206 Z", defaultFill: "#888888" },
      // Rear wheel
      { id: "wheel-rear", d: "M280 180 A50 50 0 1 1 280 181 Z", defaultFill: "#333333" },
      // Rear wheel hub
      { id: "hub-rear", d: "M280 205 A25 25 0 1 1 280 206 Z", defaultFill: "#888888" },
      // Headlight
      { id: "headlight", d: "M85 120 L95 120 L95 135 L85 135 Z", defaultFill: "#ffffaa" },
      // Exhaust pipes
      { id: "exhaust", d: "M300 70 L310 70 L310 100 L300 100 Z M315 65 L325 65 L325 100 L315 100 Z", defaultFill: "#666666" },
    ]
  },
  {
    id: "gravedigger",
    name: "Grave Digger",
    viewBox: "0 0 400 300",
    paths: [
      // Main body
      { id: "body", d: "M70 130 L70 175 L330 175 L330 110 L280 110 L260 75 L140 75 L120 110 L70 110 Z", defaultFill: "#ffffff" },
      // Cab window
      { id: "window", d: "M145 85 L255 85 L240 115 L130 115 Z", defaultFill: "#e0f4ff" },
      // Hood scoop
      { id: "scoop", d: "M180 75 L220 75 L210 60 L190 60 Z", defaultFill: "#ffffff" },
      // Front wheel
      { id: "wheel-front", d: "M110 175 A55 55 0 1 1 110 176 Z", defaultFill: "#333333" },
      // Front hub
      { id: "hub-front", d: "M110 200 A30 30 0 1 1 110 201 Z", defaultFill: "#888888" },
      // Rear wheel  
      { id: "wheel-rear", d: "M290 175 A55 55 0 1 1 290 176 Z", defaultFill: "#333333" },
      // Rear hub
      { id: "hub-rear", d: "M290 200 A30 30 0 1 1 290 201 Z", defaultFill: "#888888" },
      // Side detail
      { id: "side-stripe", d: "M130 130 L270 130 L270 145 L130 145 Z", defaultFill: "#ffffff" },
      // Grille
      { id: "grille", d: "M75 120 L85 120 L85 165 L75 165 Z M90 120 L100 120 L100 165 L90 165 Z", defaultFill: "#444444" },
    ]
  },
  {
    id: "megasaurus",
    name: "Mega Rex",
    viewBox: "0 0 400 300",
    paths: [
      // Body
      { id: "body", d: "M60 125 L60 180 L340 180 L340 95 L290 95 L270 60 L130 60 L110 95 L60 95 Z", defaultFill: "#ffffff" },
      // Window
      { id: "window", d: "M135 70 L265 70 L250 100 L120 100 Z", defaultFill: "#e0f4ff" },
      // Spikes on roof
      { id: "spikes", d: "M150 60 L160 40 L170 60 M190 60 L200 35 L210 60 M230 60 L240 40 L250 60", defaultFill: "#ffffff" },
      // Front wheel
      { id: "wheel-front", d: "M105 180 A55 55 0 1 1 105 181 Z", defaultFill: "#333333" },
      // Front hub
      { id: "hub-front", d: "M105 205 A30 30 0 1 1 105 206 Z", defaultFill: "#888888" },
      // Rear wheel
      { id: "wheel-rear", d: "M295 180 A55 55 0 1 1 295 181 Z", defaultFill: "#333333" },
      // Rear hub
      { id: "hub-rear", d: "M295 205 A30 30 0 1 1 295 206 Z", defaultFill: "#888888" },
      // Teeth grille
      { id: "teeth", d: "M65 130 L75 150 L85 130 L95 150 L105 130", defaultFill: "#ffffff" },
      // Eye headlights
      { id: "eyes", d: "M80 105 A10 10 0 1 1 80 106 M100 105 A10 10 0 1 1 100 106", defaultFill: "#ffff00" },
    ]
  },
  {
    id: "thunderstruck",
    name: "Thunder",
    viewBox: "0 0 400 300",
    paths: [
      // Main body - sleek design
      { id: "body", d: "M50 135 L50 175 L350 175 L350 100 L300 100 L280 65 L120 65 L100 100 L50 100 Z", defaultFill: "#ffffff" },
      // Windshield
      { id: "window", d: "M125 75 L275 75 L260 105 L110 105 Z", defaultFill: "#e0f4ff" },
      // Lightning bolt on side
      { id: "bolt", d: "M160 110 L190 110 L175 135 L200 135 L150 170 L170 140 L145 140 Z", defaultFill: "#ffdd00" },
      // Front wheel
      { id: "wheel-front", d: "M100 175 A55 55 0 1 1 100 176 Z", defaultFill: "#333333" },
      // Front hub
      { id: "hub-front", d: "M100 200 A30 30 0 1 1 100 201 Z", defaultFill: "#888888" },
      // Rear wheel
      { id: "wheel-rear", d: "M300 175 A55 55 0 1 1 300 176 Z", defaultFill: "#333333" },
      // Rear hub
      { id: "hub-rear", d: "M300 200 A30 30 0 1 1 300 201 Z", defaultFill: "#888888" },
      // Spoiler
      { id: "spoiler", d: "M310 65 L350 65 L350 75 L320 75 L320 100", defaultFill: "#ffffff" },
    ]
  },
  {
    id: "crushzilla",
    name: "Crushzilla",
    viewBox: "0 0 400 300",
    paths: [
      // Big body
      { id: "body", d: "M55 120 L55 185 L345 185 L345 90 L290 90 L265 50 L135 50 L110 90 L55 90 Z", defaultFill: "#ffffff" },
      // Window
      { id: "window", d: "M140 60 L260 60 L245 95 L125 95 Z", defaultFill: "#e0f4ff" },
      // Claw marks
      { id: "claws", d: "M220 100 L230 150 M235 100 L245 150 M250 100 L260 150", defaultFill: "#ffffff" },
      // Front wheel - extra big
      { id: "wheel-front", d: "M110 185 A60 60 0 1 1 110 186 Z", defaultFill: "#333333" },
      // Front hub
      { id: "hub-front", d: "M110 210 A32 32 0 1 1 110 211 Z", defaultFill: "#888888" },
      // Rear wheel - extra big
      { id: "wheel-rear", d: "M290 185 A60 60 0 1 1 290 186 Z", defaultFill: "#333333" },
      // Rear hub
      { id: "hub-rear", d: "M290 210 A32 32 0 1 1 290 211 Z", defaultFill: "#888888" },
      // Angry eyes
      { id: "eyes", d: "M70 100 L90 95 L90 115 L70 110 Z M95 100 L115 95 L115 115 L95 110 Z", defaultFill: "#ff0000" },
    ]
  },
]

interface MonsterTruckSVGProps {
  truck: typeof monsterTrucks[0]
  colors: Record<string, string>
  onPathClick: (pathId: string) => void
  svgRef?: RefObject<SVGSVGElement | null>
}

export function MonsterTruckSVG({ truck, colors, onPathClick, svgRef }: MonsterTruckSVGProps) {
  return (
    <svg
      ref={svgRef}
      viewBox={truck.viewBox}
      className="w-full h-full"
      style={{ touchAction: "none" }}
    >
      {/* Background - dirt/mud arena */}
      <rect x="0" y="0" width="400" height="300" fill="#f5f0e6" />
      <ellipse cx="200" cy="280" rx="180" ry="30" fill="#d4c4a8" />
      
      {truck.paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          fill={colors[path.id] || path.defaultFill}
          stroke="#222222"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          onClick={() => onPathClick(path.id)}
          onTouchStart={(e) => {
            e.preventDefault()
            onPathClick(path.id)
          }}
          className="cursor-pointer transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{ touchAction: "none" }}
        />
      ))}
    </svg>
  )
}
