'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Info } from 'lucide-react'
import { ParticleButton } from '@/components/ui/particle-button'

const EXAMS = [
  { id: 'JEE', label: 'JEE Main / Advanced', desc: 'NITs, IIITs, IITs', color: '#2baffc', subjects: 'PCM' },
  { id: 'VITEEE', label: 'VITEEE', desc: 'VIT University', color: '#55c360', subjects: 'MPCEA / BPCEA' },
  { id: 'KEAM', label: 'KEAM', desc: 'Kerala Engineering', color: '#f59e0b', subjects: 'PCM' },
  { id: 'CUSAT', label: 'CUSAT CAT', desc: 'Cochin University', color: '#a78bfa', subjects: 'PCM' },
  { id: 'NEET', label: 'NEET', desc: 'Medical — MBBS/BDS', color: '#ec4899', subjects: 'PCB' },
  { id: 'MULTIPLE', label: 'Multiple Exams', desc: 'Preparing for 2+', color: '#fb923c', subjects: 'Mixed' },
]

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    targetExam: 'JEE',
    vitStream: 'MPCEA', // for VITEEE
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSignupClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.fullName, target_exam: form.targetExam, vit_stream: form.vitStream } },
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, email: form.email, full_name: form.fullName,
        target_exam: form.targetExam,
      }, { onConflict: 'id' })
    }
    setSuccess(true)
    // loading stays true — onSuccess fires after animation and navigates
  }

  function handleSignupSuccess() {
    router.push('/dashboard')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.fullName, target_exam: form.targetExam, vit_stream: form.vitStream } },
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, email: form.email, full_name: form.fullName,
        target_exam: form.targetExam,
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
          <p style={{ color: 'rgba(244,249,253,0.5)' }}>Redirecting to your dashboard…</p>
        </div>
      </div>
    )
  }

  const selectedExam = EXAMS.find(e => e.id === form.targetExam)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#010101' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(85,195,96,0.05) 0%, transparent 60%)' }} />
      <div className="w-full max-w-lg relative">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm transition-colors" style={{ color: 'rgba(244,249,253,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.5)')}>
          <ArrowLeft size={14} /> Back to home
        </Link>
        <div className="card animate-in" style={{ borderColor: '#1e1e24' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#55c360' }}>
              <span className="font-mono-display font-bold text-sm" style={{ color: '#010101' }}>EF</span>
            </div>
            <div>
              <div className="font-mono-display font-bold" style={{ color: '#f4f9fd' }}>ExamForge</div>
              <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>Create your account</div>
            </div>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>{error}</div>}

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

            {/* Target exam selector */}
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>TARGET EXAM</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {EXAMS.map(ex => (
                  <button key={ex.id} type="button" onClick={() => update('targetExam', ex.id)}
                    className="flex flex-col items-start p-3 rounded-xl text-left transition-all"
                    style={{
                      background: form.targetExam === ex.id ? ex.color + '15' : '#0a0a0b',
                      border: `1px solid ${form.targetExam === ex.id ? ex.color + '50' : '#1e1e24'}`,
                    }}>
                    <span className="font-mono-display text-xs font-bold" style={{ color: form.targetExam === ex.id ? ex.color : '#f4f9fd' }}>{ex.label}</span>
                    <span className="text-xs mt-0.5" style={{ color: 'rgba(244,249,253,0.4)' }}>{ex.desc}</span>
                    <span className="text-xs mt-1 px-1.5 py-0.5 rounded" style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.35)' }}>{ex.subjects}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* VITEEE stream selector */}
            {form.targetExam === 'VITEEE' && (
              <div>
                <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>
                  VITEEE STREAM
                  <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(85,195,96,0.1)', color: '#55c360' }}>required</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'MPCEA', label: 'MPCEA', desc: 'Maths · Physics · Chemistry · English · Aptitude', note: 'For B.Tech Engineering' },
                    { id: 'BPCEA', label: 'BPCEA', desc: 'Biology · Physics · Chemistry · English · Aptitude', note: 'For Bio-Tech / Bio-Engineering' },
                  ].map(s => (
                    <button key={s.id} type="button" onClick={() => update('vitStream', s.id)}
                      className="flex flex-col items-start p-3 rounded-xl text-left transition-all"
                      style={{
                        background: form.vitStream === s.id ? 'rgba(85,195,96,0.1)' : '#0a0a0b',
                        border: `1px solid ${form.vitStream === s.id ? 'rgba(85,195,96,0.4)' : '#1e1e24'}`,
                      }}>
                      <span className="font-mono-display text-sm font-bold" style={{ color: form.vitStream === s.id ? '#55c360' : '#f4f9fd' }}>{s.label}</span>
                      <span className="text-xs mt-1" style={{ color: 'rgba(244,249,253,0.4)' }}>{s.note}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  MPCEA: Math 40Q, PCM 35Q each, English 5Q, Aptitude 10Q · BPCEA: Bio replaces Math
                </div>
              </div>
            )}

            {/* Show exam pattern summary */}
            {selectedExam && (
              <div className="px-3 py-2.5 rounded-xl text-xs" style={{ background: '#0a0a0b', border: '1px solid #1e1e24' }}>
                <span className="font-mono-display font-bold" style={{ color: selectedExam.color }}>{selectedExam.label} </span>
                <span style={{ color: 'rgba(244,249,253,0.5)' }}>· {selectedExam.subjects} · We&apos;ll personalise your mock tests and AI analysis for this exam.</span>
              </div>
            )}

            <ParticleButton
              variant="emerald"
              loading={loading}
              disabled={!form.fullName || !form.email || !form.password}
              className="w-full py-3 text-sm"
              successDuration={2000}
              onClick={handleSignupClick}
              onSuccess={handleSignupSuccess}
            >
              Create Account — Free
            </ParticleButton>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm" style={{ borderColor: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>
            Already have an account? <Link href="/login" style={{ color: '#2baffc' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
