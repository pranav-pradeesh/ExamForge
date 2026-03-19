export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function scoreColor(pct: number): string {
  if (pct >= 70) return '#55c360'
  if (pct >= 40) return '#2baffc'
  return '#ff6b6b'
}

export function difficultyColor(d: string): string {
  if (d === 'easy') return '#55c360'
  if (d === 'medium') return '#2baffc'
  return '#ff6b6b'
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getNebulaGradient(physPct: number, chemPct: number, mathPct: number): string {
  // Strongest subject determines dominant color
  const max = Math.max(physPct, chemPct, mathPct)
  if (max === physPct) {
    return 'conic-gradient(from 180deg at 50% 50%, #2baffc 0deg, #55c360 180deg, #010101 360deg)'
  }
  if (max === chemPct) {
    return 'conic-gradient(from 180deg at 50% 50%, #55c360 0deg, #2baffc 180deg, #010101 360deg)'
  }
  return 'conic-gradient(from 180deg at 50% 50%, #f59e0b 0deg, #2baffc 180deg, #010101 360deg)'
}
