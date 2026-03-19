'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { scoreColor, formatTime } from '@/lib/utils'
import { Clock, CheckCircle, XCircle, SkipForward, ChevronRight, BarChart3 } from 'lucide-react'

interface Session {
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
  mock_exams: { title: string }
}

export default function ResultsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('test_sessions')
        .select('*, mock_exams(title)')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
      setSessions((data as Session[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-in">
        <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>My Results</h1>
        <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>{sessions.length} tests completed</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-20 animate-pulse" style={{ borderColor: '#1e1e24' }} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card text-center py-16" style={{ borderColor: '#1e1e24' }}>
          <BarChart3 size={40} className="mx-auto mb-4" style={{ color: 'rgba(244,249,253,0.2)' }} />
          <p className="mb-4" style={{ color: 'rgba(244,249,253,0.4)' }}>No completed tests yet</p>
          <Link href="/dashboard/exam" className="btn-primary text-sm py-2 px-6">Take a Mock Test</Link>
        </div>
      ) : (
        <div className="space-y-3 animate-in stagger-1">
          {sessions.map(s => {
            const pct = Math.round(s.percentage)
            const date = new Date(s.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            const color = scoreColor(pct)
            return (
              <Link key={s.id} href={`/dashboard/results/${s.id}`}
                className="card flex items-center gap-5 transition-all group"
                style={{ borderColor: '#1e1e24', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2baffc30')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>

                {/* Score circle */}
                <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: color + '15', border: `1px solid ${color}30` }}>
                  <div className="font-mono-display font-bold text-base" style={{ color }}>{pct}%</div>
                  <div className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>score</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: '#f4f9fd' }}>
                      {s.mock_exams?.title || `${s.exam_type} Mock Test`}
                    </span>
                    <span className="font-mono-display text-xs px-2 py-0.5 rounded"
                      style={{ background: (s.exam_type === 'JEE' ? '#2baffc' : '#55c360') + '15', color: s.exam_type === 'JEE' ? '#2baffc' : '#55c360' }}>
                      {s.exam_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1" style={{ color: '#55c360' }}>
                      <CheckCircle size={11} /> {s.correct_count} correct
                    </span>
                    <span className="flex items-center gap-1" style={{ color: '#ff8080' }}>
                      <XCircle size={11} /> {s.wrong_count} wrong
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'rgba(244,249,253,0.4)' }}>
                      <SkipForward size={11} /> {s.skipped_count} skipped
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'rgba(244,249,253,0.4)' }}>
                      <Clock size={11} /> {formatTime(s.time_taken_seconds || 0)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs mb-1" style={{ color: 'rgba(244,249,253,0.35)' }}>{date}</div>
                  <div className="text-xs font-mono-display" style={{ color: '#2baffc' }}>
                    {s.total_score}/{s.max_score}
                  </div>
                </div>

                <ChevronRight size={16} style={{ color: 'rgba(244,249,253,0.2)', flexShrink: 0 }} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
