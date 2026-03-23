import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const body = await request.json();
    const imageData = body.imageData as string;

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

    const prompt =
      "Convert this photo of a toy monster truck into a clean black and white coloring book page for young children (ages 2-5). Use bold, simple outlines. Remove all color and background clutter. The result should look like a page from a kids coloring book — just clean black lines on a white background, ready to print and color in.";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Image } },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 502 }
      );
    }

    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        const outputMime = part.inlineData.mimeType || "image/png";
        const imageUrl = `data:${outputMime};base64,${part.inlineData.data}`;
        return NextResponse.json({ imageUrl });
      }
    }

    return NextResponse.json(
      { error: "No image returned from Gemini" },
      { status: 502 }
    );
  } catch (err) {
    console.error("Unexpected error in convert-to-coloring:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
