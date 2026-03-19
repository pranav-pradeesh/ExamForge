import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are ExamForge AI, an expert JEE and VIT exam tutor. You help students understand concepts deeply, solve problems step-by-step, and prepare for competitive exams.

Your personality:
- Precise and encouraging
- Break down complex problems into clear steps
- Use examples and analogies
- Point out common exam traps and shortcuts
- Reference JEE/VIT exam patterns when relevant
- For math/physics, show all working clearly with numbered steps
- Use LaTeX-style notation for math: $formula$ for inline, $$formula$$ for block

Subjects you excel at: Physics, Chemistry, Mathematics, Biology, English, Aptitude

Always end problem solutions with: "⚡ Exam Tip:" followed by a relevant shortcut or thing to watch out for.`

export async function POST(req: NextRequest) {
  try {
    const { messages, subject } = await req.json()

    const systemWithSubject = subject
      ? `${SYSTEM_PROMPT}\n\nCurrent study context: ${subject}`
      : SYSTEM_PROMPT

    const stream = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: systemWithSubject },
        ...messages.slice(-20), // keep last 20 messages for context
      ],
      max_tokens: 2048,
      temperature: 0.7,
      stream: true,
    })

    // Return as SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Chat failed' }), { status: 500 })
  }
}
