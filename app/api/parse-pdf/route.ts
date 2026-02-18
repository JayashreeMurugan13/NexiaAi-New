import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
            const { text } = await req.json();
            if (!text) {
                return NextResponse.json({ error: 'No text provided' }, { status: 400 });
            }
            return NextResponse.json({ text });
        }
        
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(buffer, {
                max: 0,
                version: 'default'
            });
            
            if (!data.text || data.text.trim().length === 0) {
                return NextResponse.json({ error: 'PDF contains no text' }, { status: 400 });
            }
            
            return NextResponse.json({ text: data.text.trim() });
        } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            const text = new TextDecoder().decode(arrayBuffer);
            return NextResponse.json({ text: text.trim() });
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }
        
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({ 
            error: 'Failed to parse PDF',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}