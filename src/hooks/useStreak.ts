'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface StreakData {
  current: number
  longest: number
  lastActivity: string | null
  isOnFireToday: boolean   // already active today
  justExtended: boolean    // streak went up this session
}

export function useStreak(userId: string | null) {
  const [streak, setStreak] = useState<StreakData>({
    current: 0, longest: 0, lastActivity: null,
    isOnFireToday: false, justExtended: false,
  })

  const refresh = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('id', userId)
      .single()
    if (!data) return
    const today = new Date().toISOString().slice(0, 10)
    setStreak({
      current: data.current_streak || 0,
      longest: data.longest_streak || 0,
      lastActivity: data.last_activity_date,
      isOnFireToday: data.last_activity_date === today,
      justExtended: false,
    })
  }, [userId])

  // Call this whenever the user does something (login, test complete, chat)
  const recordActivity = useCallback(async () => {
    if (!userId) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('id', userId)
      .single()
    if (!profile) return

    const today = new Date().toISOString().slice(0, 10)
    const last = profile.last_activity_date
    if (last === today) {
      // Already recorded today
      setStreak(s => ({ ...s, isOnFireToday: true, justExtended: false }))
      return
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const newStreak = last === yesterday ? (profile.current_streak || 0) + 1 : 1
    const newLongest = Math.max(newStreak, profile.longest_streak || 0)

    await supabase.from('profiles').update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
      streak_updated_at: new Date().toISOString(),
    }).eq('id', userId)

    setStreak({
      current: newStreak,
      longest: newLongest,
      lastActivity: today,
      isOnFireToday: true,
      justExtended: true,
    })
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  return { streak, recordActivity, refresh }
}
