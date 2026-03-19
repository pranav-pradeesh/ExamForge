'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react'
import { ParticleButton } from '@/components/ui/particle-button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  async function handleParticleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#010101' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(43,175,252,0.07) 0%, transparent 60%)' }} />

      <div className="w-full max-w-md relative">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm transition-colors"
          style={{ color: 'rgba(244,249,253,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.5)')}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="card animate-in" style={{ borderColor: '#1e1e24' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2baffc' }}>
              <span className="font-mono-display font-bold text-sm" style={{ color: '#010101' }}>EF</span>
            </div>
            <div>
              <div className="font-mono-display font-bold" style={{ color: '#f4f9fd' }}>ExamForge</div>
              <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>Welcome back</div>
            </div>
          </div>

          <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>Sign in</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(244,249,253,0.5)' }}>
            Continue your exam preparation
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>EMAIL</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>PASSWORD</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(244,249,253,0.4)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <ParticleButton
              variant="primary"
              loading={loading}
              disabled={!email || !password}
              className="w-full py-3 text-sm"
              onClick={e => { e.preventDefault(); handleParticleLogin() }}
              successDuration={600}
            >
              <Zap size={14} />
              Sign In
            </ParticleButton>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm"
            style={{ borderColor: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#2baffc' }}>Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
