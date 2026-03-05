import { NextRequest, NextResponse } from 'next/server';
import { detectSkills } from '@/lib/services/skillDetection';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { resume_text } = await req.json();
    
    if (!resume_text || resume_text.trim().length < 50) {
      return NextResponse.json({
        error: 'Resume text too short',
      }, { status: 400 });
    }
    
    const detected = await detectSkills(resume_text);
    
    return NextResponse.json({
      detected,
      total: detected.length,
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Skill detection failed',
    }, { status: 500 });
  }
}
