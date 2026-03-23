import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Modality } from "@google/genai"
export async function POST(req: NextRequest) {
  try {
    const { imageData } = await req.json()
    if (!imageData) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }
    // Strip the data URL prefix to get raw base64
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "")
    const mimeTypeMatch = imageData.match(/^data:(image\/\w+);base64,/)
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg"
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Convert this photo of a toy monster truck into a clean black and white coloring book page for young children ages 2 to 5. Use bold simple outlines. Remove all color and background clutter. The result should look like a page from a kids coloring book — just clean black lines on a white background, ready to print and color in."
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT]
      }
    })
    // Extract the image from the response
    const parts = response.candidates?.[0]?.content?.parts ?? []
    for (const part of parts) {
      if (part.inlineData) {
        const { mimeType: outMime, data } = part.inlineData
        return NextResponse.json({
          imageUrl: `data:${outMime};base64,${data}`
        })
      }
    }
    console.error("No image in Gemini response:", JSON.stringify(response))
    return NextResponse.json({ error: "No image returned from Gemini" }, { status: 500 })
  } catch (error) {
    console.error("Unexpected error in convert-to-coloring:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
