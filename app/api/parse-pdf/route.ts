import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type');
        
        // Handle JSON requests
        if (contentType?.includes('application/json')) {
            const { text } = await req.json();
            return NextResponse.json({ text: text || 'Text content loaded' });
        }
        
        // Handle file uploads
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ 
                text: 'No file provided',
                error: 'File is required' 
            }, { status: 400 });
        }

        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Handle PDF files
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            try {
                const pdfParse = (await import('pdf-parse')).default;
                const data = await pdfParse(buffer, {
                    max: 0, // Parse all pages
                    version: 'default'
                });
                
                const extractedText = data.text?.trim();
                console.log('PDF extracted text length:', extractedText?.length || 0);
                console.log('PDF text sample:', extractedText?.substring(0, 200));
                
                if (extractedText && extractedText.length > 10) {
                    return NextResponse.json({ 
                        text: extractedText,
                        success: true,
                        pages: data.numpages
                    });
                } else {
                    return NextResponse.json({ 
                        text: `PDF file ${file.name} uploaded but text extraction failed. Please paste content manually.`,
                        success: false,
                        error: 'No text extracted from PDF'
                    });
                }
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return NextResponse.json({ 
                    text: `PDF file ${file.name} uploaded but parsing failed. Please paste content manually.`,
                    success: false,
                    error: 'PDF parsing failed'
                });
            }
        } 
        // Handle text files
        else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            try {
                const text = new TextDecoder('utf-8').decode(arrayBuffer);
                console.log('Text file content length:', text.length);
                
                if (text && text.trim().length > 0) {
                    return NextResponse.json({ 
                        text: text.trim(),
                        success: true
                    });
                } else {
                    return NextResponse.json({ 
                        text: `Text file ${file.name} is empty. Please paste content manually.`,
                        success: false
                    });
                }
            } catch (textError) {
                console.error('Text file parsing error:', textError);
                return NextResponse.json({ 
                    text: `Text file ${file.name} uploaded but parsing failed.`,
                    success: false,
                    error: 'Text parsing failed'
                });
            }
        } 
        // Handle other file types
        else {
            return NextResponse.json({ 
                text: `File ${file.name} uploaded successfully. Please paste the content manually for analysis.`,
                success: false,
                fileType: file.type,
                message: 'Unsupported file type - manual input required'
            });
        }
        
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ 
            text: 'File upload failed. Please try again or paste content manually.',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}