'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { DashCard } from '@/components/ui/spotlight-card'
import {
  Shield, Eye, EyeOff, Users, BookOpen, BarChart3, Plus, Trash2,
  Edit3, X, Check, Upload, FileText, Loader2, ChevronDown, ChevronUp
} from 'lucide-react'

// ── AUTH GATE ──────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass }),
    })
    if (res.ok) { onSuccess() } else { setError('Incorrect admin password'); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#010101' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(43,175,252,0.06) 0%, transparent 60%)' }} />
      <div className="w-full max-w-sm relative">
        <DashCard className="animate-in" style={{ borderColor: 'rgba(43,175,252,0.2)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(43,175,252,0.15)', color: '#2baffc' }}>
              <Shield size={20} />
            </div>
            <div>
              <div className="font-mono-display font-bold" style={{ color: '#f4f9fd' }}>Admin Panel</div>
              <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>ExamForge</div>
            </div>
          </div>
          {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-display mb-2" style={{ color: 'rgba(244,249,253,0.6)' }}>ADMIN PASSWORD</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="input-field pr-12" placeholder="Enter password"
                  value={pass} onChange={e => { setPass(e.target.value); setError('') }} required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(244,249,253,0.4)' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Shield size={14} /> Enter Admin</>}
            </button>
          </form>
        </div>
      </DashCard>
    </div>
  )
}

// ── TYPES ──────────────────────────────────────────────────
interface Question {
  id: string; exam_type: string; subject_id: string; question_text: string
  option_a: string; option_b: string; option_c: string; option_d: string
  correct_option: string; explanation: string; difficulty: string; topic: string
  year: number | null; is_active: boolean; has_math: boolean
  subjects?: { name: string; code: string }
}
interface Profile { id: string; full_name: string; email: string; target_exam: string; total_tests_taken: number; total_score_points: number; created_at: string }
interface Subject { id: string; name: string; code: string; exam_type: string; color: string; icon: string }
interface MockExam { id: string; title: string; exam_type: string; duration_minutes: number; total_questions: number; is_active: boolean }
interface ExtractedQuestion {
  question_text: string; option_a: string; option_b: string; option_c: string; option_d: string
  correct_option: string; explanation: string; subject: string; topic: string; difficulty: string
  year: number | null; has_math: boolean
}

interface QuestionForm {
  exam_type: string; subject_id: string; question_text: string
  option_a: string; option_b: string; option_c: string; option_d: string
  correct_option: string; explanation: string; difficulty: string; topic: string; year: string; has_math: boolean
}

const EMPTY_Q: QuestionForm = {
  exam_type: 'JEE', subject_id: '', question_text: '',
  option_a: '', option_b: '', option_c: '', option_d: '',
  correct_option: 'A', explanation: '', difficulty: 'medium', topic: '', year: '', has_math: false,
}

type TabType = 'overview' | 'questions' | 'pdf' | 'exams' | 'students'

// ── MATH RENDER (KaTeX-free simple renderer) ───────────────
function MathText({ text }: { text: string }) {
  // Simple inline math rendering without KaTeX dependency
  const parts = text.split(/(\$[^$]+\$)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1)
          return <code key={i} className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', fontFamily: 'JetBrains Mono, monospace' }}>{math}</code>
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

// ── ADMIN PANEL ────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState<TabType>('overview')
  const [questions, setQuestions] = useState<Question[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [mockExams, setMockExams] = useState<MockExam[]>([])
  const [stats, setStats] = useState({ totalStudents: 0, totalTests: 0, totalQuestions: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [showQForm, setShowQForm] = useState(false)
  const [qForm, setQForm] = useState<QuestionForm>(EMPTY_Q)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [qFilter, setQFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  // PDF state
  const [pdfText, setPdfText] = useState('')
  const [pdfExamType, setPdfExamType] = useState('JEE')
  const [pdfSubjectHint, setPdfSubjectHint] = useState('')
  const [extractedQs, setExtractedQs] = useState<ExtractedQuestion[]>([])
  const [extracting, setExtracting] = useState(false)
  const [savingPdf, setSavingPdf] = useState(false)
  const [selectedExtracted, setSelectedExtracted] = useState<Set<number>>(new Set())
  const [pdfError, setPdfError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: q }, { data: p }, { data: s }, { data: m }] = await Promise.all([
      supabase.from('questions').select('*, subjects(name, code)').order('created_at', { ascending: false }).limit(200),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('subjects').select('*').order('exam_type').order('name'),
      supabase.from('mock_exams').select('*').order('created_at', { ascending: false }),
    ])
    const { data: sessions } = await supabase.from('test_sessions').select('percentage').eq('status', 'completed')
    const avgScore = sessions && sessions.length > 0
      ? Math.round(sessions.reduce((a: number, s: { percentage: number }) => a + s.percentage, 0) / sessions.length) : 0
    setQuestions((q as Question[]) || [])
    setProfiles((p as Profile[]) || [])
    setSubjects((s as Subject[]) || [])
    setMockExams((m as MockExam[]) || [])
    setStats({ totalStudents: p?.length || 0, totalTests: sessions?.length || 0, totalQuestions: q?.length || 0, avgScore })
    setLoading(false)
  }

  function updQ(k: keyof QuestionForm, v: string | boolean) {
    setQForm(f => ({ ...f, [k]: v }))
  }

  async function saveQuestion() {
    setSaving(true)
    const payload = {
      exam_type: qForm.exam_type,
      subject_id: qForm.subject_id || null,
      question_text: qForm.question_text,
      option_a: qForm.option_a, option_b: qForm.option_b,
      option_c: qForm.option_c, option_d: qForm.option_d,
      correct_option: qForm.correct_option,
      explanation: qForm.explanation,
      difficulty: qForm.difficulty,
      topic: qForm.topic,
      year: qForm.year ? parseInt(qForm.year) : null,
      has_math: qForm.has_math,
    }
    if (editId) {
      await supabase.from('questions').update(payload).eq('id', editId)
      setEditId(null)
    } else {
      await supabase.from('questions').insert(payload)
    }
    setQForm(EMPTY_Q); setShowQForm(false); setSaving(false); loadAll()
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Delete this question?')) return
    await supabase.from('questions').delete().eq('id', id)
    loadAll()
  }

  function startEdit(q: Question) {
    setQForm({ ...q, year: q.year?.toString() || '', subject_id: q.subject_id || '', has_math: q.has_math || false })
    setEditId(q.id); setShowQForm(true); setTab('questions'); window.scrollTo(0, 0)
  }

  // PDF handling
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfError('')

    if (file.type === 'text/plain') {
      const text = await file.text()
      setPdfText(text)
    } else if (file.type === 'application/pdf') {
      // For PDF we need to extract text - use a simple approach
      setPdfError('For best results, copy-paste text from your PDF into the text area below, or upload a .txt file.')
      setPdfText('')
    }
  }

  async function extractQuestions() {
    if (!pdfText.trim()) { setPdfError('Please provide question text'); return }
    setExtracting(true); setPdfError(''); setExtractedQs([])
    try {
      const res = await fetch('/api/ai/pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pdfText, examType: pdfExamType, subjectHint: pdfSubjectHint }),
      })
      const data = await res.json()
      if (data.error) { setPdfError(data.error); return }
      setExtractedQs(data.questions || [])
      setSelectedExtracted(new Set(data.questions.map((_: ExtractedQuestion, i: number) => i)))
    } catch {
      setPdfError('Extraction failed. Try again.')
    } finally { setExtracting(false) }
  }

  async function saveExtractedQuestions() {
    if (selectedExtracted.size === 0) return
    setSavingPdf(true)
    const toSave = extractedQs.filter((_, i) => selectedExtracted.has(i))

    for (const q of toSave) {
      // Match subject name to subject_id
      const subj = subjects.find(s =>
        s.exam_type === pdfExamType &&
        s.name.toLowerCase() === q.subject.toLowerCase()
      )
      await supabase.from('questions').insert({
        exam_type: pdfExamType,
        subject_id: subj?.id || null,
        question_text: q.question_text,
        option_a: q.option_a, option_b: q.option_b,
        option_c: q.option_c, option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty,
        year: q.year,
        has_math: q.has_math,
        is_active: true,
      })
    }
    setSavingPdf(false); setExtractedQs([]); setPdfText(''); loadAll()
    alert(`✅ ${toSave.length} questions added to the bank!`)
  }

  async function toggleExam(id: string, current: boolean) {
    await supabase.from('mock_exams').update({ is_active: !current }).eq('id', id)
    loadAll()
  }
  async function deleteExam(id: string) {
    if (!confirm('Delete this exam?')) return
    await supabase.from('mock_exams').delete().eq('id', id)
    loadAll()
  }

  const filteredQ = questions.filter(q => {
    const matchText = !qFilter || q.question_text.toLowerCase().includes(qFilter.toLowerCase()) || q.topic?.toLowerCase().includes(qFilter.toLowerCase())
    const matchSubj = !subjectFilter || q.subjects?.name === subjectFilter
    return matchText && matchSubj
  })

  const TABS = [
    { id: 'overview' as const, label: 'Overview', icon: <BarChart3 size={15} /> },
    { id: 'questions' as const, label: `Questions (${stats.totalQuestions})`, icon: <BookOpen size={15} /> },
    { id: 'pdf' as const, label: 'PDF Import', icon: <FileText size={15} /> },
    { id: 'exams' as const, label: 'Mock Exams', icon: <Edit3 size={15} /> },
    { id: 'students' as const, label: `Students (${stats.totalStudents})`, icon: <Users size={15} /> },
  ]

  const subjectsByExam = (et: string) => subjects.filter(s => s.exam_type === et)

  return (
    <div className="min-h-screen" style={{ background: '#010101' }}>
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: '1px solid #1e1e24' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2baffc' }}>
              <span className="font-mono-display font-bold text-xs" style={{ color: '#010101' }}>EF</span>
            </div>
            <span className="font-mono-display font-bold text-sm" style={{ color: '#f4f9fd' }}>ExamForge</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', border: '1px solid rgba(43,175,252,0.2)' }}>Admin</span>
          </div>
          <a href="/" className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>← Back to site</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 justify-center"
              style={{ background: tab === t.id ? '#2baffc' : 'transparent', color: tab === t.id ? '#010101' : 'rgba(244,249,253,0.5)', minWidth: 'fit-content' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="animate-in">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Students', val: stats.totalStudents, color: '#2baffc' },
                    { label: 'Questions in Bank', val: stats.totalQuestions, color: '#f59e0b' },
                    { label: 'Platform Avg Score', val: `${stats.avgScore}%`, color: '#55c360' },
                  ].map(s => (
                    <DashCard key={s.label} glowColor={s.color === '#2baffc' ? 'blue' : s.color === '#f59e0b' ? 'amber' : 'green'} style={{ padding: '20px' }}>
                      <div className="text-xs mb-2" style={{ color: 'rgba(244,249,253,0.5)' }}>{s.label}</div>
                      <div className="font-mono-display font-bold text-2xl" style={{ color: s.color }}>{s.val}</div>
                    </DashCard>
                  ))}
                </div>
                {/* Subjects overview */}
                <DashCard style={{ padding: '20px' }}>
                  <h3 className="font-mono-display text-sm font-bold mb-4" style={{ color: '#f4f9fd' }}>Subjects Configured</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['JEE', 'VITEEE', 'KEAM', 'CUSAT', 'NEET'].map(et => (
                      <div key={et}>
                        <div className="text-xs font-mono-display mb-2 px-2 py-1 rounded w-fit"
                          style={{ background: et === 'JEE' ? 'rgba(43,175,252,0.15)' : et === 'VITEEE' ? 'rgba(85,195,96,0.15)' : et === 'KEAM' ? 'rgba(245,158,11,0.15)' : et === 'CUSAT' ? 'rgba(167,139,250,0.15)' : 'rgba(236,72,153,0.15)', color: et === 'JEE' ? '#2baffc' : et === 'VITEEE' ? '#55c360' : et === 'KEAM' ? '#f59e0b' : et === 'CUSAT' ? '#a78bfa' : '#ec4899' }}>
                          {et}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {subjectsByExam(et).map(s => (
                            <span key={s.id} className="text-xs px-2 py-1 rounded flex items-center gap-1"
                              style={{ background: s.color + '15', color: s.color, border: `1px solid ${s.color}30` }}>
                              {s.icon} {s.name}
                            </span>
                          ))}
                          {subjectsByExam(et).length === 0 && (
                            <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>Run SQL update first</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DashCard>
                <DashCard style={{ borderColor: '#1e1e24' }}>
                  <h3 className="font-mono-display text-sm font-bold mb-4" style={{ color: '#f4f9fd' }}>Recent Registrations</h3>
                  {profiles.slice(0, 5).length === 0 ? (
                    <p className="text-sm" style={{ color: 'rgba(244,249,253,0.4)' }}>No students yet</p>
                  ) : profiles.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #1e1e24' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #2baffc, #55c360)', color: '#010101' }}>
                        {p.full_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm" style={{ color: '#f4f9fd' }}>{p.full_name}</div>
                        <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{p.email}</div>
                      </div>
                      <span className="text-xs font-mono-display px-2 py-0.5 rounded" style={{ background: '#1e1e24', color: '#2baffc' }}>{p.target_exam}</span>
                    </div>
                  ))}
                </DashCard>
              </div>
            )}

            {/* ── QUESTIONS ── */}
            {tab === 'questions' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <input className="input-field max-w-xs text-sm" placeholder="Search questions..." value={qFilter} onChange={e => setQFilter(e.target.value)} />
                  <select className="input-field w-40 text-sm" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name} ({s.exam_type})</option>)}
                  </select>
                  <button onClick={() => { setShowQForm(!showQForm); setEditId(null); setQForm(EMPTY_Q) }}
                    className="btn-primary flex items-center gap-2 py-2 px-4 text-sm ml-auto">
                    <Plus size={14} /> Add Question
                  </button>
                </div>

                {showQForm && (
                  <DashCard style={{ borderColor: 'rgba(43,175,252,0.3)' }}>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono-display font-bold text-sm" style={{ color: '#2baffc' }}>{editId ? 'Edit Question' : 'New Question'}</span>
                      <button onClick={() => { setShowQForm(false); setEditId(null) }} style={{ color: 'rgba(244,249,253,0.4)' }}><X size={16} /></button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>EXAM TYPE</label>
                          <select className="input-field text-sm" value={qForm.exam_type} onChange={e => { updQ('exam_type', e.target.value); updQ('subject_id', '') }}>
                            <option>JEE</option><option>VITEEE</option><option>KEAM</option><option>CUSAT</option><option>NEET</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>SUBJECT</label>
                          <select className="input-field text-sm" value={qForm.subject_id} onChange={e => updQ('subject_id', e.target.value)}>
                            <option value="">Select...</option>
                            {subjectsByExam(qForm.exam_type).map(s => (
                              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>DIFFICULTY</label>
                          <select className="input-field text-sm" value={qForm.difficulty} onChange={e => updQ('difficulty', e.target.value)}>
                            <option>easy</option><option>medium</option><option>hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>YEAR</label>
                          <input className="input-field text-sm" placeholder="2024" value={qForm.year} onChange={e => updQ('year', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>TOPIC</label>
                          <input className="input-field text-sm" placeholder="e.g. Circular Motion" value={qForm.topic} onChange={e => updQ('topic', e.target.value)} />
                        </div>
                        <div className="flex items-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={qForm.has_math} onChange={e => updQ('has_math', e.target.checked)}
                              className="w-4 h-4 rounded" />
                            <span className="text-sm" style={{ color: 'rgba(244,249,253,0.6)' }}>Contains mathematical expressions</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>
                          QUESTION TEXT {qForm.has_math && <span style={{ color: '#2baffc' }}>· Use $formula$ for math</span>}
                        </label>
                        <textarea className="input-field resize-none text-sm" rows={4}
                          placeholder="Enter question. For math: $x^2 + y^2 = r^2$ or $\frac{a}{b}$"
                          value={qForm.question_text} onChange={e => updQ('question_text', e.target.value)} />
                        {qForm.has_math && qForm.question_text && (
                          <div className="mt-2 p-2 rounded text-sm" style={{ background: '#0a0a0b', border: '1px solid #1e1e24' }}>
                            <span className="text-xs font-mono-display" style={{ color: 'rgba(244,249,253,0.4)' }}>PREVIEW: </span>
                            <MathText text={qForm.question_text} />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {(['A', 'B', 'C', 'D'] as const).map(opt => {
                          const key = `option_${opt.toLowerCase()}` as keyof QuestionForm
                          return (
                            <div key={opt}>
                              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>OPTION {opt}</label>
                              <input className="input-field text-sm" placeholder={`Option ${opt}...`}
                                value={qForm[key] as string} onChange={e => updQ(key, e.target.value)} />
                            </div>
                          )
                        })}
                      </div>
                      <div>
                        <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>CORRECT ANSWER</label>
                        <div className="flex gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map(opt => (
                            <button key={opt} type="button" onClick={() => updQ('correct_option', opt)}
                              className="w-10 h-10 rounded-lg font-mono-display font-bold text-sm transition-all"
                              style={{ background: qForm.correct_option === opt ? '#55c360' : '#1e1e24', color: qForm.correct_option === opt ? '#010101' : 'rgba(244,249,253,0.5)' }}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>EXPLANATION</label>
                        <textarea className="input-field resize-none text-sm" rows={3} placeholder="Explain the solution..." value={qForm.explanation} onChange={e => updQ('explanation', e.target.value)} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setShowQForm(false); setEditId(null) }} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                        <button onClick={saveQuestion} disabled={!qForm.question_text || !qForm.option_a || saving}
                          className="btn-emerald flex items-center gap-2 text-sm py-2 px-4">
                          <Check size={14} /> {saving ? 'Saving...' : editId ? 'Update' : 'Add Question'}
                        </button>
                      </div>
                    </div>
                  </DashCard>
                )}

                <DashCard style={{ borderColor: '#1e1e24', padding: 0 }}>
                  <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e24' }}>
                    <span className="font-mono-display text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>{filteredQ.length} QUESTIONS</span>
                  </div>
                  {filteredQ.length === 0 ? (
                    <div className="text-center py-12"><p style={{ color: 'rgba(244,249,253,0.4)' }}>No questions found</p></div>
                  ) : (
                    <div className="divide-y" style={{ borderColor: '#1e1e24' }}>
                      {filteredQ.map(q => (
                        <div key={q.id} className="flex items-start gap-4 p-4 transition-all hover:bg-[#0a0a0b]">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono-display px-1.5 py-0.5 rounded"
                                style={{ background: q.exam_type === 'JEE' ? 'rgba(43,175,252,0.15)' : 'rgba(85,195,96,0.15)', color: q.exam_type === 'JEE' ? '#2baffc' : '#55c360' }}>
                                {q.exam_type}
                              </span>
                              <span className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{q.subjects?.name}</span>
                              {q.topic && <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>· {q.topic}</span>}
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{
                                background: q.difficulty === 'easy' ? 'rgba(85,195,96,0.1)' : q.difficulty === 'hard' ? 'rgba(255,107,107,0.1)' : 'rgba(43,175,252,0.1)',
                                color: q.difficulty === 'easy' ? '#55c360' : q.difficulty === 'hard' ? '#ff8080' : '#2baffc',
                              }}>{q.difficulty}</span>
                              {q.has_math && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>∑ math</span>}
                            </div>
                            <p className="text-sm line-clamp-2" style={{ color: '#f4f9fd' }}>
                              {q.has_math ? <MathText text={q.question_text} /> : q.question_text}
                            </p>
                            <div className="text-xs mt-1" style={{ color: '#55c360' }}>Correct: {q.correct_option}</div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => startEdit(q)} className="p-2 rounded-lg transition-all" style={{ color: 'rgba(244,249,253,0.4)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => deleteQuestion(q.id)} className="p-2 rounded-lg transition-all" style={{ color: 'rgba(244,249,253,0.4)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#ff8080')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DashCard>
              </div>
            )}

            {/* ── PDF IMPORT ── */}
            {tab === 'pdf' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-mono-display font-bold text-lg mb-1" style={{ color: '#f4f9fd' }}>PDF / Text Import</h2>
                  <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    Paste question text or upload a .txt file. AI will extract, categorise by subject/topic, and format math automatically.
                  </p>
                </div>

                <DashCard className="space-y-4" style={{ borderColor: '#1e1e24' }}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>EXAM TYPE</label>
                      <select className="input-field text-sm" value={pdfExamType} onChange={e => setPdfExamType(e.target.value)}>
                        <option>JEE</option><option>VITEEE</option><option>KEAM</option><option>CUSAT</option><option>NEET</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>SUBJECT HINT (optional)</label>
                      <select className="input-field text-sm" value={pdfSubjectHint} onChange={e => setPdfSubjectHint(e.target.value)}>
                        <option value="">Auto-detect</option>
                        {subjectsByExam(pdfExamType).map(s => <option key={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="btn-ghost w-full flex items-center justify-center gap-2 py-2.5 text-sm cursor-pointer">
                        <Upload size={14} />
                        Upload .txt file
                        <input ref={fileRef} type="file" accept=".txt,.text" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>
                      PASTE QUESTION TEXT HERE
                    </label>
                    <textarea className="input-field resize-none text-sm" rows={12}
                      placeholder="Paste your questions here. Include the question, options A/B/C/D, and correct answer. AI will extract and categorise automatically.

Example:
1. A particle moves in a circle of radius r with speed v. The centripetal acceleration is:
(A) v/r  (B) v²/r  (C) v²r  (D) vr²
Answer: B
Explanation: Centripetal acceleration = v²/r"
                      value={pdfText} onChange={e => setPdfText(e.target.value)} />
                  </div>

                  {pdfError && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>{pdfError}</div>}

                  <button onClick={extractQuestions} disabled={extracting || !pdfText.trim()}
                    className="btn-primary flex items-center gap-2 py-3 px-6">
                    {extracting ? <><Loader2 size={14} className="animate-spin" /> Extracting with AI...</> : <><FileText size={14} /> Extract Questions with AI</>}
                  </button>
                </DashCard>

                {/* Extracted questions preview */}
                {extractedQs.length > 0 && (
                  <DashCard className="space-y-4" style={{ borderColor: 'rgba(85,195,96,0.3)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-mono-display font-bold text-sm" style={{ color: '#55c360' }}>
                          ✓ {extractedQs.length} Questions Extracted
                        </h3>
                        <p className="text-xs mt-1" style={{ color: 'rgba(244,249,253,0.4)' }}>Review, deselect any you don&apos;t want, then save all.</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedExtracted(new Set(extractedQs.map((_, i) => i)))}
                          className="btn-ghost text-xs py-1.5 px-3">Select All</button>
                        <button onClick={saveExtractedQuestions} disabled={savingPdf || selectedExtracted.size === 0}
                          className="btn-emerald flex items-center gap-2 text-sm py-2 px-4">
                          {savingPdf ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Save {selectedExtracted.size} Questions
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-auto">
                      {extractedQs.map((q, i) => {
                        const isSelected = selectedExtracted.has(i)
                        return (
                          <div key={i} className="p-4 rounded-xl transition-all cursor-pointer"
                            style={{ background: isSelected ? 'rgba(85,195,96,0.05)' : '#0a0a0b', border: `1px solid ${isSelected ? 'rgba(85,195,96,0.3)' : '#1e1e24'}` }}
                            onClick={() => {
                              const next = new Set(selectedExtracted)
                              if (next.has(i)) next.delete(i); else next.add(i)
                              setSelectedExtracted(next)
                            }}>
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: isSelected ? '#55c360' : '#1e1e24', border: `1px solid ${isSelected ? '#55c360' : '#2a2a32'}` }}>
                                {isSelected && <Check size={10} style={{ color: '#010101' }} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc' }}>{q.subject}</span>
                                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>{q.topic}</span>
                                  <span className="text-xs px-2 py-0.5 rounded" style={{
                                    background: q.difficulty === 'easy' ? 'rgba(85,195,96,0.1)' : q.difficulty === 'hard' ? 'rgba(255,107,107,0.1)' : 'rgba(43,175,252,0.1)',
                                    color: q.difficulty === 'easy' ? '#55c360' : q.difficulty === 'hard' ? '#ff8080' : '#2baffc',
                                  }}>{q.difficulty}</span>
                                  {q.has_math && <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>∑ math</span>}
                                </div>
                                <p className="text-sm mb-2" style={{ color: '#f4f9fd' }}>
                                  <MathText text={q.question_text} />
                                </p>
                                <div className="grid grid-cols-2 gap-1">
                                  {(['A', 'B', 'C', 'D'] as const).map(opt => {
                                    const key = `option_${opt.toLowerCase()}` as keyof ExtractedQuestion
                                    const isCorrect = opt === q.correct_option
                                    return (
                                      <div key={opt} className="text-xs px-2 py-1 rounded flex items-center gap-1.5"
                                        style={{ background: isCorrect ? 'rgba(85,195,96,0.1)' : 'transparent', color: isCorrect ? '#55c360' : 'rgba(244,249,253,0.5)' }}>
                                        <span className="font-mono-display font-bold">{opt}.</span>
                                        <MathText text={String(q[key] || '')} />
                                        {isCorrect && <Check size={10} className="ml-auto flex-shrink-0" />}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </DashCard>
                )}
              </div>
            )}

            {/* ── EXAMS ── */}
            {tab === 'exams' && (
              <div className="grid md:grid-cols-2 gap-4">
                {mockExams.map(e => (
                  <div key={e.id} className="card" style={{ borderColor: e.is_active ? 'rgba(85,195,96,0.2)' : '#1e1e24' }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-xs font-mono-display px-2 py-0.5 rounded mb-2 inline-block"
                          style={{ background: e.exam_type === 'JEE' ? 'rgba(43,175,252,0.15)' : 'rgba(85,195,96,0.15)', color: e.exam_type === 'JEE' ? '#2baffc' : '#55c360' }}>
                          {e.exam_type}
                        </span>
                        <h3 className="text-sm font-semibold" style={{ color: '#f4f9fd' }}>{e.title}</h3>
                      </div>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: e.is_active ? '#55c360' : '#ff6b6b' }} />
                    </div>
                    <div className="flex gap-4 text-xs mb-4" style={{ color: 'rgba(244,249,253,0.5)' }}>
                      <span>{e.duration_minutes} min</span><span>{e.total_questions} questions</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleExam(e.id, e.is_active)} className="btn-ghost text-xs py-1.5 px-3 flex-1">
                        {e.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => deleteExam(e.id)} className="p-1.5 rounded-lg transition-all" style={{ color: 'rgba(244,249,253,0.3)' }}
                        onMouseEnter={el => (el.currentTarget.style.color = '#ff8080')}
                        onMouseLeave={el => (el.currentTarget.style.color = 'rgba(244,249,253,0.3)')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STUDENTS ── */}
            {tab === 'students' && (
              <DashCard style={{ borderColor: '#1e1e24', padding: 0 }}>
                <div className="p-4" style={{ borderBottom: '1px solid #1e1e24' }}>
                  <span className="font-mono-display text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>{profiles.length} STUDENTS</span>
                </div>
                {profiles.length === 0 ? (
                  <div className="text-center py-12"><p style={{ color: 'rgba(244,249,253,0.4)' }}>No students yet</p></div>
                ) : profiles.map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-4 py-3 transition-all hover:bg-[#0a0a0b]" style={{ borderBottom: '1px solid #1e1e24' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', border: '1px solid rgba(43,175,252,0.2)' }}>
                      {p.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: '#f4f9fd' }}>{p.full_name}</div>
                      <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{p.email}</div>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="font-mono-display text-sm font-bold" style={{ color: '#2baffc' }}>{p.total_tests_taken}</div>
                      <div className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>tests</div>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="font-mono-display text-sm font-bold" style={{ color: '#55c360' }}>{p.total_score_points}</div>
                      <div className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>pts</div>
                    </div>
                    <span className="text-xs font-mono-display px-2 py-0.5 rounded flex-shrink-0" style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>{p.target_exam}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'rgba(244,249,253,0.3)' }}>
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </DashCard>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === 'true') setAuthed(true)
  }, [])
  function onSuccess() { sessionStorage.setItem('admin_auth', 'true'); setAuthed(true) }
  if (!authed) return <AdminLogin onSuccess={onSuccess} />
  return <AdminPanel />
}
