'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { scoreColor, formatTime, difficultyColor } from '@/lib/utils'
import {
  CheckCircle, XCircle, SkipForward, Clock, Brain, ChevronLeft,
  ChevronDown, ChevronUp, Sparkles, RotateCcw
} from 'lucide-react'

interface FullSession {
  id: string
  exam_type: string
  total_score: number
  max_score: number
  percentage: number
  correct_count: number
  wrong_count: number
  skipped_count: number
  time_taken_seconds: number
  started_at: string
  physics_score: number
  chemistry_score: number
  maths_score: number
  ai_analysis: string | null
  ai_weak_topics: string[]
  ai_strong_topics: string[]
  mock_exams: { title: string }
}

interface Answer {
  id: string
  question_id: string
  selected_option: string | null
  is_correct: boolean | null
  questions: {
    question_text: string
    option_a: string; option_b: string; option_c: string; option_d: string
    correct_option: string
    explanation: string
    topic: string
    difficulty: string
    subjects: { name: string }
  }
}

const OPTS = ['A', 'B', 'C', 'D'] as const
const OPT_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const

export default function ResultDetailPage() {
  const { resultId } = useParams() as { resultId: string }
  const router = useRouter()
  const [session, setSession] = useState<FullSession | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [aiExplain, setAiExplain] = useState<Record<string, string>>({})
  const [loadingExplain, setLoadingExplain] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnalysis, setShowAnalysis] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase
        .from('test_sessions')
        .select('*, mock_exams(title)')
        .eq('id', resultId)
        .single()

      if (!sessionData) { router.push('/dashboard/results'); return }
      setSession(sessionData as FullSession)

      const { data: ans } = await supabase
        .from('test_answers')
        .select('*, questions(question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty, subjects(name))')
        .eq('session_id', resultId)

      setAnswers((ans as Answer[]) || [])
      setLoading(false)
    }
    load()
  }, [resultId, router])

  async function getAiExplanation(answerId: string, questionText: string, correctOption: string, correctAnswer: string, explanation: string) {
    if (aiExplain[answerId]) { setExpanded(e => e === answerId ? null : answerId); return }
    setLoadingExplain(answerId)
    setExpanded(answerId)
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText, correctOption, correctAnswer, explanation }),
      })
      const data = await res.json()
      setAiExplain(e => ({ ...e, [answerId]: data.explanation }))
    } catch {
      setAiExplain(e => ({ ...e, [answerId]: explanation }))
    }
    setLoadingExplain(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!session) return null

  const pct = Math.round(session.percentage)
  const color = scoreColor(pct)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/dashboard/results" className="inline-flex items-center gap-2 text-sm transition-colors animate-in"
        style={{ color: 'rgba(244,249,253,0.5)' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.5)')}>
        <ChevronLeft size={14} /> Back to Results
      </Link>

      {/* Score card */}
      <div className="card relative overflow-hidden animate-in stagger-1" style={{ borderColor: '#1e1e24' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 80% 50%, ${color}10 0%, transparent 60%)` }} />
        <div className="relative grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1 text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto flex flex-col items-center justify-center mb-2"
              style={{ background: color + '15', border: `2px solid ${color}40` }}>
              <div className="font-mono-display font-bold text-2xl" style={{ color }}>{pct}%</div>
            </div>
            <div className="text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
              {session.total_score}/{session.max_score}
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Correct', val: session.correct_count, color: '#55c360', icon: <CheckCircle size={14} /> },
              { label: 'Wrong', val: session.wrong_count, color: '#ff6b6b', icon: <XCircle size={14} /> },
              { label: 'Skipped', val: session.skipped_count, color: '#f59e0b', icon: <SkipForward size={14} /> },
              { label: 'Physics', val: `${session.physics_score} pts`, color: '#2baffc', icon: null },
              { label: 'Chemistry', val: `${session.chemistry_score} pts`, color: '#55c360', icon: null },
              { label: 'Maths', val: `${session.maths_score} pts`, color: '#f59e0b', icon: null },
            ].map(s => (
              <div key={s.label} className="px-3 py-3 rounded-xl" style={{ background: '#0a0a0b' }}>
                <div className="text-xs mb-1 flex items-center gap-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>
                  {s.icon && <span style={{ color: s.color }}>{s.icon}</span>}
                  {s.label}
                </div>
                <div className="font-mono-display font-bold" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>
          <Clock size={12} />
          Time used: {formatTime(session.time_taken_seconds || 0)}
          <span className="mx-2">·</span>
          {new Date(session.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* AI Analysis */}
      {session.ai_analysis && (
        <div className="card animate-in stagger-2" style={{ borderColor: 'rgba(43,175,252,0.3)', background: 'rgba(43,175,252,0.04)' }}>
          <button className="w-full flex items-center justify-between" onClick={() => setShowAnalysis(!showAnalysis)}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(43,175,252,0.15)', color: '#2baffc' }}>
                <Brain size={16} />
              </div>
              <span className="font-mono-display text-sm font-bold" style={{ color: '#2baffc' }}>AI Analysis</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(43,175,252,0.15)', color: '#2baffc' }}>
                <Sparkles size={10} className="inline mr-1" />Powered by Llama 4
              </span>
            </div>
            {showAnalysis ? <ChevronUp size={16} style={{ color: '#2baffc' }} /> : <ChevronDown size={16} style={{ color: '#2baffc' }} />}
          </button>

          {showAnalysis && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(43,175,252,0.15)' }}>
              <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'rgba(244,249,253,0.8)' }}>
                {session.ai_analysis}
              </div>

              {(session.ai_weak_topics?.length > 0 || session.ai_strong_topics?.length > 0) && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  {session.ai_weak_topics?.length > 0 && (
                    <div>
                      <div className="text-xs font-mono-display mb-2" style={{ color: '#ff8080' }}>WEAK ZONES</div>
                      <div className="flex flex-wrap gap-2">
                        {session.ai_weak_topics.map(t => (
                          <span key={t} className="text-xs px-2 py-1 rounded"
                            style={{ background: 'rgba(255,107,107,0.1)', color: '#ff8080' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {session.ai_strong_topics?.length > 0 && (
                    <div>
                      <div className="text-xs font-mono-display mb-2" style={{ color: '#55c360' }}>STRONG AREAS</div>
                      <div className="flex flex-wrap gap-2">
                        {session.ai_strong_topics.map(t => (
                          <span key={t} className="text-xs px-2 py-1 rounded"
                            style={{ background: 'rgba(85,195,96,0.1)', color: '#55c360' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Question Review */}
      <div className="animate-in stagger-3">
        <h2 className="font-mono-display font-bold text-base mb-4" style={{ color: '#f4f9fd' }}>
          Question Review ({answers.length})
        </h2>
        <div className="space-y-3">
          {answers.map((ans, idx) => {
            const q = ans.questions
            if (!q) return null
            const isExpanded = expanded === ans.id
            const statusColor = ans.is_correct === true ? '#55c360' : ans.is_correct === false ? '#ff6b6b' : '#f59e0b'
            const statusLabel = ans.is_correct === true ? 'Correct' : ans.is_correct === false ? 'Wrong' : 'Skipped'

            return (
              <div key={ans.id} className="card transition-all" style={{ borderColor: statusColor + '30' }}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono-display font-bold"
                    style={{ background: statusColor + '15', color: statusColor }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono-display px-2 py-0.5 rounded"
                        style={{ background: statusColor + '15', color: statusColor }}>{statusLabel}</span>
                      {q.topic && <span className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>{q.topic}</span>}
                      <span className="text-xs" style={{ color: difficultyColor(q.difficulty) }}>{q.difficulty}</span>
                    </div>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: '#f4f9fd' }}>{q.question_text}</p>

                    {/* Options */}
                    <div className="space-y-1.5 mb-3">
                      {OPTS.map((opt, i) => {
                        const optText = (q as unknown as Record<string, string>)[OPT_KEYS[i]]
                        const isCorrect = opt === q.correct_option
                        const isSelected = opt === ans.selected_option
                        let bg = '#0a0a0b', border = '#1e1e24', textColor = 'rgba(244,249,253,0.55)'
                        if (isCorrect) { bg = 'rgba(85,195,96,0.1)'; border = 'rgba(85,195,96,0.4)'; textColor = '#55c360' }
                        if (isSelected && !isCorrect) { bg = 'rgba(255,107,107,0.1)'; border = 'rgba(255,107,107,0.4)'; textColor = '#ff8080' }
                        return (
                          <div key={opt} className="flex items-start gap-3 px-3 py-2 rounded-lg text-xs"
                            style={{ background: bg, border: `1px solid ${border}` }}>
                            <span className="font-mono-display font-bold flex-shrink-0" style={{ color: textColor }}>{opt}.</span>
                            <span style={{ color: textColor }}>{optText}</span>
                            {isCorrect && <CheckCircle size={12} className="ml-auto flex-shrink-0 mt-0.5" style={{ color: '#55c360' }} />}
                            {isSelected && !isCorrect && <XCircle size={12} className="ml-auto flex-shrink-0 mt-0.5" style={{ color: '#ff8080' }} />}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation toggle */}
                    <button
                      onClick={() => getAiExplanation(ans.id, q.question_text, q.correct_option,
                        (q as unknown as Record<string, string>)[`option_${q.correct_option.toLowerCase()}`],
                        q.explanation)}
                      className="flex items-center gap-2 text-xs transition-colors"
                      style={{ color: '#2baffc' }}>
                      <Brain size={12} />
                      {isExpanded ? 'Hide' : 'AI Explain'}
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-3 rounded-lg text-xs leading-relaxed"
                        style={{ background: 'rgba(43,175,252,0.06)', border: '1px solid rgba(43,175,252,0.15)', color: 'rgba(244,249,253,0.75)' }}>
                        {loadingExplain === ans.id ? (
                          <div className="flex items-center gap-2" style={{ color: '#2baffc' }}>
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            Generating explanation...
                          </div>
                        ) : (
                          aiExplain[ans.id] || q.explanation
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Retake */}
      <div className="flex justify-center pb-8">
        <Link href="/dashboard/exam" className="btn-primary flex items-center gap-2">
          <RotateCcw size={14} /> Take Another Test
        </Link>
      </div>
    </div>
  )
}
