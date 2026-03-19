'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Eye, EyeOff, Users, BookOpen, BarChart3, Plus, Trash2, Edit3, X, Check, ChevronDown } from 'lucide-react'

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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass }),
    })
    if (res.ok) {
      onSuccess()
    } else {
      setError('Incorrect admin password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#010101' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(43,175,252,0.06) 0%, transparent 60%)' }} />
      <div className="w-full max-w-sm relative">
        <div className="card animate-in" style={{ borderColor: 'rgba(43,175,252,0.2)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(43,175,252,0.15)', color: '#2baffc' }}>
              <Shield size={20} />
            </div>
            <div>
              <div className="font-mono-display font-bold" style={{ color: '#f4f9fd' }}>Admin Panel</div>
              <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>ExamForge</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>
              {error}
            </div>
          )}

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
      </div>
    </div>
  )
}

// ── TYPES ──────────────────────────────────────────────────
interface Question {
  id: string; exam_type: string; subject_id: string; question_text: string
  option_a: string; option_b: string; option_c: string; option_d: string
  correct_option: string; explanation: string; difficulty: string; topic: string; year: number | null; is_active: boolean
  subjects?: { name: string }
}
interface Profile { id: string; full_name: string; email: string; target_exam: string; total_tests_taken: number; total_score_points: number; created_at: string }
interface Subject { id: string; name: string; code: string; exam_type: string }
interface MockExam { id: string; title: string; exam_type: string; duration_minutes: number; total_questions: number; is_active: boolean }

type TabType = 'overview' | 'questions' | 'exams' | 'students'

// ── MAIN ADMIN PANEL ───────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState<TabType>('overview')
  const [questions, setQuestions] = useState<Question[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [mockExams, setMockExams] = useState<MockExam[]>([])
  const [stats, setStats] = useState({ totalStudents: 0, totalTests: 0, totalQuestions: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [showQForm, setShowQForm] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: q }, { data: p }, { data: s }, { data: m }] = await Promise.all([
      supabase.from('questions').select('*, subjects(name)').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('subjects').select('*'),
      supabase.from('mock_exams').select('*').order('created_at', { ascending: false }),
    ])

    const { data: sessions } = await supabase.from('test_sessions').select('percentage').eq('status', 'completed')
    const avgScore = sessions && sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.percentage, 0) / sessions.length) : 0

    setQuestions((q as Question[]) || [])
    setProfiles((p as Profile[]) || [])
    setSubjects((s as Subject[]) || [])
    setMockExams((m as MockExam[]) || [])
    setStats({ totalStudents: p?.length || 0, totalTests: sessions?.length || 0, totalQuestions: q?.length || 0, avgScore })
    setLoading(false)
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { id: 'questions', label: `Questions (${stats.totalQuestions})`, icon: <BookOpen size={15} /> },
    { id: 'exams', label: 'Mock Exams', icon: <Edit3 size={15} /> },
    { id: 'students', label: `Students (${stats.totalStudents})`, icon: <Users size={15} /> },
  ] as const

  return (
    <div className="min-h-screen" style={{ background: '#010101' }}>
      {/* Top nav */}
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
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as TabType)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center"
              style={{
                background: tab === t.id ? '#2baffc' : 'transparent',
                color: tab === t.id ? '#010101' : 'rgba(244,249,253,0.5)',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {tab === 'overview' && <OverviewTab stats={stats} recentProfiles={profiles.slice(0, 5)} />}
            {tab === 'questions' && <QuestionsTab questions={questions} subjects={subjects} onRefresh={loadAll} showForm={showQForm} setShowForm={setShowQForm} />}
            {tab === 'exams' && <ExamsTab exams={mockExams} onRefresh={loadAll} />}
            {tab === 'students' && <StudentsTab profiles={profiles} />}
          </>
        )}
      </div>
    </div>
  )
}

// ── OVERVIEW TAB ───────────────────────────────────────────
function OverviewTab({ stats, recentProfiles }: { stats: { totalStudents: number; totalTests: number; totalQuestions: number; avgScore: number }, recentProfiles: Profile[] }) {
  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', val: stats.totalStudents, color: '#2baffc' },
          { label: 'Tests Completed', val: stats.totalTests, color: '#55c360' },
          { label: 'Questions in Bank', val: stats.totalQuestions, color: '#f59e0b' },
          { label: 'Platform Avg Score', val: `${stats.avgScore}%`, color: '#2baffc' },
        ].map(s => (
          <div key={s.label} className="card" style={{ borderColor: '#1e1e24' }}>
            <div className="text-xs mb-2" style={{ color: 'rgba(244,249,253,0.5)' }}>{s.label}</div>
            <div className="font-mono-display font-bold text-2xl" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ borderColor: '#1e1e24' }}>
        <h3 className="font-mono-display text-sm font-bold mb-4" style={{ color: '#f4f9fd' }}>Recent Registrations</h3>
        {recentProfiles.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(244,249,253,0.4)' }}>No students yet</p>
        ) : (
          <div className="space-y-3">
            {recentProfiles.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #1e1e24' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #2baffc, #55c360)', color: '#010101' }}>
                  {p.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm" style={{ color: '#f4f9fd' }}>{p.full_name}</div>
                  <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{p.email}</div>
                </div>
                <span className="text-xs font-mono-display px-2 py-0.5 rounded"
                  style={{ background: '#1e1e24', color: '#2baffc' }}>{p.target_exam}</span>
                <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>
                  {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── QUESTIONS TAB ──────────────────────────────────────────
const EMPTY_Q = { exam_type: 'JEE', subject_id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '', difficulty: 'medium', topic: '', year: '' }

function QuestionsTab({ questions, subjects, onRefresh, showForm, setShowForm }: { questions: Question[]; subjects: Subject[]; onRefresh: () => void; showForm: boolean; setShowForm: (v: boolean) => void }) {
  const [form, setForm] = useState(EMPTY_Q)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    const payload = { ...form, year: form.year ? parseInt(form.year) : null, subject_id: form.subject_id || null }
    if (editId) {
      await supabase.from('questions').update(payload).eq('id', editId)
      setEditId(null)
    } else {
      await supabase.from('questions').insert(payload)
    }
    setForm(EMPTY_Q)
    setShowForm(false)
    setSaving(false)
    onRefresh()
  }

  async function deleteQ(id: string) {
    if (!confirm('Delete this question?')) return
    await supabase.from('questions').delete().eq('id', id)
    onRefresh()
  }

  function startEdit(q: Question) {
    setForm({ ...q, year: q.year?.toString() || '', subject_id: q.subject_id || '' })
    setEditId(q.id)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const filtered = filter ? questions.filter(q => q.question_text.toLowerCase().includes(filter.toLowerCase()) || q.topic?.toLowerCase().includes(filter.toLowerCase())) : questions

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <input className="input-field max-w-xs text-sm" placeholder="Search questions..." value={filter} onChange={e => setFilter(e.target.value)} />
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_Q) }}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={14} /> Add Question
        </button>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ borderColor: 'rgba(43,175,252,0.3)' }}>
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono-display font-bold text-sm" style={{ color: '#2baffc' }}>{editId ? 'Edit Question' : 'New Question'}</span>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ color: 'rgba(244,249,253,0.4)' }}><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>EXAM TYPE</label>
                <select className="input-field text-sm" value={form.exam_type} onChange={e => upd('exam_type', e.target.value)}>
                  <option>JEE</option><option>VIT</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>SUBJECT</label>
                <select className="input-field text-sm" value={form.subject_id} onChange={e => upd('subject_id', e.target.value)}>
                  <option value="">Select...</option>
                  {subjects.filter(s => s.exam_type === form.exam_type).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>DIFFICULTY</label>
                <select className="input-field text-sm" value={form.difficulty} onChange={e => upd('difficulty', e.target.value)}>
                  <option>easy</option><option>medium</option><option>hard</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>YEAR</label>
                <input className="input-field text-sm" placeholder="2024" value={form.year} onChange={e => upd('year', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>TOPIC</label>
              <input className="input-field text-sm" placeholder="e.g. Circular Motion" value={form.topic} onChange={e => upd('topic', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>QUESTION TEXT</label>
              <textarea className="input-field resize-none text-sm" rows={4} placeholder="Enter the question..." value={form.question_text} onChange={e => upd('question_text', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map(opt => (
                <div key={opt}>
                  <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>OPTION {opt}</label>
                  <input className="input-field text-sm" placeholder={`Option ${opt}...`}
                    value={(form as Record<string, string>)[`option_${opt.toLowerCase()}`]}
                    onChange={e => upd(`option_${opt.toLowerCase()}`, e.target.value)} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>CORRECT ANSWER</label>
              <div className="flex gap-2">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <button key={opt} type="button" onClick={() => upd('correct_option', opt)}
                    className="w-10 h-10 rounded-lg font-mono-display font-bold text-sm transition-all"
                    style={{
                      background: form.correct_option === opt ? '#55c360' : '#1e1e24',
                      color: form.correct_option === opt ? '#010101' : 'rgba(244,249,253,0.5)',
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>EXPLANATION</label>
              <textarea className="input-field resize-none text-sm" rows={3} placeholder="Explain the solution..." value={form.explanation} onChange={e => upd('explanation', e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="btn-ghost text-sm py-2 px-4">Cancel</button>
              <button onClick={save} disabled={!form.question_text || !form.option_a || !form.correct_option || saving}
                className="btn-emerald flex items-center gap-2 text-sm py-2 px-4">
                <Check size={14} /> {saving ? 'Saving...' : editId ? 'Update' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ borderColor: '#1e1e24', padding: 0 }}>
        <div className="p-4" style={{ borderBottom: '1px solid #1e1e24' }}>
          <span className="font-mono-display text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
            {filtered.length} QUESTIONS
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'rgba(244,249,253,0.4)' }}>No questions found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1e1e24' }}>
            {filtered.map(q => (
              <div key={q.id} className="flex items-start gap-4 p-4 transition-all"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0a0a0b')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono-display px-1.5 py-0.5 rounded"
                      style={{ background: q.exam_type === 'JEE' ? 'rgba(43,175,252,0.15)' : 'rgba(85,195,96,0.15)', color: q.exam_type === 'JEE' ? '#2baffc' : '#55c360' }}>
                      {q.exam_type}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{q.subjects?.name}</span>
                    {q.topic && <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>· {q.topic}</span>}
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: '#f4f9fd' }}>{q.question_text}</p>
                  <div className="text-xs mt-1" style={{ color: '#55c360' }}>Correct: {q.correct_option}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(q)} className="p-2 rounded-lg transition-all"
                    style={{ color: 'rgba(244,249,253,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deleteQ(q.id)} className="p-2 rounded-lg transition-all"
                    style={{ color: 'rgba(244,249,253,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ff8080')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── EXAMS TAB ──────────────────────────────────────────────
function ExamsTab({ exams, onRefresh }: { exams: MockExam[]; onRefresh: () => void }) {
  async function toggleActive(id: string, current: boolean) {
    await supabase.from('mock_exams').update({ is_active: !current }).eq('id', id)
    onRefresh()
  }
  async function deleteExam(id: string) {
    if (!confirm('Delete this exam?')) return
    await supabase.from('mock_exams').delete().eq('id', id)
    onRefresh()
  }
  return (
    <div className="space-y-4 animate-in">
      <div className="grid md:grid-cols-2 gap-4">
        {exams.map(e => (
          <div key={e.id} className="card transition-all"
            style={{ borderColor: e.is_active ? 'rgba(85,195,96,0.2)' : '#1e1e24' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-mono-display px-2 py-0.5 rounded mb-2 inline-block"
                  style={{ background: e.exam_type === 'JEE' ? 'rgba(43,175,252,0.15)' : 'rgba(85,195,96,0.15)', color: e.exam_type === 'JEE' ? '#2baffc' : '#55c360' }}>
                  {e.exam_type}
                </span>
                <h3 className="text-sm font-semibold" style={{ color: '#f4f9fd' }}>{e.title}</h3>
              </div>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0`}
                style={{ background: e.is_active ? '#55c360' : '#ff6b6b' }} />
            </div>
            <div className="flex gap-4 text-xs mb-4" style={{ color: 'rgba(244,249,253,0.5)' }}>
              <span>{e.duration_minutes} min</span>
              <span>{e.total_questions} questions</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleActive(e.id, e.is_active)} className="btn-ghost text-xs py-1.5 px-3 flex-1">
                {e.is_active ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => deleteExam(e.id)} className="p-1.5 rounded-lg transition-all"
                style={{ color: 'rgba(244,249,253,0.3)' }}
                onMouseEnter={el => (el.currentTarget.style.color = '#ff8080')}
                onMouseLeave={el => (el.currentTarget.style.color = 'rgba(244,249,253,0.3)')}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── STUDENTS TAB ───────────────────────────────────────────
function StudentsTab({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="space-y-4 animate-in">
      <div className="card" style={{ borderColor: '#1e1e24', padding: 0 }}>
        <div className="p-4" style={{ borderBottom: '1px solid #1e1e24' }}>
          <span className="font-mono-display text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>{profiles.length} STUDENTS</span>
        </div>
        {profiles.length === 0 ? (
          <div className="text-center py-12"><p style={{ color: 'rgba(244,249,253,0.4)' }}>No students registered yet</p></div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1e1e24' }}>
            {profiles.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3 transition-all"
                onMouseEnter={e => (e.currentTarget.style.background = '#0a0a0b')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2baffc20, #55c36020)', color: '#2baffc', border: '1px solid rgba(43,175,252,0.2)' }}>
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
                  <div className="text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>points</div>
                </div>
                <span className="text-xs font-mono-display px-2 py-0.5 rounded flex-shrink-0"
                  style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>{p.target_exam}</span>
                <span className="text-xs flex-shrink-0" style={{ color: 'rgba(244,249,253,0.3)' }}>
                  {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ROOT ───────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === 'true') {
      setAuthed(true)
    }
  }, [])

  function onSuccess() {
    sessionStorage.setItem('admin_auth', 'true')
    setAuthed(true)
  }

  if (!authed) return <AdminLogin onSuccess={onSuccess} />
  return <AdminPanel />
}
