import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        
        if (!messages || messages.length === 0) {
            return NextResponse.json({ title: "New Chat" });
        }

        const firstMessages = messages.slice(0, 3);
        const conversationContext = firstMessages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a short, descriptive title (max 4 words) for this conversation. Be concise and capture the main topic.'
                    },
                    {
                        role: 'user',
                        content: conversationContext
                    }
                ],
                temperature: 0.7,
                max_tokens: 20
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate title');
        }

        const data = await response.json();
        const title = data.choices[0].message.content.trim().replace(/['"]/g, '');
        
        return NextResponse.json({ title: title || "New Chat" });
    } catch (error) {
        console.error('Title generation error:', error);
        return NextResponse.json({ title: "New Chat" });
    }
}