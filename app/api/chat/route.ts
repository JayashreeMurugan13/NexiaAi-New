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
        {
          role: "assistant",
          content: "Invalid request format",
        },
        { status: 400 }
      );
    }

    const { messages, enhance } = body as ChatRequestBody;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        {
          role: "assistant",
          content: "Messages must be an array",
        },
        { status: 400 }
      );
    }

    console.log("=== API DEBUG ===");
    console.log("API Key exists:", !!process.env.GROQ_API_KEY);
    console.log(
      "API Key first 10 chars:",
      process.env.GROQ_API_KEY?.substring(0, 10)
    );
    console.log("Messages:", messages);

    if (!process.env.GROQ_API_KEY) {
      console.log("ERROR: No API key");
      return NextResponse.json({
        role: "assistant",
        content: "API key missing",
      });
    }

    const systemPrompt: string = enhance
      ? "You are an expert prompt engineer. Transform the user's simple idea into a detailed, creative, and effective prompt for AI image/video generation. Make it vivid, specific, and optimized for the best results. Include style, lighting, composition, and technical details. Output ONLY the enhanced prompt, nothing else."
      : "You are Nexia, a friendly AI companion. Be warm, helpful, and conversational. Use emojis naturally. Keep responses concise but engaging.";

    console.log("Making API call to Groq...");

    // Clean messages (STRICT SAFE)
    const cleanMessages: ChatMessage[] = messages.map(
      (msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })
    );

    console.log("Enhance mode:", enhance);
    console.log("System prompt:", systemPrompt.substring(0, 50) + "...");

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

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: GroqResponse = await response.json();

    console.log(
      "Success! Response:",
      data.choices[0].message.content.substring(0, 50)
    );

    return NextResponse.json(data.choices[0].message);
  } catch (error: unknown) {
    console.log("=== ERROR CAUGHT ===");

    if (error instanceof Error) {
      console.error("Full error:", error);
      console.log("Error message:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    console.log("==================");

    return NextResponse.json({
      role: "assistant",
      content: "I'm having trouble connecting right now. Please try again!",
    });
  }
}
