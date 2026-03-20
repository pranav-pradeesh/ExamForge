'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, FlaskConical, BarChart3, BookOpen,
  CheckSquare, LogOut, Menu, X, Zap, ChevronRight, MessageCircle, Trophy
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',              label: 'Overview',    icon: LayoutDashboard },
  { href: '/dashboard/exam',         label: 'Tests',       icon: FlaskConical },
  { href: '/dashboard/results',      label: 'Results',     icon: BarChart3 },
  { href: '/dashboard/leaderboard',  label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/chat',         label: 'AI Tutor',    icon: MessageCircle },
  { href: '/dashboard/notes',        label: 'Notebook',    icon: BookOpen },
  { href: '/dashboard/checklist',    label: 'Study Plan',  icon: CheckSquare },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ full_name: string; target_exam: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('full_name,target_exam').eq('id', authUser.id).single()
      setUser(profile || { full_name: authUser.email || 'Student', target_exam: 'JEE' })
    }
    getUser()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isExamEngine = pathname.startsWith('/dashboard/exam/') && pathname.split('/').length > 3

  // Exam engine gets no chrome at all
  if (isExamEngine) return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#010101' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className={`
        hidden lg:flex flex-col transition-transform duration-300 flex-shrink-0
      `} style={{ width: '220px', background: '#0a0a0b', borderRight: '1px solid #1e1e24', minHeight: '100vh', position: 'sticky', top: 0 }}>

        {/* Logo */}
        <div className="p-5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #1e1e24' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2baffc' }}>
            <span className="font-mono-display font-bold text-xs" style={{ color: '#010101' }}>EF</span>
          </div>
          <span className="font-mono-display font-bold text-sm" style={{ color: '#f4f9fd' }}>ExamForge</span>
        </div>

        {/* User chip */}
        {user && (
          <div className="px-3 py-3 mx-3 mt-3 rounded-xl" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2baffc, #55c360)', color: '#010101' }}>
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#f4f9fd' }}>{user.full_name}</div>
                <div className="text-xs font-mono-display" style={{ color: '#2baffc' }}>{user.target_exam}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: active ? 'rgba(43,175,252,0.1)' : 'transparent',
                  color: active ? '#2baffc' : 'rgba(244,249,253,0.55)',
                  border: active ? '1px solid rgba(43,175,252,0.2)' : '1px solid transparent',
                }}>
                <Icon size={15} />
                <span className="font-medium">{label}</span>
                {active && <ChevronRight size={11} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: '1px solid #1e1e24' }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: 'rgba(244,249,253,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden" style={{ width: '260px', background: '#0a0a0b', borderRight: '1px solid #1e1e24' }}>
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e24' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2baffc' }}>
                  <span className="font-mono-display font-bold text-xs" style={{ color: '#010101' }}>EF</span>
                </div>
                <span className="font-mono-display font-bold text-sm" style={{ color: '#f4f9fd' }}>ExamForge</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ color: 'rgba(244,249,253,0.5)' }}><X size={18} /></button>
            </div>
            {user && (
              <div className="px-3 py-3 mx-3 mt-3 rounded-xl" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #2baffc, #55c360)', color: '#010101' }}>
                    {user.full_name.charAt(0)}
                  </div>
                  <div><div className="text-sm font-semibold" style={{ color: '#f4f9fd' }}>{user.full_name}</div>
                  <div className="text-xs font-mono-display" style={{ color: '#2baffc' }}>{user.target_exam}</div></div>
                </div>
              </div>
            )}
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm transition-all"
                    style={{ background: active ? 'rgba(43,175,252,0.1)' : 'transparent', color: active ? '#2baffc' : 'rgba(244,249,253,0.6)', border: active ? '1px solid rgba(43,175,252,0.2)' : '1px solid transparent' }}>
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-3" style={{ borderTop: '1px solid #1e1e24' }}>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm" style={{ color: 'rgba(244,249,253,0.4)' }}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-14 flex-shrink-0"
          style={{ background: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e24' }}>
          <button className="lg:hidden p-1 -ml-1" onClick={() => setSidebarOpen(true)} style={{ color: 'rgba(244,249,253,0.6)' }}>
            <Menu size={20} />
          </button>
          {/* Breadcrumb on mobile */}
          <span className="lg:hidden text-sm font-mono-display font-bold" style={{ color: '#f4f9fd' }}>
            {NAV.find(n => n.href === pathname)?.label || 'Dashboard'}
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-xs font-mono-display px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', border: '1px solid rgba(43,175,252,0.2)' }}>
            <Zap size={10} />
            <span className="hidden sm:inline">AI Ready</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden safe-bottom"
        style={{ background: 'rgba(10,10,11,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1e1e24' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0"
                style={{ color: active ? '#2baffc' : 'rgba(244,249,253,0.4)' }}>
                <Icon size={18} />
                <span className="text-xs truncate" style={{ fontSize: '10px' }}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
