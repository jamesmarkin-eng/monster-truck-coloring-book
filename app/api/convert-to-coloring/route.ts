// app/api/generate-coloring-page/route.ts
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
    // Parse incoming FormData — frontend sends the photo as "image"
    const formData = await request.formData();
    const imageField = formData.get("image");

    if (!imageField) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Normalize to base64 string + mimeType regardless of how it arrived
    let base64Image: string;
    let mimeType: string;

    if (imageField instanceof File) {
      const arrayBuffer = await imageField.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString("base64");
      mimeType = imageField.type || "image/jpeg";
    } else {
      // String — could be a raw base64 or a data URI like "data:image/jpeg;base64,..."
      const str = imageField as string;
      if (str.startsWith("data:")) {
        const [header, data] = str.split(",");
        mimeType = header.split(":")[1].split(";")[0];
        base64Image = data;
      } else {
        base64Image = str;
        mimeType = "image/jpeg";
      }
    }

    // Enforce a reasonable size limit (~10MB decoded)
    if (base64Image.length > 13_500_000) {
      return NextResponse.json({ error: "Image too large" }, { status: 400 });
    }

    const prompt = `Transform this monster truck toy photo into a high-quality children's coloring book page.

Requirements:
- Black outlines only on a pure white background — no gray fills, no color, no shading
- Preserve the unique details of THIS specific truck: body shape, wheel guards, tire tread, bumpers, cab design, any logos or decorations
- Bold, clean lines suitable for a child to color with crayons (minimum 3px stroke weight)
- Keep the perspective and composition of the original photo
- The result should look like a professional coloring book illustration
- Do not add backgrounds, grass, dirt, or other scenery — just the truck on white`;

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

    // Find the image part in the response
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
