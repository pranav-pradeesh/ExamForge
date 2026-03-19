'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatTime } from '@/lib/utils'
import { Flag, ChevronLeft, ChevronRight, Send, BookmarkPlus, Bookmark } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  topic: string
  difficulty: string
  subject_id: string
  subjects: { name: string; code: string }
}

interface Session {
  id: string
  exam_type: string
  max_score: number
  mock_exam_id: string
  mock_exams: {
    title: string
    duration_minutes: number
    total_questions: number
    marks_positive?: number
    marks_negative?: number
  }
}

type AnswerState = Record<string, { selected: string | null; flagged: boolean; visited: boolean }>

const OPTS = ['A', 'B', 'C', 'D'] as const
const OPT_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const

export default function ExamEnginePage() {
  const router = useRouter()
  const { sessionId } = useParams() as { sessionId: string }

  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showPalette, setShowPalette] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase
        .from('test_sessions')
        .select('*, mock_exams(title, duration_minutes, total_questions)')
        .eq('id', sessionId)
        .single()

      if (!sessionData) { router.push('/dashboard/exam'); return }
      if (sessionData.status === 'completed') { router.push(`/dashboard/results/${sessionId}`); return }

      setSession(sessionData as Session)

      // Fetch questions for this exam
      const { data: mqData } = await supabase
        .from('mock_exam_questions')
        .select('question_id, question_order, section_name')
        .eq('mock_exam_id', sessionData.mock_exam_id)
        .order('question_order')

      if (mqData && mqData.length > 0) {
        const questionIds = mqData.map(m => m.question_id)
        const { data: qData } = await supabase
          .from('questions')
          .select('*, subjects(name, code)')
          .in('id', questionIds)

        if (qData) {
          // Sort by question_order
          const ordered = mqData.map(m => qData.find(q => q.id === m.question_id)).filter(Boolean) as Question[]
          setQuestions(ordered)

          const initialAnswers: AnswerState = {}
          ordered.forEach(q => {
            initialAnswers[q.id] = { selected: null, flagged: false, visited: false }
          })
          setAnswers(initialAnswers)
        }
      }

      const durationSeconds = (sessionData.mock_exams?.duration_minutes || 180) * 60
      setTimeLeft(durationSeconds)
    }
    load()
  }, [sessionId, router])

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, timeLeft === 0])

  // Mark current question as visited
  useEffect(() => {
    if (!questions[current]) return
    const qId = questions[current].id
    setAnswers(a => ({ ...a, [qId]: { ...(a[qId] || { selected: null, flagged: false, visited: false }), visited: true } }))
  }, [current, questions])

  function selectAnswer(qId: string, opt: string) {
    setAnswers(a => ({
      ...a,
      [qId]: { ...(a[qId] || { selected: null, flagged: false, visited: true }), selected: opt },
    }))
  }

  function toggleFlag(qId: string) {
    setAnswers(a => ({
      ...a,
      [qId]: { ...(a[qId] || { selected: null, flagged: false, visited: true }), flagged: !a[qId]?.flagged },
    }))
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    clearInterval(timerRef.current!)

    let correct = 0, wrong = 0, skipped = 0
    let physScore = 0, chemScore = 0, mathsScore = 0
    const wrongTopics: string[] = []
    const correctTopics: string[] = []

    const answerInserts = questions.map(q => {
      const ans = answers[q.id]
      const selected = ans?.selected || null
      const isCorrect = selected === q.correct_option

      if (!selected) skipped++
      else if (isCorrect) {
        correct++
        correctTopics.push(q.topic || 'General')
        const subj = q.subjects?.name || ''
        if (subj === 'Physics') physScore += 4
        else if (subj === 'Chemistry') chemScore += 4
        else mathsScore += 4
      } else {
        wrong++
        wrongTopics.push(q.topic || 'General')
        const subj = q.subjects?.name || ''
        if (subj === 'Physics') physScore -= 1
        else if (subj === 'Chemistry') chemScore -= 1
        else mathsScore -= 1
      }

      return {
        session_id: sessionId,
        question_id: q.id,
        selected_option: selected,
        is_correct: selected ? isCorrect : null,
      }
    })

    const totalScore = Math.max(0, correct * 4 - wrong * 1)
    const maxScore = session?.max_score || 300
    const percentage = Math.round((totalScore / maxScore) * 100 * 10) / 10
    const timeUsed = (session?.mock_exams?.duration_minutes || 180) * 60 - timeLeft

    // Insert answers
    await supabase.from('test_answers').insert(answerInserts)

    // Get AI analysis
    let aiAnalysis = null
    let weakTopicsUniq = [...new Set(wrongTopics)].slice(0, 8)
    let strongTopicsUniq = [...new Set(correctTopics)].slice(0, 5)

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: session?.exam_type || 'JEE',
          subjectScores: { physics: physScore, chemistry: chemScore, maths: mathsScore },
          wrongTopics: weakTopicsUniq,
          correctTopics: strongTopicsUniq,
          totalScore,
          maxScore,
          timeSpent: timeUsed,
        }),
      })
      const aiData = await res.json()
      aiAnalysis = aiData.analysis
    } catch (e) {
      console.error('AI analysis failed', e)
    }

    // Update session
    await supabase.from('test_sessions').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      time_taken_seconds: timeUsed,
      total_score: totalScore,
      percentage,
      correct_count: correct,
      wrong_count: wrong,
      skipped_count: skipped,
      physics_score: physScore,
      chemistry_score: chemScore,
      maths_score: mathsScore,
      ai_analysis: aiAnalysis,
      ai_weak_topics: weakTopicsUniq,
      ai_strong_topics: strongTopicsUniq,
    }).eq('id', sessionId)

    setSubmitted(true)
    router.push(`/dashboard/results/${sessionId}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, submitted])

  if (!session || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'rgba(244,249,253,0.4)' }}>Loading exam...</p>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const qAns = answers[q.id] || { selected: null, flagged: false, visited: false }
  const attempted = Object.values(answers).filter(a => a.selected).length
  const flagged = Object.values(answers).filter(a => a.flagged).length
  const timerColor = timeLeft < 300 ? '#ff6b6b' : timeLeft < 900 ? '#f59e0b' : '#2baffc'

  function qStatus(qId: string) {
    const a = answers[qId]
    if (!a) return 'unvisited'
    if (a.flagged) return 'flagged'
    if (a.selected) return 'answered'
    if (a.visited) return 'visited'
    return 'unvisited'
  }

  const statusStyle = (status: string) => ({
    answered: { bg: '#55c360', color: '#010101' },
    flagged: { bg: '#f59e0b', color: '#010101' },
    visited: { bg: '#1e1e24', color: 'rgba(244,249,253,0.6)' },
    unvisited: { bg: '#0a0a0b', color: 'rgba(244,249,253,0.3)' },
  })[status] || { bg: '#0a0a0b', color: 'rgba(244,249,253,0.3)' }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col" style={{ background: '#010101' }}>
      {/* Exam header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: '#0a0a0b', borderBottom: '1px solid #1e1e24' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono-display text-xs font-bold" style={{ color: '#f4f9fd' }}>
            {session.mock_exams?.title?.slice(0, 40) || 'Mock Test'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs">
          <span style={{ color: '#55c360' }}>✓ {attempted}</span>
          <span style={{ color: '#f59e0b' }}>⚑ {flagged}</span>
          <span style={{ color: 'rgba(244,249,253,0.4)' }}>↷ {questions.length - attempted - flagged}</span>
        </div>

        {/* Timer */}
        <div className="font-mono-display font-bold text-lg" style={{ color: timerColor }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Subject tag */}
          <div className="px-6 pt-5 pb-3 flex items-center gap-3 flex-shrink-0">
            <span className="font-mono-display text-xs px-2 py-1 rounded"
              style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>
              Q{current + 1}/{questions.length}
            </span>
            <span className="font-mono-display text-xs px-2 py-1 rounded"
              style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc' }}>
              {q.subjects?.name || 'General'}
            </span>
            {q.topic && (
              <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>{q.topic}</span>
            )}
          </div>

          {/* Question text */}
          <div className="px-6 pb-4 flex-shrink-0 overflow-auto max-h-40">
            <p className="text-base leading-relaxed" style={{ color: '#f4f9fd' }}>
              {q.question_text}
            </p>
          </div>

          {/* Options */}
          <div className="px-6 flex-1 overflow-auto">
            <div className="space-y-3 pb-4">
              {OPTS.map((opt, i) => {
                const optKey = OPT_KEYS[i]
                const isSelected = qAns.selected === opt
                return (
                  <button key={opt}
                    onClick={() => selectAnswer(q.id, opt)}
                    className="w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(43,175,252,0.12)' : '#0a0a0b',
                      border: `1px solid ${isSelected ? '#2baffc' : '#1e1e24'}`,
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono-display text-xs font-bold"
                      style={{
                        background: isSelected ? '#2baffc' : '#1e1e24',
                        color: isSelected ? '#010101' : 'rgba(244,249,253,0.6)',
                      }}>
                      {opt}
                    </div>
                    <span className="text-sm leading-relaxed pt-1" style={{ color: isSelected ? '#f4f9fd' : 'rgba(244,249,253,0.75)' }}>
                      {(q as Record<string, unknown>)[optKey] as string}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nav controls */}
          <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
            style={{ borderTop: '1px solid #1e1e24' }}>
            <div className="flex gap-2">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="btn-ghost flex items-center gap-2 py-2 px-3 text-xs disabled:opacity-30">
                <ChevronLeft size={14} /> Prev
              </button>
              <button onClick={() => toggleFlag(q.id)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs transition-all"
                style={{
                  background: qAns.flagged ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: qAns.flagged ? '#f59e0b' : 'rgba(244,249,253,0.5)',
                  border: `1px solid ${qAns.flagged ? 'rgba(245,158,11,0.4)' : '#1e1e24'}`,
                }}>
                {qAns.flagged ? <Bookmark size={14} /> : <BookmarkPlus size={14} />}
                {qAns.flagged ? 'Flagged' : 'Flag'}
              </button>
            </div>

            <div className="flex gap-2">
              {qAns.selected && (
                <button onClick={() => selectAnswer(q.id, '')}
                  className="py-2 px-3 rounded-lg text-xs transition-all"
                  style={{ background: 'rgba(255,107,107,0.1)', color: '#ff8080', border: '1px solid rgba(255,107,107,0.2)' }}>
                  Clear
                </button>
              )}
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                  className="btn-primary flex items-center gap-2 py-2 px-4 text-xs">
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="btn-emerald flex items-center gap-2 py-2 px-4 text-xs">
                  {submitting ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Palette (glassmorphism) */}
        <div className={`transition-all duration-300 overflow-hidden flex-shrink-0 ${showPalette ? 'w-64' : 'w-0'}`}
          style={{ borderLeft: showPalette ? '1px solid #1e1e24' : 'none' }}>
          <div className="h-full flex flex-col" style={{ background: 'rgba(17,17,20,0.7)', backdropFilter: 'blur(12px)' }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e24' }}>
              <span className="font-mono-display text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>QUESTION PALETTE</span>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 space-y-1.5" style={{ borderBottom: '1px solid #1e1e24' }}>
              {[
                { label: 'Answered', color: '#55c360' },
                { label: 'Flagged', color: '#f59e0b' },
                { label: 'Visited', color: '#2a2a32' },
                { label: 'Unvisited', color: '#0a0a0b' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                  <div className="w-3 h-3 rounded-sm" style={{ background: l.color, border: '1px solid rgba(255,255,255,0.1)' }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((question, idx) => {
                  const status = qStatus(question.id)
                  const style = statusStyle(status)
                  return (
                    <button key={question.id}
                      onClick={() => setCurrent(idx)}
                      className="w-9 h-9 rounded-lg font-mono-display text-xs font-bold transition-all"
                      style={{
                        background: current === idx ? '#2baffc' : style.bg,
                        color: current === idx ? '#010101' : style.color,
                        border: `1px solid ${current === idx ? '#2baffc' : 'rgba(255,255,255,0.05)'}`,
                      }}>
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="p-4" style={{ borderTop: '1px solid #1e1e24' }}>
              <div className="text-xs mb-3 text-center" style={{ color: 'rgba(244,249,253,0.4)' }}>
                {attempted}/{questions.length} attempted
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="btn-emerald w-full flex items-center justify-center gap-2 py-3 text-xs">
                {submitting ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                Submit Exam
              </button>
            </div>
          </div>
        </div>

        {/* Toggle palette button */}
        <button onClick={() => setShowPalette(s => !s)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-12 flex items-center justify-center rounded-l-md"
          style={{
            background: '#1e1e24', color: 'rgba(244,249,253,0.5)',
            right: showPalette ? '256px' : '0px', position: 'fixed', transition: 'right 0.3s',
          }}>
          {showPalette ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>
    </div>
  )
}
