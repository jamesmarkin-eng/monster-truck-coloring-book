import { type NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
 
export const maxDuration = 60
 
export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Server is not configured. Missing ANTHROPIC_API_KEY.' },
        { status: 503 },
      )
    }
 
    const { imageData } = await request.json()
 
    if (!imageData) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }
 
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      return NextResponse.json({ error: 'Invalid image data format' }, { status: 400 })
    }
 
    const mediaType = `image/${base64Match[1]}` as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    const base64Data = base64Match[2]
 
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
 
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            {
              type: 'text',
              text: `You are a coloring book artist for young children ages 2-5. Look at this monster truck toy image and create a fun SVG coloring page of it.
 
Create a SINGLE SVG element (viewBox="0 0 540 400") with clean, bold black outlines and white fill.
 
Draw a fun, recognizable monster truck with:
- Big chunky oversized tires (4 huge wheels with tread detail)
- Lifted truck body with bold blocky shape
- Simple cab windows
- Front grille and headlights
- Fun details like flames or stars if visible on the truck
- Dirt/ground beneath the wheels with some action lines
- A fun title at the top: "MY MONSTER TRUCK" in bold child-friendly text
 
Strict rules:
- ALL shapes must have: fill="white" stroke="#111111" stroke-width="3"
- White fills only — no color anywhere — this is a coloring book page
- Bold simple outlines a child can color in
- Make shapes large and easy to color
- Output ONLY the raw SVG code starting with <svg and ending with </svg>
- No markdown, no backticks, no explanation — just the SVG`,
            },
          ],
        },
      ],
    })
 
    const svgText = message.content.find((b) => b.type === 'text')?.text || ''
    const svgMatch = svgText.match(/<svg[\s\S]*<\/svg>/i)
 
    if (!svgMatch) {
      return NextResponse.json({ error: 'Could not generate coloring page. Try again!' }, { status: 500 })
    }
 
    // Convert SVG to a data URL so existing frontend code works unchanged
    const svgBase64 = Buffer.from(svgMatch[0]).toString('base64')
    const imageUrl = `data:image/svg+xml;base64,${svgBase64}`
 
    return NextResponse.json({ imageUrl })
 
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to convert image'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
