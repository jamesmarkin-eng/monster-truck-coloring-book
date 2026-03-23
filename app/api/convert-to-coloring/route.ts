import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 503 }
    );
  }

  try {
    // Frontend sends JSON with a base64 image
    const body = await request.json();
    const imageData = body.image as string;

    if (!imageData) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Strip the data URI prefix if present: "data:image/jpeg;base64,..."
    let base64Image: string;
    let mimeType = "image/jpeg";

    if (imageData.startsWith("data:")) {
      const [header, data] = imageData.split(",");
      mimeType = header.split(":")[1].split(";")[0];
      base64Image = data;
    } else {
      base64Image = imageData;
    }

    const prompt = `Can you turn this picture of a toy monster truck into a black and white image that would be a classic coloring book page for my son?`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Image generation failed", details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();

    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      console.error("No image in Gemini response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "No image returned from Gemini" },
        { status: 502 }
      );
    }

    const outputMime = imagePart.inlineData.mimeType || "image/png";
    const imageUrl = `data:${outputMime};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("Unexpected error in generate-coloring-page:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
