import { NextRequest, NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

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
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(' ');
            text += pageText + '\n';
        }
        
        return NextResponse.json({ text: text.trim() });
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({ error: 'Failed to parse content' }, { status: 500 });
    }
}
