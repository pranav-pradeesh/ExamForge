'use client'
import { useEffect, useState } from 'react'
import { Trophy, Flame, TrendingUp, Medal } from 'lucide-react'
import { DashCard } from '@/components/ui/spotlight-card'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface LeaderEntry {
  id: string
  full_name: string
  target_exam: string
  avg_score: number
  best_score: number
  tests_taken: number
  current_streak: number
  overall_rank: number
  exam_rank: number
}

interface LeaderboardWidgetProps {
  currentUserId: string
  targetExam: string
  className?: string
}

const EXAM_COLORS: Record<string, string> = {
  JEE: '#2baffc', VITEEE: '#55c360', KEAM: '#f59e0b', CUSAT: '#a78bfa', NEET: '#ec4899',
}

const RANK_ICONS = ['🥇', '🥈', '🥉']

export function LeaderboardWidget({ currentUserId, targetExam, className }: LeaderboardWidgetProps) {
  const [entries, setEntries] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'overall' | 'exam'>('exam')
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    loadLeaderboard()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, targetExam])

  async function loadLeaderboard() {
    setLoading(true)
    let query = supabase
      .from('leaderboard')
      .select('*')
      .gt('tests_taken', 0)
      .order(filter === 'exam' ? 'exam_rank' : 'overall_rank')
      .limit(10)

    if (filter === 'exam') {
      query = query.eq('target_exam', targetExam)
    }

    const { data } = await query
    const list = (data as LeaderEntry[]) || []
    setEntries(list)

    // Find current user's rank
    const me = list.find(e => e.id === currentUserId)
    if (me) {
      setMyRank(filter === 'exam' ? me.exam_rank : me.overall_rank)
    } else {
      // Check if they're outside top 10
      const { data: meData } = await supabase
        .from('leaderboard')
        .select('overall_rank, exam_rank')
        .eq('id', currentUserId)
        .single()
      if (meData) {
        setMyRank(filter === 'exam' ? meData.exam_rank : meData.overall_rank)
      }
    }
    setLoading(false)
  }

  const examColor = EXAM_COLORS[targetExam] || '#2baffc'

  return (
    <DashCard glowColor="blue" className={className} style={{ padding: '0' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e24' }}>
        <div className="flex items-center gap-2">
          <Trophy size={14} style={{ color: '#f59e0b' }} />
          <span className="font-mono-display font-bold text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>LEADERBOARD</span>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: '#0a0a0b' }}>
          {(['exam', 'overall'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs px-2.5 py-1 rounded-md transition-all font-medium capitalize"
              style={{
                background: filter === f ? '#1e1e24' : 'transparent',
                color: filter === f ? '#f4f9fd' : 'rgba(244,249,253,0.4)',
              }}>
              {f === 'exam' ? targetExam : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* My rank banner (if not in top 10) */}
      {myRank && myRank > 10 && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg flex items-center justify-between"
          style={{ background: 'rgba(43,175,252,0.08)', border: '1px solid rgba(43,175,252,0.2)' }}>
          <span className="text-xs" style={{ color: 'rgba(244,249,253,0.6)' }}>Your rank</span>
          <span className="font-mono-display font-bold text-sm" style={{ color: '#2baffc' }}>#{myRank}</span>
        </div>
      )}

      {/* List */}
      <div className="divide-y" style={{ borderColor: '#1e1e24' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
              <div className="w-7 h-5 rounded" style={{ background: '#1e1e24' }} />
              <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: '#1e1e24' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded w-3/4" style={{ background: '#1e1e24' }} />
                <div className="h-2.5 rounded w-1/2" style={{ background: '#1e1e24' }} />
              </div>
              <div className="w-10 h-4 rounded" style={{ background: '#1e1e24' }} />
            </div>
          ))
        ) : entries.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Trophy size={28} className="mx-auto mb-2" style={{ color: 'rgba(244,249,253,0.15)' }} />
            <p className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>No data yet. Take a test to appear here!</p>
          </div>
        ) : entries.map((entry, idx) => {
          const rank = filter === 'exam' ? entry.exam_rank : entry.overall_rank
          const isMe = entry.id === currentUserId
          const eColor = EXAM_COLORS[entry.target_exam] || '#2baffc'
          return (
            <div key={entry.id}
              className="px-5 py-3 flex items-center gap-3 transition-all"
              style={{
                background: isMe ? 'rgba(43,175,252,0.06)' : 'transparent',
                borderLeft: isMe ? '2px solid #2baffc' : '2px solid transparent',
              }}>
              {/* Rank */}
              <div className="w-7 text-center flex-shrink-0">
                {rank <= 3
                  ? <span className="text-base">{RANK_ICONS[rank - 1]}</span>
                  : <span className="font-mono-display font-bold text-sm" style={{ color: 'rgba(244,249,253,0.4)' }}>#{rank}</span>
                }
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${eColor}40, ${eColor}20)`, color: eColor, border: `1px solid ${eColor}30` }}>
                {entry.full_name.charAt(0).toUpperCase()}
              </div>

              {/* Name + exam */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate flex items-center gap-1.5" style={{ color: isMe ? '#f4f9fd' : 'rgba(244,249,253,0.8)' }}>
                  {entry.full_name.split(' ')[0]}
                  {isMe && <span className="text-xs px-1 py-0 rounded" style={{ background: 'rgba(43,175,252,0.15)', color: '#2baffc' }}>you</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {entry.current_streak > 0 && (
                    <span className="text-xs flex items-center gap-0.5" style={{ color: '#f59e0b' }}>
                      <Flame size={9} />{entry.current_streak}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>{entry.tests_taken} tests</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <div className="font-mono-display font-bold text-sm"
                  style={{ color: entry.avg_score >= 70 ? '#55c360' : entry.avg_score >= 40 ? '#2baffc' : '#ff8080' }}>
                  {entry.avg_score ? `${entry.avg_score}%` : '—'}
                </div>
                <div className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>avg</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3" style={{ borderTop: '1px solid #1e1e24' }}>
        <Link href="/dashboard/leaderboard"
          className="text-xs flex items-center justify-center gap-1.5 transition-colors"
          style={{ color: 'rgba(244,249,253,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
          <TrendingUp size={11} /> View full leaderboard →
        </Link>
      </div>
    </DashCard>
  )
}
