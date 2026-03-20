'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Zap, Target, BarChart3, Brain, CheckCircle, Clock, BookOpen } from 'lucide-react'
import { ParticleButton } from '@/components/ui/particle-button'
import { GlowCard } from '@/components/ui/spotlight-card'
import { HandWrittenTitle } from '@/components/ui/hand-writing-text'
import { GridBackground } from '@/components/ui/glowing-card'

const EXAMS = [
  { code: 'JEE',    name: 'JEE Main & Advanced', body: 'NTA',           color: '#2baffc', duration: '3h / 6h', questions: '75 / 114', subjects: ['Physics','Chemistry','Mathematics'],            pattern: '+4 / -1', note: 'NITs, IIITs & IITs' },
  { code: 'VITEEE', name: 'VITEEE 2026',          body: 'VIT University',color: '#55c360', duration: '2.5h',    questions: '125',       subjects: ['Physics','Chemistry','Maths/Bio','Aptitude'],   pattern: '+4 / -1', note: 'MPCEA or BPCEA stream' },
  { code: 'KEAM',   name: 'KEAM 2026',            body: 'CEE Kerala',   color: '#f59e0b', duration: '3h',      questions: '150',       subjects: ['Physics (45)','Chemistry (30)','Maths (75)'],    pattern: '+4 / -1', note: 'Math = 300 / 600 marks' },
  { code: 'CUSAT',  name: 'CUSAT CAT 2026',       body: 'Cochin Univ',  color: '#a78bfa', duration: '3h',      questions: '225',       subjects: ['Physics (75)','Chemistry (60)','Maths (90)'],    pattern: '+3 / -1', note: 'Highest Math weightage' },
  { code: 'NEET',   name: 'NEET 2026',            body: 'NTA Medical',  color: '#ec4899', duration: '3h 20m',  questions: '180',       subjects: ['Physics (45)','Chemistry (45)','Biology (90)'], pattern: '+4 / -1', note: 'Biology = 50% weightage' },
  { code: 'B.ARCH', name: 'JEE Main Paper 2A',    body: '',             color: '#fb923c', duration: '',        questions: '',          subjects: [],                                                 pattern: '',        note: 'Math + Aptitude + Drawing', barch: true },
] as const

const FEATURES = [
  { icon: <Target size={18} />,      title: 'Authentic CBT Mode',  desc: 'Question palette, timer, flag-for-review — identical to the real NTA/VIT/CEE interface.', color: '#2baffc' },
  { icon: <Brain size={18} />,       title: 'AI Post-Exam Review', desc: 'Llama 4 AI analyses every attempt. Personal weakness report + study checklist instantly.',  color: '#55c360' },
  { icon: <BarChart3 size={18} />,   title: 'Progress Nebula',     desc: 'Your performance visualized. The nebula shifts as your strongest subject evolves.',        color: '#2baffc' },
  { icon: <Zap size={18} />,         title: 'Custom Test Builder', desc: 'Filter by exam, subject, topic, and difficulty. Questions shuffled randomly every time.',   color: '#f59e0b' },
  { icon: <BookOpen size={18} />,    title: 'AI Notebook',         desc: 'Paste any text → get structured notes, flashcards, key concepts, and practice MCQs.',      color: '#55c360' },
  { icon: <CheckCircle size={18} />, title: 'AI Study Chat',       desc: 'Your personal JEE & VIT tutor. Ask anything — step-by-step solutions with exam tips.',      color: '#2baffc' },
]

function colorKey(hex: string): 'blue'|'green'|'amber'|'purple'|'pink'|'orange' {
  if (hex === '#2baffc') return 'blue'
  if (hex === '#55c360') return 'green'
  if (hex === '#f59e0b') return 'amber'
  if (hex === '#a78bfa') return 'purple'
  if (hex === '#ec4899') return 'pink'
  return 'orange'
}

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function navAfterAnim(href: string) {
    return () => setTimeout(() => router.push(href), 1800)
  }

  return (
    <div className="min-h-screen" style={{ background: '#010101' }}>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid #1e1e24' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2baffc' }}>
              <span className="font-mono-display font-bold text-xs" style={{ color: '#010101' }}>EF</span>
            </div>
            <span className="font-mono-display font-bold" style={{ color: '#f4f9fd' }}>ExamForge</span>
          </div>
          <div className="flex items-center gap-2">
            <ParticleButton variant="ghost"   className="px-3 sm:px-4 py-2 text-xs" successDuration={1800} onSuccess={navAfterAnim('/login')}>Login</ParticleButton>
            <ParticleButton variant="primary" className="px-3 sm:px-4 py-2 text-xs" successDuration={1800} onSuccess={navAfterAnim('/signup')}>Start Free</ParticleButton>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(700px,90vw)] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(43,175,252,0.1) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">

          {/* Pill badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-2 text-xs font-mono-display transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{ background: 'rgba(43,175,252,0.08)', borderColor: 'rgba(43,175,252,0.3)', color: '#2baffc' }}>
            <Zap size={11} />
            <span className="hidden sm:inline">JEE · VITEEE · KEAM · CUSAT · NEET</span>
            <span className="sm:hidden">5 Exams Covered</span>
          </div>

          {/* HandWritten animated title */}
          <HandWrittenTitle
            title="Forge Your Rank."
            subtitle="Authentic CBT mock exams for JEE, VITEEE, KEAM, CUSAT & NEET with real PYQs. AI analysis pinpoints your weak zones after every test."
            titleClassName="text-5xl sm:text-6xl lg:text-8xl"
            subtitleClassName="text-base sm:text-lg max-w-xl mx-auto"
          />

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 -mt-4 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <ParticleButton variant="primary" className="w-full sm:w-auto px-8 py-3.5 text-sm" successDuration={1800} onSuccess={navAfterAnim('/signup')}>
              Start Free <ArrowRight size={15} />
            </ParticleButton>
            <ParticleButton variant="ghost" className="w-full sm:w-auto px-8 py-3.5 text-sm" successDuration={1800} onSuccess={navAfterAnim('/login')}>
              Sign In
            </ParticleButton>
          </div>

          {/* Stats bar */}
          <div className={`mt-10 grid grid-cols-3 gap-px rounded-xl overflow-hidden transition-all duration-700 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            style={{ border: '1px solid #1e1e24', background: '#1e1e24' }}>
            {[{ num: '5', label: 'Exams' }, { num: '10K+', label: 'PYQs' }, { num: 'Free', label: 'AI' }].map(s => (
              <div key={s.label} className="py-5 text-center" style={{ background: '#111114' }}>
                <div className="font-mono-display font-bold text-xl sm:text-2xl mb-0.5" style={{ color: '#2baffc' }}>{s.num}</div>
                <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exams ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-t" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mono-display font-bold text-2xl sm:text-3xl mb-2" style={{ color: '#f4f9fd' }}>Exams we cover</h2>
            <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>Authentic patterns. Real PYQs. Correct marking schemes.</p>
          </div>

          {/* Desktop: full grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAMS.map(exam => (
              <GlowCard key={exam.code} glowColor={colorKey(exam.color)}
                style={{ background: '#111114', border: '1px solid #1e1e24', padding: '24px' }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono-display text-xs font-bold px-2 py-1 rounded"
                    style={{ background: exam.color + '15', color: exam.color }}>{exam.code}</span>
                  {exam.body && <span className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>{exam.body}</span>}
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#f4f9fd' }}>{exam.name}</h3>
                <p className="text-xs mb-3" style={{ color: exam.color }}>{exam.note}</p>
                {exam.duration && (
                  <div className="flex gap-3 mb-3 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <span className="flex items-center gap-1"><Clock size={10} />{exam.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen size={10} />{exam.questions}Q</span>
                    <span style={{ color: '#f59e0b' }}>{exam.pattern}</span>
                  </div>
                )}
                {exam.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(exam.subjects as readonly string[]).map(s => (
                      <span key={s} className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,249,253,0.5)' }}>{s}</span>
                    ))}
                  </div>
                )}
                {('barch' in exam) && <p className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>Coming soon.</p>}
              </GlowCard>
            ))}
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="sm:hidden flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
            {EXAMS.map(exam => (
              <GlowCard key={exam.code} glowColor={colorKey(exam.color)}
                style={{ background: '#111114', border: '1px solid #1e1e24', padding: '16px', flexShrink: 0, width: '240px' }}>
                <span className="font-mono-display text-xs font-bold px-2 py-0.5 rounded inline-block mb-2"
                  style={{ background: exam.color + '15', color: exam.color }}>{exam.code}</span>
                <h3 className="font-semibold text-sm mb-1" style={{ color: '#f4f9fd' }}>{exam.name}</h3>
                <p className="text-xs mb-2" style={{ color: exam.color }}>{exam.note}</p>
                {exam.duration && (
                  <div className="flex gap-2 text-xs mb-2" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <span>{exam.duration}</span><span>{exam.questions}Q</span>
                    <span style={{ color: '#f59e0b' }}>{exam.pattern}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {(exam.subjects as readonly string[]).map(s => (
                    <span key={s} className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,249,253,0.5)' }}>{s}</span>
                  ))}
                </div>
              </GlowCard>
            ))}
          </div>
          <p className="sm:hidden text-center text-xs mt-2" style={{ color: 'rgba(244,249,253,0.25)' }}>← swipe for all exams →</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mono-display font-bold text-2xl sm:text-3xl mb-2" style={{ color: '#f4f9fd' }}>Everything you need</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <GlowCard key={f.title} glowColor={colorKey(f.color)}
                style={{ background: '#111114', border: '1px solid #1e1e24', padding: '20px' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: f.color + '15', color: f.color }}>{f.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: '#f4f9fd' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,249,253,0.55)' }}>{f.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Reference Table ── */}
      <section className="py-14 px-4 sm:px-6 border-t" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-mono-display font-bold text-xl sm:text-2xl mb-6 text-center" style={{ color: '#f4f9fd' }}>Quick Reference</h2>
          <div className="table-wrap rounded-xl overflow-hidden" style={{ border: '1px solid #1e1e24' }}>
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #1e1e24' }}>
                  {['Exam','Mode','Duration','Questions','Marks','Marking'].map(h => (
                    <th key={h} className="px-3 sm:px-4 py-3 text-left font-mono-display text-xs whitespace-nowrap"
                      style={{ color: 'rgba(244,249,253,0.5)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { exam:'JEE Main',    mode:'CBT',         dur:'3h',     qs:'75',  marks:'300', mark:'+4 / -1' },
                  { exam:'JEE Advanced',mode:'CBT',         dur:'6h',     qs:'114', marks:'360', mark:'Varies'  },
                  { exam:'VITEEE',      mode:'CBT',         dur:'2.5h',   qs:'125', marks:'500', mark:'+4 / -1' },
                  { exam:'KEAM',        mode:'CBT',         dur:'3h',     qs:'150', marks:'600', mark:'+4 / -1' },
                  { exam:'CUSAT CAT',   mode:'CBT',         dur:'3h',     qs:'225', marks:'900', mark:'+3 / -1' },
                  { exam:'NEET',        mode:'Pen & Paper', dur:'3h 20m', qs:'180', marks:'720', mark:'+4 / -1' },
                ].map((r, i) => (
                  <tr key={r.exam} style={{ borderBottom: '1px solid #1e1e24', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap" style={{ color: '#f4f9fd' }}>{r.exam}</td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap" style={{ color: 'rgba(244,249,253,0.6)' }}>{r.mode}</td>
                    <td className="px-3 sm:px-4 py-3 font-mono-display whitespace-nowrap" style={{ color: '#2baffc' }}>{r.dur}</td>
                    <td className="px-3 sm:px-4 py-3 font-mono-display whitespace-nowrap" style={{ color: '#55c360' }}>{r.qs}</td>
                    <td className="px-3 sm:px-4 py-3 font-mono-display whitespace-nowrap" style={{ color: '#f59e0b' }}>{r.marks}</td>
                    <td className="px-3 sm:px-4 py-3 font-mono-display whitespace-nowrap" style={{ color: 'rgba(244,249,253,0.5)' }}>{r.mark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <GridBackground
            title="Ready to start forging?"
            description="Free account. Take your first mock test in 2 minutes."
          >
            <ParticleButton variant="primary" className="px-8 py-3.5 text-sm" successDuration={1800} onSuccess={navAfterAnim('/signup')}>
              Create Free Account <ArrowRight size={15} />
            </ParticleButton>
          </GridBackground>
        </div>
      </section>

      <footer className="border-t py-6 px-4 sm:px-6" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono-display text-sm font-bold" style={{ color: '#2baffc' }}>ExamForge</span>
          <span className="text-xs text-center" style={{ color: 'rgba(244,249,253,0.3)' }}>© 2026 ExamForge · JEE · VITEEE · KEAM · CUSAT · NEET</span>
        </div>
      </footer>
    </div>
  )
}
