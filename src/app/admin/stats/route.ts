import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS entirely
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [
      { count: totalStudents },
      { count: totalQuestions },
      { data: sessions },
      { data: recentProfiles },
      { data: profilesForGrowth },
    ] = await Promise.all([
      adminClient.from('profiles').select('*', { count: 'exact', head: true }),
      adminClient.from('questions').select('*', { count: 'exact', head: true }),
      adminClient.from('test_sessions').select('percentage').eq('status', 'completed'),
      adminClient.from('profiles')
        .select('id, full_name, email, target_exam, created_at, current_streak, total_tests_taken')
        .order('created_at', { ascending: false })
        .limit(50),
      adminClient.from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true }),
    ])

    const avgScore = sessions && sessions.length > 0
      ? Math.round(sessions.reduce((a: number, s: { percentage: number }) => a + s.percentage, 0) / sessions.length)
      : 0

    // Build daily signups for last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
    const dailySignups: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 86400000)
      dailySignups[d.toISOString().slice(0, 10)] = 0
    }
    profilesForGrowth?.forEach((p: { created_at: string }) => {
      const day = p.created_at.slice(0, 10)
      if (dailySignups[day] !== undefined) dailySignups[day]++
    })

    // Exam distribution
    const examDist: Record<string, number> = {}
    recentProfiles?.forEach((p: { target_exam: string }) => {
      examDist[p.target_exam] = (examDist[p.target_exam] || 0) + 1
    })

    return NextResponse.json({
      totalStudents: totalStudents || 0,
      totalQuestions: totalQuestions || 0,
      avgScore,
      recentProfiles: recentProfiles || [],
      dailySignups: Object.entries(dailySignups).map(([date, count]) => ({ date, count })),
      examDist,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
