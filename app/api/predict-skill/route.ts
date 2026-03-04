import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PredictionRequest {
    skill_count: number;
    test_score: number;
    project_count?: number;
}

interface PredictionResponse {
    skill_level: string;
    confidence: number;
}

export async function POST(req: NextRequest) {
    try {
        const body: PredictionRequest = await req.json();
        
        if (typeof body.skill_count !== 'number' || typeof body.test_score !== 'number') {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
        }
        
        const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';
        
        const response = await fetch(`${ML_API_URL}/predict-skill-level`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                skill_count: body.skill_count,
                test_score: body.test_score,
                project_count: body.project_count || 0
            })
        });
        
        if (!response.ok) throw new Error('ML API failed');
        
        const prediction: PredictionResponse = await response.json();
        return NextResponse.json(prediction);
        
    } catch (error) {
        console.error('ML Prediction error:', error);
        return NextResponse.json({
            skill_level: 'Intermediate',
            confidence: 0.5,
            fallback: true
        });
    }
}
