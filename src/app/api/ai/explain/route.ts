import { NextRequest, NextResponse } from 'next/server'
import { explainQuestion } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const explanation = await explainQuestion(body)
    return NextResponse.json({ explanation })
  } catch (error) {
    console.error('AI explain error:', error)
    return NextResponse.json({ explanation: null }, { status: 500 })
  }
}
