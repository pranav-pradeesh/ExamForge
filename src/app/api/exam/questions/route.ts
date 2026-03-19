import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { examType, subjectCodes, topic, difficulty, limit = 30 } = await req.json()

    let query = supabase
      .from('questions')
      .select('*, subjects(name, code)')
      .eq('exam_type', examType)
      .eq('is_active', true)

    if (topic) query = query.ilike('topic', `%${topic}%`)
    if (difficulty) query = query.eq('difficulty', difficulty)

    // Get more than needed to shuffle
    const { data, error } = await query.limit(200)
    if (error) throw error

    let filtered = data || []

    // Filter by subject codes if provided
    if (subjectCodes && subjectCodes.length > 0) {
      filtered = filtered.filter((q: { subjects?: { code: string } }) =>
        subjectCodes.includes(q.subjects?.code)
      )
    }

    // Shuffle randomly
    filtered = filtered.sort(() => Math.random() - 0.5).slice(0, limit)

    return NextResponse.json({ questions: filtered, count: filtered.length })
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}
