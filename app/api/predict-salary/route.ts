import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SalaryRequest {
    skills: string[];
    test_score: number;
    education?: string;
}

interface SalaryResponse {
    predicted_salary: number;
    formatted_salary: string;
    job_role: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: SalaryRequest = await req.json();
        
        if (!body.skills || !Array.isArray(body.skills) || typeof body.test_score !== 'number') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }
        
        const SALARY_API_URL = process.env.SALARY_API_URL || 'http://localhost:8001';
        
        const response = await fetch(`${SALARY_API_URL}/predict-salary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                skills: body.skills,
                test_score: body.test_score,
                education: body.education || "Bachelor's"
            })
        });
        
        if (!response.ok) throw new Error('Salary API failed');
        
        const prediction: SalaryResponse = await response.json();
        return NextResponse.json(prediction);
        
    } catch (error) {
        console.error('Salary prediction error:', error);
        return NextResponse.json({
            predicted_salary: 75000,
            formatted_salary: '$75,000',
            job_role: 'Software Engineer',
            fallback: true
        });
    }
}
