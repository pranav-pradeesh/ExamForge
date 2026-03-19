'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', targetExam: 'JEE' as 'JEE' | 'VIT' | 'BOTH' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, target_exam: form.targetExam } },
    })

    if (signupError) { setError(signupError.message); setLoading(false); return }

    if (data.user) {
      // Profile is auto-created by DB trigger, but upsert as backup
      await supabase.from('profiles').upsert({
        id: data.user.id, email: form.email, full_name: form.fullName, target_exam: form.targetExam,
      }, { onConflict: 'id' })
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#010101' }}>
        <div className="text-center animate-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(85,195,96,0.15)', color: '#55c360' }}>
            <CheckCircle size={32} />
          </div>
          <h2 className="font-mono-display font-bold text-xl mb-2" style={{ color: '#f4f9fd' }}>Account created!</h2>
          <p style={{ color: 'rgba(244,249,253,0.5)' }}>Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#010101' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(85,195,96,0.05) 0%, transparent 60%)' }} />
      <div className="w-full max-w-md relative">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm transition-colors" style={{ color: 'rgba(244,249,253,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.5)')}>
          <ArrowLeft size={14} /> Back to home
        </Link>
        <div className="card animate-in" style={{ borderColor: '#1e1e24' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#55c360' }}>
              <span className="font-mono-display font-bold text-sm" style={{ color: '#010101' }}>EF</span>
            </div>
            <div>
              <div className="font-mono-display font-bold" style={{ color: '#f4f9fd' }}>ExamForge</div>
              <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>Create your account</div>
            </div>
          </div>
          <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>Get started</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(244,249,253,0.5)' }}>Free account. No credit card required.</p>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>{error}</div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>FULL NAME</label>
              <input className="input-field" placeholder="Rahul Kumar" value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>EMAIL</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>PASSWORD</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-12" placeholder="Min. 8 characters"
                  value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(244,249,253,0.4)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>TARGET EXAM</label>
              <div className="grid grid-cols-3 gap-2">
                {(['JEE', 'VIT', 'BOTH'] as const).map(ex => (
                  <button key={ex} type="button" onClick={() => update('targetExam', ex)}
                    className="py-3 rounded-lg font-mono-display text-xs font-bold transition-all"
                    style={{
                      background: form.targetExam === ex ? (ex === 'VIT' ? '#55c360' : '#2baffc') : '#1e1e24',
                      color: form.targetExam === ex ? '#010101' : 'rgba(244,249,253,0.6)',
                      border: `1px solid ${form.targetExam === ex ? 'transparent' : '#2a2a32'}`,
                    }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-emerald w-full flex items-center justify-center gap-2 mt-2" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t text-center text-sm" style={{ borderColor: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>
            Already have an account? <Link href="/login" style={{ color: '#2baffc' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
