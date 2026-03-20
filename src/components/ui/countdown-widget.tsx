'use client'
import { useEffect, useState } from 'react'
import { Clock, CalendarDays, Zap } from 'lucide-react'
import { DashCard } from '@/components/ui/spotlight-card'

interface ExamDate {
  id: string
  exam_code: string
  exam_name: string
  exam_date: string
}

interface CountdownWidgetProps {
  targetExam: string
  className?: string
}

function getDaysLeft(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

function getUrgencyColor(days: number): string {
  if (days <= 30) return '#ff6b6b'
  if (days <= 60) return '#f59e0b'
  if (days <= 90) return '#2baffc'
  return '#55c360'
}

function getMotivation(days: number): string {
  if (days <= 0) return 'Exam day! All the best 🎯'
  if (days <= 7) return 'Final week — revise formulas only'
  if (days <= 14) return 'Two weeks — solve PYQs daily'
  if (days <= 30) return 'Last month — full mock tests!'
  if (days <= 60) return 'Two months — fix weak topics now'
  if (days <= 90) return 'Three months — build consistency'
  return 'Time to start your preparation'
}

export function CountdownWidget({ targetExam, className }: CountdownWidgetProps) {
  const [examDates, setExamDates] = useState<ExamDate[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.from('exam_dates')
        .select('*')
        .eq('exam_code', targetExam)
        .order('exam_date')
        .then(({ data }) => {
          if (data && data.length > 0) {
            // Auto-select the next upcoming exam
            const upcoming = data.findIndex(d => getDaysLeft(d.exam_date) > 0)
            setExamDates(data as ExamDate[])
            setSelectedIdx(upcoming >= 0 ? upcoming : 0)
          }
        })
    })
    // Live countdown tick every minute
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [targetExam])

  if (examDates.length === 0) {
    return (
      <DashCard glowColor="blue" className={className}>
        <div className="flex items-center gap-2 mb-3 text-xs font-mono-display" style={{ color: 'rgba(244,249,253,0.5)' }}>
          <CalendarDays size={11} style={{ color: '#2baffc' }} /> EXAM COUNTDOWN
        </div>
        <div className="flex items-center justify-center h-24">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
        </div>
      </DashCard>
    )
  }

  const exam = examDates[selectedIdx]
  const daysLeft = getDaysLeft(exam.exam_date)
  const urgencyColor = getUrgencyColor(daysLeft)
  const motivation = getMotivation(daysLeft)
  const progress = Math.max(0, Math.min(100, ((365 - daysLeft) / 365) * 100))
  const glowColor = daysLeft <= 30 ? 'orange' : daysLeft <= 60 ? 'amber' : 'blue'

  // Segment breakdown
  const weeks = Math.floor(daysLeft / 7)
  const remainingDays = daysLeft % 7
  const hours = new Date().getHours()
  const hoursLeft = (daysLeft - 1) * 24 + (24 - hours)

  return (
    <DashCard glowColor={glowColor as 'blue'|'amber'|'orange'} className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono-display font-bold flex items-center gap-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>
          <CalendarDays size={11} style={{ color: urgencyColor }} /> EXAM COUNTDOWN
        </div>
        {/* Exam selector tabs */}
        {examDates.length > 1 && (
          <div className="flex gap-1">
            {examDates.map((d, i) => (
              <button key={d.id} onClick={() => setSelectedIdx(i)}
                className="text-xs px-2 py-0.5 rounded transition-all"
                style={{
                  background: i === selectedIdx ? urgencyColor + '20' : 'transparent',
                  color: i === selectedIdx ? urgencyColor : 'rgba(244,249,253,0.4)',
                  border: `1px solid ${i === selectedIdx ? urgencyColor + '40' : 'transparent'}`,
                }}>
                S{i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Exam name */}
      <div className="text-sm font-semibold mb-1 truncate" style={{ color: '#f4f9fd' }}>{exam.exam_name}</div>
      <div className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'rgba(244,249,253,0.4)' }}>
        <CalendarDays size={10} />
        {new Date(exam.exam_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>

      {/* Big countdown */}
      {daysLeft > 0 ? (
        <div className="flex items-end gap-3 mb-4">
          <div>
            <div className="font-mono-display font-bold" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: urgencyColor, lineHeight: 1, filter: `drop-shadow(0 0 12px ${urgencyColor}40)` }}>
              {daysLeft}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(244,249,253,0.5)' }}>days left</div>
          </div>
          <div className="pb-1 space-y-0.5">
            <div className="text-xs font-mono-display" style={{ color: 'rgba(244,249,253,0.4)' }}>
              <span style={{ color: urgencyColor }}>{weeks}</span>w <span style={{ color: urgencyColor }}>{remainingDays}</span>d
            </div>
            <div className="text-xs font-mono-display" style={{ color: 'rgba(244,249,253,0.3)' }}>~{hoursLeft.toLocaleString()}h</div>
          </div>
        </div>
      ) : (
        <div className="text-2xl font-mono-display font-bold mb-4" style={{ color: '#55c360' }}>
          {daysLeft === 0 ? '🎯 Today!' : '✅ Done!'}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(244,249,253,0.4)' }}>
          <span>Prep progress</span>
          <span style={{ color: urgencyColor }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e24' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${urgencyColor}80, ${urgencyColor})` }} />
        </div>
      </div>

      {/* Motivation */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg"
        style={{ background: urgencyColor + '10', border: `1px solid ${urgencyColor}20` }}>
        <Zap size={12} className="flex-shrink-0 mt-0.5" style={{ color: urgencyColor }} />
        <span className="text-xs leading-relaxed" style={{ color: 'rgba(244,249,253,0.7)' }}>{motivation}</span>
      </div>
    </DashCard>
  )
}
