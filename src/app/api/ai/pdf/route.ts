import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { text, examType, subjectHint } = await req.json()

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Text too short' }, { status: 400 })
    }

    const prompt = `You are an expert exam question extractor. Extract MCQ questions from the following text and return them as a JSON array.

TEXT:
${text.slice(0, 8000)}

Rules:
- Extract only proper MCQ questions with 4 options (A, B, C, D)
- For each question identify: subject (Physics/Chemistry/Mathematics/Biology/English/Aptitude), topic, difficulty (easy/medium/hard)
- Preserve all mathematical expressions exactly as written (use LaTeX notation like $x^2$ for superscripts, $\\frac{a}{b}$ for fractions)
- Exam type is: ${examType || 'JEE'}
- Subject hint: ${subjectHint || 'auto-detect'}

Return ONLY a valid JSON array, no other text:
[
  {
    "question_text": "full question text here, use LaTeX for math e.g. $x^2 + y^2 = r^2$",
    "option_a": "option A text",
    "option_b": "option B text", 
    "option_c": "option C text",
    "option_d": "option D text",
    "correct_option": "A",
    "explanation": "step by step explanation",
    "subject": "Physics",
    "topic": "Circular Motion",
    "difficulty": "medium",
    "year": null,
    "has_math": true
  }
]`

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.3,
    })

    const raw = completion.choices[0]?.message?.content || '[]'
    
    // Extract JSON from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ questions: [], error: 'No questions found in PDF' })
    }

    const questions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ questions, count: questions.length })
  } catch (error) {
    console.error('PDF parse error:', error)
    return NextResponse.json({ error: 'Failed to extract questions' }, { status: 500 })
  }
}
