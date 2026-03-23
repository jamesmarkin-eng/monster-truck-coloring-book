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
              text: `You are a coloring book artist for young children ages 2-5. I'm showing you a photo of a specific monster truck toy. Your job is to faithfully recreate THIS specific truck as a coloring page — not a generic monster truck.
 
Study the image carefully:
- What is the exact body shape and proportions?
- What logo, graphics, or text is on it?
- What color patterns exist (recreate as outline regions to color in)?
- What makes this truck unique and recognizable?
 
Create a SINGLE SVG element (viewBox="0 0 540 400") that a child who owns this exact truck would immediately recognize.
 
Draw the specific truck with:
- Its actual body shape and proportions
- Its real name/logo if visible (add as bold outlined text on the truck body)
- Its graphic designs as outline regions (flames, skulls, patterns — whatever is on it)
- Big chunky oversized tires with tread detail
- Ground beneath the wheels with action lines
- The truck's actual name at the top in bold child-friendly text, or "MY MONSTER TRUCK" if name isn't visible
 
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
