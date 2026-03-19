import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { text, mode, subject } = await req.json()
    // mode: 'notes' | 'flashcards' | 'summary' | 'concepts' | 'questions'

    if (!text || text.trim().length < 100) {
      return NextResponse.json({ error: 'Text too short' }, { status: 400 })
    }

    const prompts: Record<string, string> = {
      notes: `You are an expert JEE/VIT study notes creator. Convert this content into beautifully structured study notes.

Content:
${text.slice(0, 6000)}

Create comprehensive study notes with this exact markdown structure:
# [Topic Title]

## 📌 Key Concepts
- List the most important concepts as clear bullet points
- Include formulas in $LaTeX$ notation

## 📐 Important Formulas
| Formula | Description | When to use |
|---|---|---|
| $formula$ | what it means | when to apply |

## 🔑 Key Points to Remember
1. Numbered list of critical points
2. Include memory tricks where possible

## ⚡ Exam Tips
- Common mistakes to avoid
- Shortcuts and tricks
- High-weightage topics

## 🔗 Connections
- How this topic links to other concepts

Subject context: ${subject || 'General'}`,

      flashcards: `Create exam flashcards from this content for JEE/VIT preparation.

Content:
${text.slice(0, 5000)}

Return a JSON array of flashcards (ONLY JSON, no other text):
[
  {
    "front": "Question or concept to recall",
    "back": "Answer or explanation. Use $formula$ for math.",
    "subject": "Physics/Chemistry/Mathematics/Biology",
    "topic": "specific topic name",
    "difficulty": "easy/medium/hard"
  }
]

Create 10-20 high-quality flashcards covering the most important exam-relevant points.`,

      summary: `Create a concise exam-focused summary of this content for JEE/VIT students.

Content:
${text.slice(0, 6000)}

Write a well-structured summary in markdown:
- Start with a 2-3 sentence overview
- Cover all key points in order
- Highlight formulas in $LaTeX$
- Keep it concise but complete
- End with "Most likely to appear in exam:" section

Subject: ${subject || 'General'}`,

      concepts: `Extract and explain all key concepts from this content for JEE/VIT exam preparation.

Content:
${text.slice(0, 6000)}

Return a JSON array (ONLY JSON):
[
  {
    "concept": "Concept name",
    "definition": "Clear definition",
    "formula": "$LaTeX formula if applicable$",
    "example": "Worked example",
    "examRelevance": "high/medium/low",
    "topic": "parent topic"
  }
]`,

      questions: `Generate practice questions from this content for JEE/VIT exam preparation.

Content:
${text.slice(0, 5000)}

Return a JSON array of MCQ questions (ONLY JSON):
[
  {
    "question": "Question text, use $LaTeX$ for math",
    "options": ["A. option", "B. option", "C. option", "D. option"],
    "correct": "A",
    "explanation": "Step-by-step explanation",
    "difficulty": "easy/medium/hard",
    "topic": "topic name"
  }
]

Generate 8-12 questions of varying difficulty.`,
    }

    const prompt = prompts[mode] || prompts.notes

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.4,
    })

    const raw = completion.choices[0]?.message?.content || ''

    // For JSON modes, extract and parse
    if (mode === 'flashcards' || mode === 'concepts' || mode === 'questions') {
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          return NextResponse.json({ result: parsed, mode })
        } catch {
          return NextResponse.json({ result: raw, mode })
        }
      }
    }

    return NextResponse.json({ result: raw, mode })
  } catch (error) {
    console.error('Notes error:', error)
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 })
  }
}
