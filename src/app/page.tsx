'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Zap, Target, BarChart3, Brain, CheckCircle, ChevronRight } from 'lucide-react'

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
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Nebula glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(43,175,252,0.12) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(85,195,96,0.07) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 text-xs font-mono-display ${mounted ? 'animate-in' : 'opacity-0'}`}
            style={{ background: 'rgba(43,175,252,0.08)', borderColor: 'rgba(43,175,252,0.3)', color: '#2baffc' }}>
            <Zap size={12} />
            AI-Powered JEE & VIT Preparation
          </div>

          <h1 className={`font-mono-display font-bold leading-none mb-6 ${mounted ? 'animate-in stagger-1' : 'opacity-0'}`}
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#f4f9fd', letterSpacing: '-0.03em' }}>
            Forge Your<br />
            <span style={{ color: '#2baffc' }}>Exam</span> Rank.
          </h1>

          <p className={`text-lg mb-10 max-w-xl mx-auto leading-relaxed ${mounted ? 'animate-in stagger-2' : 'opacity-0'}`}
            style={{ color: 'rgba(244,249,253,0.6)' }}>
            Full-length CBT mock exams with real PYQs. Instant AI analysis pinpoints your weak zones and builds a targeted study checklist.
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-in stagger-3' : 'opacity-0'}`}>
            <Link href="/signup" className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
              Start Practising Free
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-ghost flex items-center gap-2 px-8 py-4 text-base">
              Sign In
            </Link>
          </div>

          {/* Stats bar */}
          <div className={`mt-16 grid grid-cols-3 gap-px rounded-xl overflow-hidden ${mounted ? 'animate-in stagger-4' : 'opacity-0'}`}
            style={{ border: '1px solid #1e1e24', background: '#1e1e24' }}>
            {[
              { num: '10K+', label: 'PYQs Loaded' },
              { num: '98%', label: 'Accuracy Rate' },
              { num: '<2s', label: 'AI Analysis' },
            ].map((s) => (
              <div key={s.label} className="py-6 text-center" style={{ background: '#111114' }}>
                <div className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#2baffc' }}>{s.num}</div>
                <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-mono-display font-bold text-3xl mb-4" style={{ color: '#f4f9fd' }}>
              Everything you need to crack it
            </h2>
            <p style={{ color: 'rgba(244,249,253,0.5)' }}>Built for serious aspirants. No fluff, no distractions.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Target size={20} />,
                title: 'Authentic CBT Mode',
                desc: 'Full-screen Computer Based Test simulation. Question palette, timer, and marking scheme identical to the real exam.',
                color: '#2baffc',
              },
              {
                icon: <Brain size={20} />,
                title: 'AI Post-Exam Review',
                desc: 'GPT-class AI analyses every attempt. Get a personal weakness report and a prioritized study checklist automatically.',
                color: '#55c360',
              },
              {
                icon: <BarChart3 size={20} />,
                title: 'Progress Nebula',
                desc: 'Your personal performance visualization. Watch the nebula shift colors as your strongest subject evolves.',
                color: '#2baffc',
              },
              {
                icon: <Zap size={20} />,
                title: 'Topic-wise PYQs',
                desc: 'Curated 2020–2026 PYQs mapped to the latest JEE/VIT syllabus. Practice by chapter or full test.',
                color: '#55c360',
              },
              {
                icon: <CheckCircle size={20} />,
                title: 'Instant Explanations',
                desc: 'Every question has a detailed solution. AI can also rephrase the explanation in simpler terms on demand.',
                color: '#2baffc',
              },
              {
                icon: <ChevronRight size={20} />,
                title: 'Adaptive Study Path',
                desc: 'System tracks wrong answers and auto-generates a revision list. Attack your weak topics, not the strong ones.',
                color: '#55c360',
              },
            ].map((f) => (
              <div key={f.title} className="card group hover:border-opacity-50 transition-all duration-300"
                style={{ borderColor: '#1e1e24' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = f.color + '40')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e24')}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: f.color + '15', color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#f4f9fd' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,249,253,0.55)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exams supported */}
      <section className="py-16 px-6 border-t" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                exam: 'JEE Main & Advanced',
                desc: 'Physics · Chemistry · Mathematics',
                badge: 'JEE',
                color: '#2baffc',
                topics: ['Mechanics', 'Organic Chem', 'Calculus', 'Electrostatics', 'Inorganic Chem', 'Algebra'],
              },
              {
                exam: 'VIT Engineering Entrance',
                desc: 'VITEEE Pattern & Syllabus',
                badge: 'VIT',
                color: '#55c360',
                topics: ['Physics', 'Chemistry', 'Maths', 'Aptitude', 'English', 'Biology'],
              },
            ].map((e) => (
              <div key={e.exam} className="card" style={{ borderColor: '#1e1e24' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-mono-display text-xs font-bold px-2 py-1 rounded"
                      style={{ background: e.color + '20', color: e.color }}>{e.badge}</span>
                    <h3 className="font-semibold mt-3 mb-1" style={{ color: '#f4f9fd' }}>{e.exam}</h3>
                    <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>{e.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {e.topics.map(t => (
                    <span key={t} className="text-xs px-2 py-1 rounded"
                      style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.6)' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative rounded-2xl p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(43,175,252,0.1) 0%, rgba(85,195,96,0.05) 100%)', border: '1px solid rgba(43,175,252,0.2)' }}>
            <h2 className="font-mono-display font-bold text-3xl mb-4" style={{ color: '#f4f9fd' }}>
              Ready to start forging?
            </h2>
            <p className="mb-8" style={{ color: 'rgba(244,249,253,0.6)' }}>
              Create your free account and take your first mock test in under 2 minutes.
            </p>
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base">
              Create Free Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6" style={{ borderColor: '#1e1e24' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-mono-display text-sm font-bold" style={{ color: '#2baffc' }}>ExamForge</span>
          <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>© 2025 ExamForge. Built for aspirants.</span>
        </div>
      </footer>
    </div>
  )
}
