import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ text: '', success: false });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(buffer);
            
            return NextResponse.json({ 
                text: data.text || '',
                success: true
            });
        } 
        else if (file.type === 'text/plain') {
            const text = new TextDecoder().decode(arrayBuffer);
            return NextResponse.json({ 
                text: text,
                success: true
            });
        }
        
        return NextResponse.json({ text: '', success: false });
        
    } catch (error) {
        return NextResponse.json({ text: '', success: false });
    }
}