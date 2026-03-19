'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, FlaskConical, BarChart3, BookOpen,
  CheckSquare, LogOut, Menu, X, Zap, ChevronRight, MessageCircle
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/exam', label: 'Mock Tests', icon: FlaskConical },
  { href: '/dashboard/results', label: 'My Results', icon: BarChart3 },
  { href: '/dashboard/chat', label: 'AI Tutor', icon: MessageCircle },
  { href: '/dashboard/notes', label: 'Notebook', icon: BookOpen },
  { href: '/dashboard/checklist', label: 'Study Plan', icon: CheckSquare },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ full_name: string; target_exam: string; email: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('full_name,target_exam,email').eq('id', authUser.id).single()
      setUser(profile || { full_name: authUser.email || 'Student', target_exam: 'JEE', email: authUser.email || '' })
    }
    getUser()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#010101' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
        style={{ width: '240px', background: '#0a0a0b', borderRight: '1px solid #1e1e24' }}>

        {/* Logo */}
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e24' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2baffc' }}>
              <span className="font-mono-display font-bold text-xs" style={{ color: '#010101' }}>EF</span>
            </div>
            <span className="font-mono-display font-bold text-sm" style={{ color: '#f4f9fd' }}>ExamForge</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} style={{ color: 'rgba(244,249,253,0.5)' }}>
            <X size={18} />
          </button>
        </div>

        {/* User */}
        {user && (
          <div className="px-4 py-4 mx-3 mt-4 rounded-xl" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
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
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group"
                style={{
                  background: active ? 'rgba(43,175,252,0.1)' : 'transparent',
                  color: active ? '#2baffc' : 'rgba(244,249,253,0.55)',
                  border: active ? '1px solid rgba(43,175,252,0.2)' : '1px solid transparent',
                }}>
                <Icon size={16} />
                <span className="font-medium">{label}</span>
                {active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: '1px solid #1e1e24' }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={{ color: 'rgba(244,249,253,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-6 h-14"
          style={{ background: 'rgba(10,10,11,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e24' }}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} style={{ color: 'rgba(244,249,253,0.6)' }}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs font-mono-display px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', border: '1px solid rgba(43,175,252,0.2)' }}>
            <Zap size={10} />
            AI Ready
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
