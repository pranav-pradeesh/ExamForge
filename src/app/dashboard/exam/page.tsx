'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Play, Clock, BookOpen, Zap, ChevronRight } from 'lucide-react'

interface MockExam {
  id: string
  title: string
  exam_type: string
  duration_minutes: number
  total_questions: number
  total_marks: number
  instructions: string
}

function ExamPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [exams, setExams] = useState<MockExam[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'JEE' | 'VIT'>(
    (params.get('type') as 'JEE' | 'VIT') || 'ALL'
  )

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('mock_exams').select('*').eq('is_active', true).order('created_at', { ascending: false })
      setExams(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function startExam(examId: string) {
    setStarting(examId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Create test session
    const exam = exams.find(e => e.id === examId)!
    const { data: session, error } = await supabase.from('test_sessions').insert({
      user_id: user.id,
      mock_exam_id: examId,
      exam_type: exam.exam_type,
      status: 'in_progress',
      max_score: exam.total_marks,
    }).select().single()

    if (error || !session) {
      console.error(error)
      setStarting(null)
      return
    }

    router.push(`/dashboard/exam/${session.id}`)
  }

  const filtered = filter === 'ALL' ? exams : exams.filter(e => e.exam_type === filter)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-in">
        <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>Mock Tests</h1>
        <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>Full-length CBT simulation with real PYQs</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 animate-in stagger-1">
        {(['ALL', 'JEE', 'VIT'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg font-mono-display text-xs font-bold transition-all"
            style={{
              background: filter === f ? '#2baffc' : '#111114',
              color: filter === f ? '#010101' : 'rgba(244,249,253,0.5)',
              border: `1px solid ${filter === f ? '#2baffc' : '#1e1e24'}`,
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card h-48 animate-pulse" style={{ borderColor: '#1e1e24' }}>
              <div className="h-4 w-1/2 rounded mb-3" style={{ background: '#1e1e24' }} />
              <div className="h-3 w-3/4 rounded mb-2" style={{ background: '#1e1e24' }} />
              <div className="h-3 w-1/2 rounded" style={{ background: '#1e1e24' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16" style={{ borderColor: '#1e1e24' }}>
          <p style={{ color: 'rgba(244,249,253,0.4)' }}>No exams available for this filter.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 animate-in stagger-2">
          {filtered.map(exam => {
            const isJEE = exam.exam_type === 'JEE'
            const color = isJEE ? '#2baffc' : '#55c360'
            return (
              <div key={exam.id} className="card group transition-all duration-200"
                style={{ borderColor: '#1e1e24' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = color + '40')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono-display text-xs font-bold px-2 py-1 rounded"
                    style={{ background: color + '15', color }}>
                    {exam.exam_type}
                  </span>
                </div>

                <h3 className="font-semibold mb-2 leading-snug" style={{ color: '#f4f9fd' }}>{exam.title}</h3>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <Clock size={12} style={{ color }} />
                    {exam.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <BookOpen size={12} style={{ color }} />
                    {exam.total_questions} questions
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <Zap size={12} style={{ color: '#f59e0b' }} />
                    {exam.total_marks} marks
                  </div>
                </div>

                {exam.instructions && (
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(244,249,253,0.4)' }}>
                    {exam.instructions.slice(0, 100)}...
                  </p>
                )}

                <button
                  onClick={() => startExam(exam.id)}
                  disabled={!!starting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono-display text-xs font-bold transition-all"
                  style={{
                    background: starting === exam.id ? color + '30' : color,
                    color: starting === exam.id ? color : '#010101',
                  }}>
                  {starting === exam.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      Start Test
                      <ChevronRight size={12} />
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div />}>
      <ExamPageInner />
    </Suspense>
  )
}
