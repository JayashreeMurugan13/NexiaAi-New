import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { prompt } = await req.json();
    
    try {
        // Using Pollinations AI - free, no API key needed, works reliably
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true&model=flux`;
        
        // Test if image loads
        const testResponse = await fetch(imageUrl, { method: 'HEAD' });
        
        if (testResponse.ok) {
            return NextResponse.json({ imageUrl, prompt });
        }
        
        throw new Error('Image generation failed');
    } catch (error: any) {
        console.error("Image generation error:", error.message);
        
        // Fallback to simpler Pollinations endpoint
        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}`;
        return NextResponse.json({ imageUrl, prompt });
    }
}
