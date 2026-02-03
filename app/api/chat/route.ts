import { NextResponse } from "next/server";

/* -------------------- Types -------------------- */

type ChatRole = "system" | "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  messages: ChatMessage[];
  enhance?: boolean;
};

type GroqResponse = {
  choices: {
    message: ChatMessage;
  }[];
};

/* -------------------- API Route -------------------- */

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    // Runtime validation
    if (
      typeof body !== "object" ||
      body === null ||
      !("messages" in body)
    ) {
      return NextResponse.json(
        { role: "assistant", content: "Invalid request format" },
        { status: 400 }
      );
    }

    const parsedBody = body as ChatRequestBody;

    if (!Array.isArray(parsedBody.messages)) {
      return NextResponse.json(
        { role: "assistant", content: "Messages must be an array" },
        { status: 400 }
      );
    }

    // ✅ FORCE TYPES
    const messages: ChatMessage[] = parsedBody.messages;
    const enhance: boolean = Boolean(parsedBody.enhance);

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        role: "assistant",
        content: "API key missing",
      });
    }

    const systemPrompt: string = enhance
      ? "You are an expert prompt engineer. Transform the user's simple idea into a detailed, creative, and effective prompt for AI image/video generation. Make it vivid, specific, and optimized for the best results. Include style, lighting, composition, and technical details. Output ONLY the enhanced prompt, nothing else."
      : "You are Nexia, a friendly AI companion. Be warm, helpful, and conversational. Use emojis naturally. Keep responses concise but engaging.";

    // ✅ FIXED LINE — EXPLICIT TYPE (this stops Vercel error)
    const cleanMessages: ChatMessage[] = messages.map(
      (msg: ChatMessage): ChatMessage => ({
        role: msg.role,
        content: msg.content,
      })
    );

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            ...cleanMessages,
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: GroqResponse = await response.json();

    return NextResponse.json(data.choices[0].message);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("API Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    return NextResponse.json({
      role: "assistant",
      content: "I'm having trouble connecting right now. Please try again!",
    });
  }
}
