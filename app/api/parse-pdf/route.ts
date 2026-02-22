import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ 
                text: 'No file provided',
                success: false
            }, { status: 400 });
        }

        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            const pdfParse = (await import('pdf-parse')).default;
            
            const data = await pdfParse(buffer);
            const text = data.text?.trim() || '';
            
            console.log('PDF parsed - Pages:', data.numpages, 'Text length:', text.length);
            
            return NextResponse.json({ 
                text: text,
                success: true,
                pages: data.numpages
            });
        } 
        else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            const text = new TextDecoder('utf-8').decode(arrayBuffer).trim();
            
            return NextResponse.json({ 
                text: text,
                success: true
            });
        } 
        else {
            return NextResponse.json({ 
                text: `File ${file.name} uploaded`,
                success: false,
                message: 'Unsupported file type'
            });
        }
        
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({ 
            text: 'Processing failed',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}