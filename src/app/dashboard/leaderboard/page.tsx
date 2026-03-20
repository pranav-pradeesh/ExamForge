'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DashCard } from '@/components/ui/spotlight-card'
import { Trophy, Flame, Medal, Users, BarChart3, Search } from 'lucide-react'

interface LeaderEntry {
  id: string
  full_name: string
  target_exam: string
  avg_score: number
  best_score: number
  tests_taken: number
  current_streak: number
  longest_streak: number
  overall_rank: number
  exam_rank: number
}

const EXAM_COLORS: Record<string, string> = {
  JEE: '#2baffc', VITEEE: '#55c360', KEAM: '#f59e0b', CUSAT: '#a78bfa', NEET: '#ec4899',
}
const EXAMS = ['All', 'JEE', 'VITEEE', 'KEAM', 'CUSAT', 'NEET']
const RANK_ICONS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderEntry[]>([])
  const [filtered, setFiltered] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [examFilter, setExamFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'avg_score' | 'best_score' | 'tests_taken' | 'current_streak'>('avg_score')
  const [search, setSearch] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [myEntry, setMyEntry] = useState<LeaderEntry | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
    loadAll()
  }, [])

  useEffect(() => {
    let list = [...entries]
    if (examFilter !== 'All') list = list.filter(e => e.target_exam === examFilter)
    if (search) list = list.filter(e => e.full_name.toLowerCase().includes(search.toLowerCase()))
    list.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))
    setFiltered(list)
  }, [entries, examFilter, sortBy, search])

  async function loadAll() {
    setLoading(true)
    const { data } = await supabase.from('leaderboard').select('*').gt('tests_taken', 0).limit(200)
    setEntries((data as LeaderEntry[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    if (currentUserId && entries.length > 0) {
      setMyEntry(entries.find(e => e.id === currentUserId) || null)
    }
  }, [currentUserId, entries])

  const top3 = entries.filter(e => examFilter === 'All' || e.target_exam === examFilter)
    .sort((a, b) => b.avg_score - a.avg_score).slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="animate-in">
        <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>Leaderboard</h1>
        <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>See how you rank against other aspirants</p>
      </div>

      {/* Podium top 3 */}
      {!loading && top3.length >= 3 && (
        <div className="animate-in stagger-1">
          <div className="flex items-end justify-center gap-3 h-36">
            {/* 2nd place */}
            <DashCard glowColor="blue" className="flex-1 max-w-[160px] flex flex-col items-center justify-end pb-4 text-center"
              style={{ height: '108px', border: '1px solid rgba(192,192,192,0.3)' }}>
              <div className="text-2xl mb-1">🥈</div>
              <div className="font-mono-display font-bold text-xl" style={{ color: '#C0C0C0' }}>#{top3[1]?.overall_rank}</div>
              <div className="text-xs truncate w-full px-2" style={{ color: 'rgba(244,249,253,0.7)' }}>{top3[1]?.full_name.split(' ')[0]}</div>
              <div className="text-xs font-mono-display font-bold" style={{ color: '#C0C0C0' }}>{top3[1]?.avg_score}%</div>
            </DashCard>
            {/* 1st place */}
            <DashCard glowColor="amber" className="flex-1 max-w-[180px] flex flex-col items-center justify-end pb-4 text-center"
              style={{ height: '140px', border: '1px solid rgba(245,158,11,0.4)' }}>
              <div className="text-3xl mb-1">👑</div>
              <div className="font-mono-display font-bold text-2xl" style={{ color: '#f59e0b' }}>#1</div>
              <div className="text-sm font-semibold truncate w-full px-2" style={{ color: '#f4f9fd' }}>{top3[0]?.full_name.split(' ')[0]}</div>
              <div className="text-xs font-mono-display font-bold" style={{ color: '#f59e0b' }}>{top3[0]?.avg_score}%</div>
            </DashCard>
            {/* 3rd place */}
            <DashCard glowColor="orange" className="flex-1 max-w-[160px] flex flex-col items-center justify-end pb-4 text-center"
              style={{ height: '90px', border: '1px solid rgba(205,127,50,0.3)' }}>
              <div className="text-2xl mb-1">🥉</div>
              <div className="font-mono-display font-bold text-xl" style={{ color: '#CD7F32' }}>#{top3[2]?.overall_rank}</div>
              <div className="text-xs truncate w-full px-2" style={{ color: 'rgba(244,249,253,0.7)' }}>{top3[2]?.full_name.split(' ')[0]}</div>
              <div className="text-xs font-mono-display font-bold" style={{ color: '#CD7F32' }}>{top3[2]?.avg_score}%</div>
            </DashCard>
          </div>
        </div>
      )}

      {/* My rank card */}
      {myEntry && (
        <DashCard glowColor="blue" className="animate-in stagger-2"
          style={{ border: '1px solid rgba(43,175,252,0.3)', padding: '16px 20px' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2baffc, #55c360)', color: '#010101' }}>
              {myEntry.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: '#f4f9fd' }}>{myEntry.full_name} <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(43,175,252,0.15)', color: '#2baffc' }}>you</span></div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(244,249,253,0.4)' }}>{myEntry.tests_taken} tests · {myEntry.current_streak} day streak</div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="font-mono-display font-bold text-lg" style={{ color: '#2baffc' }}>#{myEntry.overall_rank}</div>
                <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>overall</div>
              </div>
              <div className="text-center">
                <div className="font-mono-display font-bold text-lg" style={{ color: EXAM_COLORS[myEntry.target_exam] || '#2baffc' }}>#{myEntry.exam_rank}</div>
                <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{myEntry.target_exam}</div>
              </div>
              <div className="text-center">
                <div className="font-mono-display font-bold text-lg" style={{ color: '#55c360' }}>{myEntry.avg_score}%</div>
                <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>avg</div>
              </div>
            </div>
          </div>
        </DashCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 animate-in stagger-3">
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
          {EXAMS.map(ex => (
            <button key={ex} onClick={() => setExamFilter(ex)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
              style={{
                background: examFilter === ex ? (EXAM_COLORS[ex] || '#2baffc') : 'transparent',
                color: examFilter === ex ? '#010101' : 'rgba(244,249,253,0.5)',
              }}>{ex}</button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
          {([['avg_score','Avg %'],['best_score','Best'],['tests_taken','Tests'],['current_streak','Streak']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)}
              className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: sortBy === val ? '#1e1e24' : 'transparent', color: sortBy === val ? '#f4f9fd' : 'rgba(244,249,253,0.4)' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(244,249,253,0.3)' }} />
          <input className="input-field pl-8 py-2 text-sm" placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Full table */}
      <DashCard glowColor="blue" className="animate-in stagger-4" style={{ padding: 0 }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e24' }}>
          <div className="flex items-center gap-2">
            <Users size={13} style={{ color: 'rgba(244,249,253,0.4)' }} />
            <span className="text-xs font-mono-display" style={{ color: 'rgba(244,249,253,0.5)' }}>
              {filtered.length} STUDENTS
            </span>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={32} className="mx-auto mb-3" style={{ color: 'rgba(244,249,253,0.1)' }} />
            <p className="text-sm" style={{ color: 'rgba(244,249,253,0.4)' }}>No students found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1e1e24' }}>
            {filtered.map((entry, idx) => {
              const isMe = entry.id === currentUserId
              const eColor = EXAM_COLORS[entry.target_exam] || '#2baffc'
              const rank = idx + 1
              return (
                <div key={entry.id}
                  className="flex items-center gap-3 px-5 py-3 transition-all hover:bg-[#0a0a0b]"
                  style={{ background: isMe ? 'rgba(43,175,252,0.04)' : 'transparent', borderLeft: isMe ? '2px solid #2baffc' : '2px solid transparent' }}>
                  <div className="w-8 text-center flex-shrink-0">
                    {rank <= 3
                      ? <span className="text-lg">{RANK_ICONS[rank - 1]}</span>
                      : <span className="font-mono-display text-sm font-bold" style={{ color: 'rgba(244,249,253,0.35)' }}>#{rank}</span>
                    }
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: eColor + '20', color: eColor, border: `1px solid ${eColor}30` }}>
                    {entry.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium flex items-center gap-1.5 flex-wrap" style={{ color: '#f4f9fd' }}>
                      <span className="truncate">{entry.full_name}</span>
                      {isMe && <span className="text-xs px-1.5 py-0 rounded" style={{ background: 'rgba(43,175,252,0.15)', color: '#2baffc' }}>you</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-1.5 py-0 rounded" style={{ background: eColor + '15', color: eColor }}>{entry.target_exam}</span>
                      <span className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>{entry.tests_taken} tests</span>
                    </div>
                  </div>
                  {entry.current_streak > 0 && (
                    <div className="text-center hidden sm:block flex-shrink-0">
                      <div className="font-mono-display font-bold text-sm flex items-center gap-1" style={{ color: '#f59e0b' }}>
                        <Flame size={12} />{entry.current_streak}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>streak</div>
                    </div>
                  )}
                  <div className="text-center flex-shrink-0 hidden sm:block">
                    <div className="font-mono-display font-bold text-sm" style={{ color: '#a78bfa' }}>{entry.best_score || 0}%</div>
                    <div className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>best</div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="font-mono-display font-bold text-sm"
                      style={{ color: (entry.avg_score||0) >= 70 ? '#55c360' : (entry.avg_score||0) >= 40 ? '#2baffc' : '#ff8080' }}>
                      {entry.avg_score ? `${entry.avg_score}%` : '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>avg</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DashCard>
    </div>
  )
}
