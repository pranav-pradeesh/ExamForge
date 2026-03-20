'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getNebulaGradient, scoreColor, formatTime } from '@/lib/utils'
import { BarChart3, Zap, Target, TrendingUp, Play, Clock, ChevronRight, Award } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { DashCard } from '@/components/ui/spotlight-card'

interface Stats {
  totalTests: number; avgScore: number; bestScore: number
  physicsAvg: number; chemAvg: number; mathsAvg: number
  recentSessions: {
    id: string; exam_type: string; total_score: number; max_score: number
    percentage: number; correct_count: number; wrong_count: number
    time_taken_seconds: number; started_at: string
    physics_score: number; chemistry_score: number; maths_score: number
  }[]
  weakTopics: string[]
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<{ full_name: string; target_exam: string } | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: profileData }, { data: sessions }] = await Promise.all([
        supabase.from('profiles').select('full_name,target_exam').eq('id', user.id).single(),
        supabase.from('test_sessions').select('*').eq('user_id', user.id).eq('status', 'completed').order('started_at', { ascending: false }).limit(10),
      ])
      setProfile(profileData)
      if (sessions && sessions.length > 0) {
        const total = sessions.length
        const avgScore = sessions.reduce((a: number, s: { percentage: number }) => a + s.percentage, 0) / total
        const bestScore = Math.max(...sessions.map((s: { percentage: number }) => s.percentage))
        const physAvg = sessions.reduce((a: number, s: { physics_score: number }) => a + (s.physics_score || 0), 0) / total
        const chemAvg = sessions.reduce((a: number, s: { chemistry_score: number }) => a + (s.chemistry_score || 0), 0) / total
        const mathsAvg = sessions.reduce((a: number, s: { maths_score: number }) => a + (s.maths_score || 0), 0) / total
        const weakTopics: string[] = []
        sessions.forEach((s: { ai_weak_topics?: string[] }) => { if (s.ai_weak_topics) weakTopics.push(...s.ai_weak_topics) })
        setStats({
          totalTests: total, avgScore: Math.round(avgScore * 10) / 10,
          bestScore: Math.round(bestScore * 10) / 10,
          physicsAvg: Math.round(physAvg), chemAvg: Math.round(chemAvg), mathsAvg: Math.round(mathsAvg),
          recentSessions: sessions.slice(0, 5),
          weakTopics: [...new Set(weakTopics)].slice(0, 6),
        })
      } else {
        setStats({ totalTests: 0, avgScore: 0, bestScore: 0, physicsAvg: 0, chemAvg: 0, mathsAvg: 0, recentSessions: [], weakTopics: [] })
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
    </div>
  )

  const totalPct = stats ? stats.physicsAvg + stats.chemAvg + stats.mathsAvg : 0
  const physPct = totalPct > 0 ? (stats!.physicsAvg / totalPct) * 100 : 33
  const chemPct = totalPct > 0 ? (stats!.chemAvg / totalPct) * 100 : 33
  const mathPct = totalPct > 0 ? (stats!.mathsAvg / totalPct) * 100 : 33
  const radarData = [
    { subject: 'Physics', score: stats?.physicsAvg || 0, fullMark: 100 },
    { subject: 'Chemistry', score: stats?.chemAvg || 0, fullMark: 100 },
    { subject: 'Mathematics', score: stats?.mathsAvg || 0, fullMark: 100 },
  ]
  const hasData = stats && stats.totalTests > 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="animate-in">
        <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>
          Hey, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>
          {hasData ? `${stats.totalTests} tests completed — keep forging.` : 'Take your first mock test to start tracking.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in stagger-1">
        {[
          { label: 'Tests Taken', value: stats?.totalTests || 0, icon: <Target size={16} />, color: '#2baffc' },
          { label: 'Avg Score', value: `${stats?.avgScore || 0}%`, icon: <BarChart3 size={16} />, color: '#55c360' },
          { label: 'Best Score', value: `${stats?.bestScore || 0}%`, icon: <Award size={16} />, color: '#f59e0b' },
          { label: 'Streak', value: '—', icon: <TrendingUp size={16} />, color: '#2baffc' },
        ].map(s => (
          <DashCard key={s.label} glowColor={s.color === '#55c360' ? 'green' : s.color === '#f59e0b' ? 'amber' : 'blue'}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.color + '15', color: s.color }}>{s.icon}</div>
            </div>
            <div className="font-mono-display font-bold text-2xl" style={{ color: '#f4f9fd' }}>{s.value}</div>
          </DashCard>
        ))}
      </div>

      {/* Progress Nebula + Radar */}
      <div className="grid lg:grid-cols-5 gap-5 animate-in stagger-2">
        <DashCard glowColor="blue" className="lg:col-span-2 relative overflow-hidden" style={{ padding: '24px' }}>
          <div className="absolute inset-0 pointer-events-none opacity-20 rounded-xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: getNebulaGradient(physPct, chemPct, mathPct), filter: 'blur(28px)', animation: 'nebula 8s ease-in-out infinite' }} />
          </div>
          <div className="relative">
            <div className="text-xs font-mono-display mb-4 flex items-center gap-2" style={{ color: 'rgba(244,249,253,0.5)' }}>
              <Zap size={12} style={{ color: '#2baffc' }} /> PROGRESS NEBULA
            </div>
            <div className="space-y-4">
              {[
                { label: 'Physics', val: stats?.physicsAvg || 0, max: 120, color: '#2baffc' },
                { label: 'Chemistry', val: stats?.chemAvg || 0, max: 120, color: '#55c360' },
                { label: 'Mathematics', val: stats?.mathsAvg || 0, max: 120, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'rgba(244,249,253,0.7)' }}>{s.label}</span>
                    <span className="font-mono-display font-bold" style={{ color: s.color }}>{s.val}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e24' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (s.val / s.max) * 100)}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashCard>

        <DashCard glowColor="blue" className="lg:col-span-3" style={{ padding: '24px' }}>
          <div className="text-xs font-mono-display mb-4" style={{ color: 'rgba(244,249,253,0.5)' }}>SUBJECT RADAR</div>
          {hasData ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e1e24" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(244,249,253,0.5)', fontSize: 12 }} />
                <Radar name="Score" dataKey="score" stroke="#2baffc" fill="#2baffc" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 8 }} labelStyle={{ color: '#f4f9fd', fontSize: 12 }} itemStyle={{ color: '#2baffc', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm mb-3" style={{ color: 'rgba(244,249,253,0.35)' }}>No data yet</p>
                <Link href="/dashboard/exam" className="btn-primary text-xs py-2 px-4">Start a Test</Link>
              </div>
            </div>
          )}
        </DashCard>
      </div>

      {/* Quick actions + Recent tests */}
      <div className="grid lg:grid-cols-3 gap-5 animate-in stagger-3">
        <DashCard glowColor="green" style={{ padding: '24px' }}>
          <div className="text-xs font-mono-display mb-3" style={{ color: 'rgba(244,249,253,0.5)' }}>QUICK START</div>
          <div className="space-y-2">
            {[
              { label: 'JEE Full Mock', sub: '75 questions · 3h', color: '#2baffc', href: '/dashboard/exam?type=JEE' },
              { label: 'VITEEE Mock', sub: '125 questions · 2.5h', color: '#55c360', href: '/dashboard/exam?type=VITEEE' },
              { label: 'Custom Test', sub: 'Pick topic & difficulty', color: '#f59e0b', href: '/dashboard/exam' },
            ].map(q => (
              <Link key={q.label} href={q.href}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: '#0a0a0b', border: '1px solid #1e1e24' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = q.color + '50')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: q.color + '15', color: q.color }}>
                  <Play size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: '#f4f9fd' }}>{q.label}</div>
                  <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{q.sub}</div>
                </div>
                <ChevronRight size={14} style={{ color: 'rgba(244,249,253,0.3)' }} />
              </Link>
            ))}
          </div>
        </DashCard>

        <DashCard glowColor="blue" className="lg:col-span-2" style={{ padding: '24px' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono-display" style={{ color: 'rgba(244,249,253,0.5)' }}>RECENT TESTS</div>
            <Link href="/dashboard/results" className="text-xs" style={{ color: '#2baffc' }}>View all →</Link>
          </div>
          {hasData ? (
            <div className="space-y-3">
              {stats.recentSessions.map(s => {
                const pct = Math.round(s.percentage)
                const date = new Date(s.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                return (
                  <Link key={s.id} href={`/dashboard/results/${s.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all"
                    style={{ background: '#0a0a0b', border: '1px solid #1e1e24' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2baffc30')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono-display font-bold text-sm flex-shrink-0"
                      style={{ background: scoreColor(pct) + '15', color: scoreColor(pct) }}>{pct}%</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: '#f4f9fd' }}>{s.exam_type} Mock Test</div>
                      <div className="text-xs flex items-center gap-3 mt-0.5">
                        <span style={{ color: '#55c360' }}>✓ {s.correct_count}</span>
                        <span style={{ color: '#ff6b6b' }}>✗ {s.wrong_count}</span>
                        <span className="flex items-center gap-1" style={{ color: 'rgba(244,249,253,0.4)' }}><Clock size={10} />{formatTime(s.time_taken_seconds || 0)}</span>
                      </div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: 'rgba(244,249,253,0.35)' }}>{date}</div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm mb-3" style={{ color: 'rgba(244,249,253,0.35)' }}>No tests yet</p>
                <Link href="/dashboard/exam" className="btn-primary text-xs py-2 px-4 flex items-center gap-2 mx-auto w-fit"><Play size={12} /> Take First Test</Link>
              </div>
            </div>
          )}
        </DashCard>
      </div>

      {stats && stats.weakTopics.length > 0 && (
        <DashCard glowColor="orange" className="animate-in stagger-4" style={{ padding: '24px' }}>
          <div className="text-xs font-mono-display mb-4" style={{ color: 'rgba(244,249,253,0.5)' }}>AI-IDENTIFIED WEAK ZONES</div>
          <div className="flex flex-wrap gap-2">
            {stats.weakTopics.map(t => (
              <span key={t} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff8080' }}>{t}</span>
            ))}
          </div>
        </DashCard>
      )}
    </div>
  )
}
