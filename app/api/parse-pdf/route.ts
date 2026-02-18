import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type');
        
        // Handle JSON input (text)
        if (contentType?.includes('application/json')) {
            const { text } = await req.json();
            if (!text) {
                return NextResponse.json({ error: 'No text provided' }, { status: 400 });
            }
            return NextResponse.json({ text });
        }
        
        // Handle file upload
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        
        if (file.type === 'application/pdf') {
            // Use pdf-parse which works reliably on Vercel
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(Buffer.from(arrayBuffer));
            return NextResponse.json({ text: data.text.trim() });
        } else if (file.type === 'text/plain') {
            const text = new TextDecoder().decode(arrayBuffer);
            return NextResponse.json({ text: text.trim() });
        } else {
            return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or TXT files.' }, { status: 400 });
        }
        
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({ error: 'Failed to parse PDF content. Please ensure the file is not corrupted.' }, { status: 500 });
    }
}