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
            try {
                const pdfParse = (await import('pdf-parse')).default;
                
                // Enhanced PDF parsing options for mobile compatibility
                const options = {
                    max: 0, // Parse all pages
                    version: 'default',
                    normalizeWhitespace: true,
                    disableCombineTextItems: false
                };
                
                const data = await pdfParse(buffer, options);
                let text = data.text || '';
                
                // Clean and normalize text
                text = text
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
                
                console.log(`PDF processed: ${data.numpages} pages, ${text.length} chars`);
                
                return NextResponse.json({ 
                    text: text,
                    success: true,
                    pages: data.numpages
                });
            } catch (pdfError) {
                console.error('PDF parsing failed:', pdfError);
                return NextResponse.json({ text: '', success: false });
            }
        } 
        else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            const text = new TextDecoder('utf-8').decode(arrayBuffer).trim();
            return NextResponse.json({ 
                text: text,
                success: true
            });
        }
        
        return NextResponse.json({ text: '', success: false });
        
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ text: '', success: false });
    }
}