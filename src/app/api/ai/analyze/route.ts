import { NextRequest, NextResponse } from 'next/server'
import { generateExamAnalysis } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const analysis = await generateExamAnalysis(body)
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('AI analyze error:', error)
    return NextResponse.json({ analysis: null }, { status: 500 })
  }
}
