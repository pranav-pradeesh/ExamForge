'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Play, Clock, BookOpen, Zap, Filter, ChevronRight, Shuffle } from 'lucide-react'

interface MockExam {
  id: string; title: string; exam_type: string
  duration_minutes: number; total_questions: number; total_marks: number; instructions: string
}
interface Subject { id: string; name: string; code: string; exam_type: string; color: string; icon: string }

function ExamPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [exams, setExams] = useState<MockExam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'JEE' | 'VIT'>((params.get('type') as 'JEE' | 'VIT') || 'ALL')

  // Custom test builder
  const [showBuilder, setShowBuilder] = useState(false)
  const [builder, setBuilder] = useState({
    examType: 'JEE', subjectCode: '', topic: '', difficulty: '',
    numQuestions: 30, duration: 60,
  })
  const [buildStarting, setBuildStarting] = useState(false)
  const [buildError, setBuildError] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: e }, { data: s }] = await Promise.all([
        supabase.from('mock_exams').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
      ])
      setExams(e || [])
      setSubjects(s || [])
      setLoading(false)
    }
    load()
  }, [])

  // Load topics when subject changes
  useEffect(() => {
    async function loadTopics() {
      if (!builder.subjectCode) { setTopics([]); return }
      const subj = subjects.find(s => s.code === builder.subjectCode)
      if (!subj) return
      const { data } = await supabase
        .from('questions')
        .select('topic')
        .eq('subject_id', subj.id)
        .eq('is_active', true)
        .neq('topic', '')
      const unique = [...new Set((data || []).map((q: { topic: string }) => q.topic).filter(Boolean))].sort()
      setTopics(unique)
    }
    loadTopics()
  }, [builder.subjectCode, subjects])

  async function startExam(examId: string) {
    setStarting(examId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const exam = exams.find(e => e.id === examId)!
    const { data: session, error } = await supabase.from('test_sessions').insert({
      user_id: user.id, mock_exam_id: examId, exam_type: exam.exam_type,
      status: 'in_progress', max_score: exam.total_marks,
    }).select().single()
    if (error || !session) { setStarting(null); return }
    router.push(`/dashboard/exam/${session.id}`)
  }

  async function startCustomTest() {
    setBuildStarting(true); setBuildError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Get random questions with filters
    const subjectCodes = builder.subjectCode ? [builder.subjectCode] : null
    const res = await fetch('/api/exam/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examType: builder.examType,
        subjectCodes,
        topic: builder.topic || null,
        difficulty: builder.difficulty || null,
        limit: builder.numQuestions,
      }),
    })
    const { questions } = await res.json()
    if (!questions || questions.length === 0) {
      setBuildError('No questions found for these filters. Try different options.')
      setBuildStarting(false); return
    }

    // Create a dynamic mock exam
    const subj = subjects.find(s => s.code === builder.subjectCode)
    const title = `${builder.examType} ${subj ? subj.name : 'Mixed'} ${builder.topic ? `· ${builder.topic}` : ''} ${builder.difficulty ? `· ${builder.difficulty}` : ''}`.trim()

    const { data: mockExam } = await supabase.from('mock_exams').insert({
      title, exam_type: builder.examType,
      duration_minutes: builder.duration,
      total_questions: questions.length,
      total_marks: questions.length * 4,
      is_active: true,
      created_by: 'student',
    }).select().single()

    if (!mockExam) { setBuildError('Failed to create test'); setBuildStarting(false); return }

    // Insert questions in random order
    const mqInserts = questions.map((q: { id: string }, idx: number) => ({
      mock_exam_id: mockExam.id,
      question_id: q.id,
      question_order: idx + 1,
    }))
    await supabase.from('mock_exam_questions').insert(mqInserts)

    // Create session
    const { data: session } = await supabase.from('test_sessions').insert({
      user_id: user.id, mock_exam_id: mockExam.id,
      exam_type: builder.examType, status: 'in_progress',
      max_score: questions.length * 4,
    }).select().single()

    if (session) router.push(`/dashboard/exam/${session.id}`)
    else { setBuildError('Failed to start test'); setBuildStarting(false) }
  }

  const filtered = filter === 'ALL' ? exams : exams.filter(e => e.exam_type === filter)
  const builderSubjects = subjects.filter(s => s.exam_type === builder.examType)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-in">
        <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>Mock Tests</h1>
        <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>Full CBT simulation · random question order · AI analysis after each test</p>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap animate-in stagger-1">
        {(['ALL', 'JEE', 'VIT'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg font-mono-display text-xs font-bold transition-all"
            style={{ background: filter === f ? '#2baffc' : '#111114', color: filter === f ? '#010101' : 'rgba(244,249,253,0.5)', border: `1px solid ${filter === f ? '#2baffc' : '#1e1e24'}` }}>
            {f}
          </button>
        ))}
        <button onClick={() => setShowBuilder(!showBuilder)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono-display font-bold transition-all"
          style={{ background: showBuilder ? 'rgba(85,195,96,0.15)' : '#111114', color: showBuilder ? '#55c360' : 'rgba(244,249,253,0.6)', border: `1px solid ${showBuilder ? 'rgba(85,195,96,0.4)' : '#1e1e24'}` }}>
          <Shuffle size={12} />
          Custom Test Builder
        </button>
      </div>

      {/* Custom test builder */}
      {showBuilder && (
        <div className="card animate-in" style={{ borderColor: 'rgba(85,195,96,0.3)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(85,195,96,0.15)', color: '#55c360' }}>
              <Filter size={14} />
            </div>
            <div>
              <div className="font-mono-display font-bold text-sm" style={{ color: '#55c360' }}>Custom Test Builder</div>
              <div className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>Questions are randomly selected and shuffled</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>EXAM</label>
              <select className="input-field text-sm" value={builder.examType}
                onChange={e => setBuilder(b => ({ ...b, examType: e.target.value, subjectCode: '', topic: '' }))}>
                <option>JEE</option><option>VIT</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>SUBJECT</label>
              <select className="input-field text-sm" value={builder.subjectCode}
                onChange={e => setBuilder(b => ({ ...b, subjectCode: e.target.value, topic: '' }))}>
                <option value="">All Subjects (Mixed)</option>
                {builderSubjects.map(s => <option key={s.id} value={s.code}>{s.icon} {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>TOPIC</label>
              <select className="input-field text-sm" value={builder.topic} onChange={e => setBuilder(b => ({ ...b, topic: e.target.value }))}
                disabled={!builder.subjectCode || topics.length === 0}>
                <option value="">All Topics</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>DIFFICULTY</label>
              <select className="input-field text-sm" value={builder.difficulty} onChange={e => setBuilder(b => ({ ...b, difficulty: e.target.value }))}>
                <option value="">Mixed (All Levels)</option>
                <option value="easy">Easy only</option>
                <option value="medium">Medium only</option>
                <option value="hard">Hard only</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>NO. OF QUESTIONS</label>
              <select className="input-field text-sm" value={builder.numQuestions} onChange={e => setBuilder(b => ({ ...b, numQuestions: parseInt(e.target.value) }))}>
                {[10, 15, 20, 30, 45, 60, 90].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>DURATION</label>
              <select className="input-field text-sm" value={builder.duration} onChange={e => setBuilder(b => ({ ...b, duration: parseInt(e.target.value) }))}>
                {[15, 30, 45, 60, 90, 120, 180].map(n => <option key={n} value={n}>{n} minutes</option>)}
              </select>
            </div>
          </div>

          {buildError && <div className="mb-3 px-3 py-2 rounded text-xs" style={{ background: 'rgba(255,107,107,0.1)', color: '#ff8080', border: '1px solid rgba(255,107,107,0.2)' }}>{buildError}</div>}

          <button onClick={startCustomTest} disabled={buildStarting}
            className="btn-emerald flex items-center gap-2 py-3 px-6">
            {buildStarting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Shuffle size={14} /> Start Custom Test</>}
          </button>
        </div>
      )}

      {/* Preset exams */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="card h-48 animate-pulse" style={{ borderColor: '#1e1e24' }} />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 animate-in stagger-2">
          {filtered.map(exam => {
            const color = exam.exam_type === 'JEE' ? '#2baffc' : '#55c360'
            return (
              <div key={exam.id} className="card group transition-all duration-200"
                style={{ borderColor: '#1e1e24' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = color + '40')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono-display text-xs font-bold px-2 py-1 rounded"
                    style={{ background: color + '15', color }}>
                    {exam.exam_type}
                  </span>
                </div>
                <h3 className="font-semibold mb-3 leading-snug" style={{ color: '#f4f9fd' }}>{exam.title}</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <Clock size={12} style={{ color }} />{exam.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <BookOpen size={12} style={{ color }} />{exam.total_questions} questions
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(244,249,253,0.5)' }}>
                    <Zap size={12} style={{ color: '#f59e0b' }} />{exam.total_marks} marks
                  </div>
                </div>
                <button onClick={() => startExam(exam.id)} disabled={!!starting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono-display text-xs font-bold transition-all"
                  style={{ background: starting === exam.id ? color + '30' : color, color: starting === exam.id ? color : '#010101' }}>
                  {starting === exam.id ? (
                    <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Starting...</>
                  ) : (
                    <><Play size={12} />Start Test<ChevronRight size={12} /></>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ExamPage() {
  return <Suspense fallback={<div />}><ExamPageInner /></Suspense>
}
