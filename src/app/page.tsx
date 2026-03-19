'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Zap, Target, BarChart3, Brain, CheckCircle, Clock, BookOpen } from 'lucide-react'
import { ParticleButton } from '@/components/ui/particle-button'
import { GlowCard } from '@/components/ui/spotlight-card'
import { HandWrittenTitle } from '@/components/ui/hand-writing-text'
import { HandWrittenTitle } from '@/components/ui/hand-writing-text'

const EXAMS = [
  {
    code: 'JEE', name: 'JEE Main & Advanced', body: 'NTA — National Testing Agency',
    color: '#2baffc', duration: '3h / 6h', questions: '75 / 114',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    pattern: '+4 / -1', note: 'Gateway to NITs, IIITs & IITs',
  },
  {
    code: 'VITEEE', name: 'VITEEE 2026', body: 'VIT University',
    color: '#55c360', duration: '2.5h', questions: '125',
    subjects: ['Physics', 'Chemistry', 'Maths/Bio', 'English', 'Aptitude'],
    pattern: '+4 / -1', note: 'MPCEA or BPCEA stream',
  },
  {
    code: 'KEAM', name: 'KEAM 2026', body: 'CEE Kerala',
    color: '#f59e0b', duration: '3h', questions: '150',
    subjects: ['Physics (45)', 'Chemistry (30)', 'Mathematics (75)'],
    pattern: '+4 / -1', note: 'Math-heavy — 300 marks for Maths alone',
  },
  {
    code: 'CUSAT', name: 'CUSAT CAT 2026', body: 'Cochin University',
    color: '#a78bfa', duration: '3h', questions: '225',
    subjects: ['Physics (75)', 'Chemistry (60)', 'Mathematics (90)'],
    pattern: '+3 / -1', note: 'Highest Math weightage of all exams',
  },
  {
    code: 'NEET', name: 'NEET 2026', body: 'NTA — Medical',
    color: '#ec4899', duration: '3h 20m', questions: '180',
    subjects: ['Physics (45)', 'Chemistry (45)', 'Biology (90)'],
    pattern: '+4 / -1', note: 'Biology 50% weightage',
  },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen" style={{ background: '#010101' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2baffc' }}>
              <span className="font-mono-display font-bold text-xs" style={{ color: '#010101' }}>EF</span>
            </div>
            <span className="font-mono-display font-bold tracking-tight" style={{ color: '#f4f9fd' }}>ExamForge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm px-4 py-2">Login</Link>
            <Link href="/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(43,175,252,0.07) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Pill badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 text-xs font-mono-display ${mounted ? 'animate-in' : 'opacity-0'}`}
            style={{ background: 'rgba(43,175,252,0.08)', borderColor: 'rgba(43,175,252,0.3)', color: '#2baffc' }}>
            <Zap size={12} />
            JEE · VITEEE · KEAM · CUSAT · NEET — All in one platform
          </div>

          {/* Animated handwritten hero */}
          <HandWrittenTitle
            title="Forge Your Rank."
            subtitle="Authentic CBT mock exams for JEE, VITEEE, KEAM, CUSAT & NEET with real PYQs. AI analysis pinpoints your weak zones after every test."
            subtitleClassName="text-lg"
          />

          {/* CTA buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-in stagger-3' : 'opacity-0'}`}>
            <Link href="/signup">
              <ParticleButton variant="primary" className="px-8 py-4 text-sm" successDuration={1500}>
                Start Free <ArrowRight size={15} />
              </ParticleButton>
            </Link>
            <Link href="/login">
              <ParticleButton variant="ghost" className="px-8 py-4 text-sm" successDuration={1500}>
                Sign In
              </ParticleButton>
            </Link>
          </div>

          {/* Stats bar */}
          <div className={`mt-14 grid grid-cols-3 gap-px rounded-xl overflow-hidden ${mounted ? 'animate-in stagger-4' : 'opacity-0'}`}
            style={{ border: '1px solid #1e1e24', background: '#1e1e24' }}>
            {[{ num: '5', label: 'Exams Covered' }, { num: '10K+', label: 'PYQs Loaded' }, { num: 'Free', label: 'AI Analysis' }].map(s => (
              <div key={s.label} className="py-6 text-center" style={{ background: '#111114' }}>
                <div className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#2baffc' }}>{s.num}</div>
                <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exams section */}
      <section className="py-20 px-6 border-t" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-mono-display font-bold text-3xl mb-3" style={{ color: '#f4f9fd' }}>Exams we cover</h2>
            <p style={{ color: 'rgba(244,249,253,0.5)' }}>Authentic patterns. Real PYQs. Correct marking schemes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAMS.map(exam => {
              const colorKey = exam.color === '#2baffc' ? 'blue' : exam.color === '#55c360' ? 'green' : exam.color === '#f59e0b' ? 'amber' : exam.color === '#a78bfa' ? 'purple' : 'pink'
              return (
                <GlowCard key={exam.code} glowColor={colorKey as 'blue'|'green'|'amber'|'purple'|'pink'} customSize className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono-display text-xs font-bold px-2 py-1 rounded"
                      style={{ background: exam.color + '15', color: exam.color }}>{exam.code}</span>
                    <span className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>{exam.body}</span>
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: '#f4f9fd' }}>{exam.name}</h3>
                  <p className="text-xs mb-3" style={{ color: exam.color }}>{exam.note}</p>
                  <div className="flex gap-3 mb-3 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <span className="flex items-center gap-1"><Clock size={11} />{exam.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} />{exam.questions} Qs</span>
                    <span className="flex items-center gap-1"><Zap size={11} style={{ color: '#f59e0b' }} />{exam.pattern}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {exam.subjects.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,249,253,0.5)' }}>{s}</span>
                    ))}
                  </div>
                </GlowCard>
              )
            })}
            {/* B.Arch card */}
            <GlowCard glowColor="orange" customSize className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono-display text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>B.ARCH</span>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: '#f4f9fd' }}>JEE Main Paper 2A</h3>
              <p className="text-xs mb-3" style={{ color: '#fb923c' }}>Architecture — Math + Aptitude + Drawing</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(244,249,253,0.4)' }}>
                Maths (CBT) + Aptitude 50Q (CBT) + Drawing (pen & paper). Coming soon.
              </p>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-mono-display font-bold text-3xl mb-3" style={{ color: '#f4f9fd' }}>Everything you need to crack it</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Target size={18} />, title: 'Authentic CBT Mode', desc: 'Question palette, timer, flag-for-review — identical to the real NTA/VIT/CEE interface.', color: '#2baffc' },
              { icon: <Brain size={18} />, title: 'AI Post-Exam Review', desc: 'Llama 4 AI analyses every attempt. Personal weakness report + study checklist, instantly.', color: '#55c360' },
              { icon: <BarChart3 size={18} />, title: 'Progress Nebula', desc: 'Your performance visualized. The nebula shifts as your strongest subject evolves.', color: '#2baffc' },
              { icon: <Zap size={18} />, title: 'Custom Test Builder', desc: 'Filter by exam, subject, topic, and difficulty. Random question order every time.', color: '#f59e0b' },
              { icon: <BookOpen size={18} />, title: 'AI Notebook', desc: 'Paste any text → get structured notes, flashcards, key concepts, and practice MCQs.', color: '#55c360' },
              { icon: <CheckCircle size={18} />, title: 'AI Study Chat', desc: 'Your personal JEE & VIT tutor. Ask anything — step-by-step solutions with exam tips.', color: '#2baffc' },
            ].map(f => {
              const colorKey = f.color === '#2baffc' ? 'blue' : f.color === '#55c360' ? 'green' : 'amber'
              return (
                <GlowCard key={f.title} glowColor={colorKey as 'blue'|'green'|'amber'} customSize className="p-6">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: f.color + '15', color: f.color }}>{f.icon}</div>
                  <h3 className="font-semibold mb-2" style={{ color: '#f4f9fd' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,249,253,0.55)' }}>{f.desc}</p>
                </GlowCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Exam comparison table */}
      <section className="py-16 px-6 border-t" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-mono-display font-bold text-2xl mb-8 text-center" style={{ color: '#f4f9fd' }}>Quick Reference — Exam Patterns</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e24' }}>
                  {['Exam', 'Mode', 'Duration', 'Questions', 'Marks', 'Marking'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono-display text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { exam: 'JEE Main', mode: 'CBT', dur: '3h', qs: '75', marks: '300', mark: '+4 / -1' },
                  { exam: 'JEE Advanced', mode: 'CBT', dur: '6h', qs: '114', marks: '360', mark: 'Varies' },
                  { exam: 'VITEEE', mode: 'CBT', dur: '2.5h', qs: '125', marks: '500', mark: '+4 / -1' },
                  { exam: 'KEAM', mode: 'CBT', dur: '3h', qs: '150', marks: '600', mark: '+4 / -1' },
                  { exam: 'CUSAT CAT', mode: 'CBT', dur: '3h', qs: '225', marks: '900', mark: '+3 / -1' },
                  { exam: 'NEET', mode: 'Pen & Paper', dur: '3h 20m', qs: '180', marks: '720', mark: '+4 / -1' },
                ].map((r, i) => (
                  <tr key={r.exam} style={{ borderBottom: '1px solid #1e1e24', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#f4f9fd' }}>{r.exam}</td>
                    <td className="px-4 py-3" style={{ color: 'rgba(244,249,253,0.6)' }}>{r.mode}</td>
                    <td className="px-4 py-3 font-mono-display text-xs" style={{ color: '#2baffc' }}>{r.dur}</td>
                    <td className="px-4 py-3 font-mono-display text-xs" style={{ color: '#55c360' }}>{r.qs}</td>
                    <td className="px-4 py-3 font-mono-display text-xs" style={{ color: '#f59e0b' }}>{r.marks}</td>
                    <td className="px-4 py-3 font-mono-display text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>{r.mark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative rounded-2xl p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(43,175,252,0.1) 0%, rgba(85,195,96,0.05) 100%)', border: '1px solid rgba(43,175,252,0.2)' }}>
            <h2 className="font-mono-display font-bold text-3xl mb-4" style={{ color: '#f4f9fd' }}>Ready to start forging?</h2>
            <p className="mb-8" style={{ color: 'rgba(244,249,253,0.6)' }}>Free account. Take your first mock test in 2 minutes.</p>
            <Link href="/signup" className="inline-block">
              <ParticleButton variant="primary" className="px-8 py-4 text-sm" awaitAnimation successDuration={1500}>
                Create Free Account <ArrowRight size={15} />
              </ParticleButton>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-6" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-mono-display text-sm font-bold" style={{ color: '#2baffc' }}>ExamForge</span>
          <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>© 2026 ExamForge. JEE · VITEEE · KEAM · CUSAT · NEET</span>
        </div>
      </footer>
    </div>
  )
}
