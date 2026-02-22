import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ 
                text: 'No file provided',
                success: false
            });
        }

        console.log('Processing:', file.name, file.size, 'bytes');
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            try {
                const pdfParse = (await import('pdf-parse')).default;
                const data = await pdfParse(buffer);
                
                console.log('PDF parsed:', data.numpages, 'pages, text length:', data.text?.length || 0);
                
                return NextResponse.json({ 
                    text: data.text || '',
                    success: true,
                    pages: data.numpages
                });
            } catch (pdfError) {
                console.error('PDF error:', pdfError);
                return NextResponse.json({ 
                    text: '',
                    success: false,
                    error: 'PDF parsing failed'
                });
            }
        } 
        else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            const text = new TextDecoder('utf-8').decode(arrayBuffer);
            return NextResponse.json({ 
                text: text.trim(),
                success: true
            });
        } 
        else {
            return NextResponse.json({ 
                text: '',
                success: false,
                error: 'Unsupported file type'
            });
        }
        
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ 
            text: '',
            success: false,
            error: 'Server error'
        });
    }
}