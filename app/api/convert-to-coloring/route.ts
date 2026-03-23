import { type NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Server is not configured. Missing GOOGLE_GENERATIVE_AI_API_KEY.' },
        { status: 503 },
      )
    }

    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    // Extract base64 data from data URL
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      return NextResponse.json({ error: 'Invalid image data format' }, { status: 400 })
    }
    
    const mimeType = `image/${base64Match[1]}` as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    const base64Data = base64Match[2]
    
    // Use Google's Gemini model which can generate images
    const result = await generateText({
      model: 'google/gemini-3.1-flash-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: base64Data,
              mimeType,
            },
            {
              type: 'text',
              text: `Turn this picture of a toy monster truck into a classic black and white coloring book page for my 5 year old son. 
              
Requirements:
- Simple, clean black outlines on pure white background
- Thick lines that are easy to color inside
- No shading, no gray areas - just black lines on white
- Kid-friendly style like a real coloring book
- Include some fun details like big wheels and cool truck features
- Make it look exciting and fun to color!

Generate the coloring book page image.`,
            },
          ],
        },
      ],
    })

    // Gemini image generation returns files array with generated images
    if (result.files && result.files.length > 0) {
      for (const file of result.files) {
        if (file.mediaType?.startsWith('image/')) {
          if (file.base64) {
            const imageUrl = `data:${file.mediaType};base64,${file.base64}`
            return NextResponse.json({ imageUrl })
          }
          const fileWithUrl = file as { url?: string; mediaType: string }
          if (fileWithUrl.url) {
            return NextResponse.json({ imageUrl: fileWithUrl.url })
          }
        }
      }
    }

    // Some models embed image URLs in the text response
    if (result.text) {
      const urlMatch = result.text.match(/https:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i)
      if (urlMatch) {
        return NextResponse.json({ imageUrl: urlMatch[0] })
      }
    }

    throw new Error('No coloring page image was generated. Try again!')
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to convert image'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
