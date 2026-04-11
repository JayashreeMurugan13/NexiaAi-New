import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { type, role, question, answer } = await req.json();

    const messages =
      type === "questions"
        ? [
            {
              role: "system",
              content: `You are a strict JSON API. Output ONLY raw JSON, no markdown, no explanation. Generate exactly 5 interview questions for the role: ${role}. Format: {"questions":[{"question":"...","topic":"..."}]}`,
            },
            { role: "user", content: `5 questions for ${role}` },
          ]
        : [
            {
              role: "system",
              content: `You are a strict JSON API. Output ONLY raw JSON, no markdown, no explanation. Evaluate the interview answer for a ${role} role. Format: {"status":"correct"|"partial"|"wrong","feedback":"...","correctAnswer":"..."}`,
            },
            { role: "user", content: `Question: ${question}\nAnswer: ${answer}` },
          ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
