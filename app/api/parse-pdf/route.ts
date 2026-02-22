import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
            const { text } = await req.json();
            return NextResponse.json({ text: text || 'Text content loaded', success: true });
        }
        
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ 
                text: 'No file provided',
                success: false
            }, { status: 400 });
        }

        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            try {
                // Import pdf-parse dynamically for better compatibility
                const pdfParse = (await import('pdf-parse')).default;
                
                // Parse PDF with mobile-friendly options
                const data = await pdfParse(buffer, {
                    max: 0, // Parse all pages
                    version: 'default',
                    // Add mobile-specific options
                    normalizeWhitespace: true,
                    disableCombineTextItems: false
                });
                
                let extractedText = data.text?.trim() || '';
                
                // Clean up the extracted text
                extractedText = extractedText
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\n\s*\n/g, '\n') // Remove empty lines
                    .trim();
                
                console.log('PDF extraction result:');
                console.log('- Pages:', data.numpages);
                console.log('- Text length:', extractedText.length);
                console.log('- First 200 chars:', extractedText.substring(0, 200));
                
                if (extractedText && extractedText.length > 20) {
                    return NextResponse.json({ 
                        text: extractedText,
                        success: true,
                        pages: data.numpages,
                        length: extractedText.length
                    });
                } else {
                    console.log('PDF parsing returned empty or minimal text');
                    return NextResponse.json({ 
                        text: `PDF file "${file.name}" was uploaded but appears to be empty or contains only images. Please paste your resume content manually.`,
                        success: false,
                        error: 'Empty PDF or image-only PDF'
                    });
                }
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return NextResponse.json({ 
                    text: `PDF file "${file.name}" could not be processed. Please paste your resume content manually.`,
                    success: false,
                    error: 'PDF parsing failed: ' + (pdfError as Error).message
                });
            }
        } 
        else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            try {
                const text = new TextDecoder('utf-8').decode(arrayBuffer).trim();
                console.log('Text file processed, length:', text.length);
                
                if (text && text.length > 0) {
                    return NextResponse.json({ 
                        text: text,
                        success: true
                    });
                } else {
                    return NextResponse.json({ 
                        text: `Text file "${file.name}" is empty.`,
                        success: false
                    });
                }
            } catch (textError) {
                console.error('Text file error:', textError);
                return NextResponse.json({ 
                    text: `Text file "${file.name}" could not be read.`,
                    success: false,
                    error: 'Text parsing failed'
                });
            }
        } 
        else {
            return NextResponse.json({ 
                text: `File "${file.name}" is not a supported format. Please upload a PDF or text file, or paste your content manually.`,
                success: false,
                fileType: file.type
            });
        }
        
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ 
            text: 'File upload failed. Please try again.',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}