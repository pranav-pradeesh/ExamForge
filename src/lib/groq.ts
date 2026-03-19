import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Best free model for analysis tasks - large context, high intelligence
export const AI_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

export async function generateExamAnalysis(params: {
  examType: string
  subjectScores: { physics: number; chemistry: number; maths: number }
  wrongTopics: string[]
  correctTopics: string[]
  totalScore: number
  maxScore: number
  timeSpent: number
}): Promise<string> {
  const prompt = `You are an expert JEE/VIT coach. Analyse this student's mock test performance and give precise, actionable feedback.

EXAM: ${params.examType}
SCORE: ${params.totalScore}/${params.maxScore} (${((params.totalScore / params.maxScore) * 100).toFixed(1)}%)
TIME USED: ${Math.floor(params.timeSpent / 60)} minutes

SUBJECT SCORES:
- Physics: ${params.subjectScores.physics}
- Chemistry: ${params.subjectScores.chemistry}  
- Mathematics: ${params.subjectScores.maths}

TOPICS WITH WRONG ANSWERS: ${params.wrongTopics.join(', ') || 'None'}
TOPICS ANSWERED CORRECTLY: ${params.correctTopics.join(', ') || 'None'}

Provide a structured analysis with:
1. **Overall Assessment** (2-3 sentences)
2. **Strongest Areas** (bullet points)
3. **Weak Zones** (specific topics to revise)
4. **Priority Study Plan** (top 3 things to do next)
5. **Score Prediction** (based on current trajectory, expected rank range)

Be specific, encouraging but honest. Use markdown formatting.`

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || 'Analysis unavailable.'
}

export async function explainQuestion(params: {
  questionText: string
  correctOption: string
  correctAnswer: string
  explanation: string
}): Promise<string> {
  const prompt = `A student is confused about this exam question. Explain it simply and clearly.

QUESTION: ${params.questionText}
CORRECT ANSWER: (${params.correctOption}) ${params.correctAnswer}
GIVEN EXPLANATION: ${params.explanation}

Give a clear, step-by-step explanation in 3-4 sentences. Use simple language. If it's a calculation, show the key steps. Start directly with the explanation.`

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 512,
    temperature: 0.5,
  })

  return completion.choices[0]?.message?.content || 'Explanation unavailable.'
}
