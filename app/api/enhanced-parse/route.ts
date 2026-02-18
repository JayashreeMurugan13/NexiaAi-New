import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let text = '';
        let fileName = '';
        let fileType = '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            text = body.text || '';
            fileName = 'direct-input';
            fileType = 'text';
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            
            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 });
            }

            fileName = file.name;
            fileType = file.type;
            const buffer = await file.arrayBuffer();

            if (file.type === 'application/pdf') {
                try {
                    text = await extractPDFText(buffer);
                } catch (error) {
                    return NextResponse.json({ 
                        error: 'PDF parsing not available in this environment. Please use text files.' 
                    }, { status: 400 });
                }
            } else if (file.type === 'text/plain' || file.type.includes('text/')) {
                text = new TextDecoder().decode(buffer);
            } else {
                return NextResponse.json({ 
                    error: 'Unsupported file type. Please upload PDF or TXT files.' 
                }, { status: 400 });
            }
        }

        if (!text.trim()) {
            return NextResponse.json({ 
                error: 'No text content found in the file' 
            }, { status: 400 });
        }

        const processedText = enhanceTextExtraction(text);
        const metadata = extractMetadata(processedText, fileName, fileType);

        return NextResponse.json({ 
            text: processedText,
            metadata,
            success: true 
        });

    } catch (error) {
        console.error('Parse error:', error);
        return NextResponse.json({ 
            error: 'Failed to parse file. Please ensure the file is not corrupted.' 
        }, { status: 500 });
    }
}

async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
    // Dynamic import for server-side compatibility
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }
    
    return fullText;
}

function enhanceTextExtraction(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s@.-]/g, ' ')
        .trim();
}

function extractMetadata(text: string, fileName: string, fileType: string) {
    const wordCount = text.split(/\s+/).length;
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
    const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text);
    
    const sections = {
        hasExperience: /\b(experience|work|employment|job)\b/i.test(text),
        hasEducation: /\b(education|degree|university|college)\b/i.test(text),
        hasSkills: /\b(skills|technologies|programming)\b/i.test(text),
        hasCertifications: /\b(certification|certified|license)\b/i.test(text)
    };
    
    return {
        fileName,
        fileType,
        wordCount,
        hasEmail,
        hasPhone,
        sections,
        extractedAt: new Date().toISOString()
    };
}