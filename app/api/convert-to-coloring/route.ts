import { NextRequest, NextResponse } from "next/server"
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Convert this photo of a toy monster truck into a clean black and white coloring book page for young children ages 2 to 5. Use bold simple outlines. Remove all color and background clutter. The result should look like a page from a kids coloring book — just clean black lines on a white background, ready to print and color in."
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"]
          }
        })
      }
    )
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", errorText)
      return NextResponse.json({ error: "Gemini API error" }, { status: 500 })
    }
    const result = await response.json()
    // Extract the image from the response
    const parts = result.candidates?.[0]?.content?.parts ?? []
    for (const part of parts) {
      if (part.inline_data) {
        const { mime_type, data } = part.inline_data
        return NextResponse.json({
          imageUrl: `data:${mime_type};base64,${data}`
        })
      }
    }
    console.error("No image in Gemini response:", JSON.stringify(result))
    return NextResponse.json({ error: "No image returned from Gemini" }, { status: 500 })
  } catch (error) {
    console.error("Unexpected error in convert-to-coloring:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
