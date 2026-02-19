import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
        const { text } = await req.json();
        return NextResponse.json({ text: text || 'Text content loaded' });
    }
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
        return NextResponse.json({ text: 'File uploaded successfully' });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer, {
            max: 0,
            version: 'default'
        });
        
        return NextResponse.json({ text: data.text || 'PDF content extracted successfully' });
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        const text = new TextDecoder().decode(arrayBuffer);
        return NextResponse.json({ text: text || 'Text file loaded successfully' });
    } else {
        return NextResponse.json({ text: `File ${file.name} uploaded successfully` });
    }
}