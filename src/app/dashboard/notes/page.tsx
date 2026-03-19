'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus, Trash2, Pin, BookOpen, X, Upload, FileText, Loader2,
  Sparkles, HelpCircle, ChevronDown, Copy, Check, Zap, Brain
} from 'lucide-react'

interface Note {
  id: string; title: string; content: string; subject_id: string | null
  tags: string[]; is_pinned: boolean; created_at: string
  subjects?: { name: string }
}

interface Flashcard { front: string; back: string; subject: string; topic: string; difficulty: string }
interface Concept { concept: string; definition: string; formula: string; example: string; examRelevance: string; topic: string }
interface PracticeQ { question: string; options: string[]; correct: string; explanation: string; difficulty: string; topic: string }

type GenerateMode = 'notes' | 'flashcards' | 'summary' | 'concepts' | 'questions'

function MathText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          return <code key={i} className="px-1 py-0.5 rounded text-xs mx-0.5" style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', fontFamily: 'JetBrains Mono, monospace' }}>{part.slice(1, -1)}</code>
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

function MarkdownRender({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />
        if (line.startsWith('# ')) return <h1 key={i} className="font-mono-display font-bold text-xl mt-4 mb-2" style={{ color: '#f4f9fd' }}>{line.slice(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i} className="font-semibold text-base mt-4 mb-2 flex items-center gap-2" style={{ color: '#2baffc' }}>{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="font-semibold text-sm mt-3 mb-1" style={{ color: '#55c360' }}>{line.slice(4)}</h3>
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <div key={i} className="flex gap-2 ml-3">
            <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{ background: '#2baffc' }} />
            <MathText text={line.slice(2)} />
          </div>
        )
        if (line.match(/^\d+\. /)) return (
          <div key={i} className="flex gap-2 ml-3">
            <span className="font-mono-display text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: '#2baffc' }}>{line.match(/^\d+/)?.[0]}.</span>
            <MathText text={line.replace(/^\d+\. /, '')} />
          </div>
        )
        if (line.startsWith('|') && line.endsWith('|')) {
          if (line.includes('---')) return null
          const cells = line.split('|').filter(c => c.trim())
          return (
            <div key={i} className="flex overflow-x-auto">
              {cells.map((cell, ci) => (
                <div key={ci} className="px-3 py-2 text-xs flex-1 min-w-20"
                  style={{ background: ci === 0 ? 'rgba(43,175,252,0.08)' : '#0a0a0b', border: '1px solid #1e1e24', color: 'rgba(244,249,253,0.75)' }}>
                  <MathText text={cell.trim()} />
                </div>
              ))}
            </div>
          )
        }
        if (line.startsWith('⚡')) return (
          <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg my-2"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Zap size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <MathText text={line.slice(1).trim()} />
          </div>
        )
        return <div key={i}><MathText text={line} /></div>
      })}
    </div>
  )
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tags: '' })
  const [saving, setSaving] = useState(false)

  // AI Notebook state
  const [activeTab, setActiveTab] = useState<'notes' | 'ai-notebook'>('notes')
  const [sourceText, setSourceText] = useState('')
  const [sourceSubject, setSourceSubject] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genMode, setGenMode] = useState<GenerateMode>('notes')
  const [generatedNotes, setGeneratedNotes] = useState<string>('')
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([])
  const [generatedConcepts, setGeneratedConcepts] = useState<Concept[]>([])
  const [generatedQuestions, setGeneratedQuestions] = useState<PracticeQ[]>([])
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set())
  const [genError, setGenError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadNotes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('student_notes').select('*, subjects(name)').eq('user_id', user.id)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    setNotes((data as Note[]) || [])
    setLoading(false)
  }

  useEffect(() => { loadNotes() }, [])

  async function saveNote() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    await supabase.from('student_notes').insert({ user_id: user.id, title: form.title, content: form.content, tags })
    setForm({ title: '', content: '', tags: '' })
    setShowForm(false); setSaving(false); loadNotes()
  }

  async function deleteNote(id: string) {
    await supabase.from('student_notes').delete().eq('id', id)
    if (activeNote?.id === id) setActiveNote(null)
    setNotes(n => n.filter(note => note.id !== id))
  }

  async function togglePin(id: string, current: boolean) {
    await supabase.from('student_notes').update({ is_pinned: !current }).eq('id', id)
    setNotes(n => n.map(note => note.id === id ? { ...note, is_pinned: !current } : note))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'text/plain') {
      const text = await file.text()
      setSourceText(text)
    } else {
      setGenError('Please upload a .txt file. For PDFs: open in browser, select all text (Ctrl+A), copy, and paste below.')
    }
  }

  async function generate() {
    if (!sourceText.trim()) { setGenError('Please provide some text'); return }
    setGenerating(true); setGenError('')
    setGeneratedNotes(''); setGeneratedFlashcards([]); setGeneratedConcepts([]); setGeneratedQuestions([])
    setFlippedCards(new Set()); setRevealedAnswers(new Set())

    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, mode: genMode, subject: sourceSubject }),
      })
      const data = await res.json()
      if (data.error) { setGenError(data.error); return }

      if (genMode === 'notes' || genMode === 'summary') setGeneratedNotes(data.result)
      else if (genMode === 'flashcards') setGeneratedFlashcards(Array.isArray(data.result) ? data.result : [])
      else if (genMode === 'concepts') setGeneratedConcepts(Array.isArray(data.result) ? data.result : [])
      else if (genMode === 'questions') setGeneratedQuestions(Array.isArray(data.result) ? data.result : [])
    } catch { setGenError('Generation failed. Please try again.') }
    finally { setGenerating(false) }
  }

  async function saveGeneratedAsNote() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !generatedNotes) return
    const title = generatedNotes.split('\n')[0].replace(/^#+\s*/, '').slice(0, 60) || 'AI Generated Notes'
    await supabase.from('student_notes').insert({
      user_id: user.id, title, content: generatedNotes,
      tags: ['AI Generated', sourceSubject || 'General'].filter(Boolean),
    })
    loadNotes()
    alert('✅ Notes saved to your notebook!')
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedNotes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const GEN_MODES: { id: GenerateMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'notes', label: 'Study Notes', icon: <BookOpen size={14} />, desc: 'Structured notes with formulas & tips' },
    { id: 'summary', label: 'Summary', icon: <FileText size={14} />, desc: 'Concise exam-focused summary' },
    { id: 'flashcards', label: 'Flashcards', icon: <Brain size={14} />, desc: 'Interactive Q&A cards' },
    { id: 'concepts', label: 'Key Concepts', icon: <Sparkles size={14} />, desc: 'Concept map with definitions' },
    { id: 'questions', label: 'Practice MCQs', icon: <HelpCircle size={14} />, desc: 'Auto-generated exam questions' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
        <button onClick={() => setActiveTab('notes')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ background: activeTab === 'notes' ? '#2baffc' : 'transparent', color: activeTab === 'notes' ? '#010101' : 'rgba(244,249,253,0.5)' }}>
          <BookOpen size={13} /> My Notes
        </button>
        <button onClick={() => setActiveTab('ai-notebook')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ background: activeTab === 'ai-notebook' ? '#2baffc' : 'transparent', color: activeTab === 'ai-notebook' ? '#010101' : 'rgba(244,249,253,0.5)' }}>
          <Sparkles size={13} /> AI Notebook
        </button>
      </div>

      {/* MY NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Sidebar list */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-mono-display font-bold text-lg" style={{ color: '#f4f9fd' }}>Notes</h1>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs">
                <Plus size={12} /> New
              </button>
            </div>

            {showForm && (
              <div className="card space-y-3" style={{ borderColor: 'rgba(43,175,252,0.3)' }}>
                <input className="input-field text-sm" placeholder="Title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <textarea className="input-field text-sm resize-none" rows={4} placeholder="Write your notes..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
                <input className="input-field text-sm" placeholder="Tags: Integration, Mechanics..." value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)} className="btn-ghost text-xs py-1.5 px-3 flex-1">Cancel</button>
                  <button onClick={saveNote} disabled={!form.title || saving} className="btn-primary text-xs py-1.5 px-3 flex-1">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#111114' }} />)}</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'rgba(244,249,253,0.15)' }} />
                <p className="text-sm mb-2" style={{ color: 'rgba(244,249,253,0.4)' }}>No notes yet</p>
                <p className="text-xs" style={{ color: 'rgba(244,249,253,0.25)' }}>Try the AI Notebook tab →</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map(note => (
                  <div key={note.id}
                    className="p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: activeNote?.id === note.id ? 'rgba(43,175,252,0.08)' : '#111114',
                      border: `1px solid ${activeNote?.id === note.id ? 'rgba(43,175,252,0.3)' : note.is_pinned ? 'rgba(245,158,11,0.2)' : '#1e1e24'}`,
                    }}
                    onClick={() => setActiveNote(note)}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium line-clamp-1" style={{ color: '#f4f9fd' }}>{note.title}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); togglePin(note.id, note.is_pinned) }}
                          style={{ color: note.is_pinned ? '#f59e0b' : 'rgba(244,249,253,0.2)' }}>
                          <Pin size={12} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                          style={{ color: 'rgba(244,249,253,0.2)' }}
                          onMouseEnter={e2 => (e2.currentTarget.style.color = '#ff8080')}
                          onMouseLeave={e2 => (e2.currentTarget.style.color = 'rgba(244,249,253,0.2)')}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(244,249,253,0.4)' }}>{note.content}</p>
                    {note.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.4)' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note viewer */}
          <div className="lg:col-span-2">
            {activeNote ? (
              <div className="card h-full" style={{ borderColor: '#1e1e24' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono-display font-bold text-lg" style={{ color: '#f4f9fd' }}>{activeNote.title}</h2>
                  <span className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>
                    {new Date(activeNote.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {activeNote.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {activeNote.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>{t}</span>
                    ))}
                  </div>
                )}
                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  <MarkdownRender content={activeNote.content} />
                </div>
              </div>
            ) : (
              <div className="card h-64 flex items-center justify-center" style={{ borderColor: '#1e1e24' }}>
                <div className="text-center">
                  <BookOpen size={40} className="mx-auto mb-3" style={{ color: 'rgba(244,249,253,0.1)' }} />
                  <p style={{ color: 'rgba(244,249,253,0.3)' }}>Select a note to read it</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI NOTEBOOK TAB */}
      {activeTab === 'ai-notebook' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-mono-display font-bold text-xl mb-1" style={{ color: '#f4f9fd' }}>
              AI Notebook
            </h1>
            <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>
              Paste text from your textbook or notes — AI generates structured study material instantly.
            </p>
          </div>

          {/* Input card */}
          <div className="card space-y-4" style={{ borderColor: '#1e1e24' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>SUBJECT</label>
                <select className="input-field text-sm" value={sourceSubject} onChange={e => setSourceSubject(e.target.value)}>
                  <option value="">Auto-detect</option>
                  {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Aptitude'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-3 flex items-end">
                <label className="btn-ghost flex items-center gap-2 py-2.5 px-4 text-sm cursor-pointer w-fit">
                  <Upload size={14} /> Upload .txt
                  <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>
                SOURCE TEXT — paste your textbook content, chapter, or notes here
              </label>
              <textarea className="input-field text-sm resize-none" rows={8}
                placeholder="Paste your study material here...

Tips:
• Copy text from PDFs, textbooks, or your own notes
• Works best with 200-2000 words
• Include formulas, definitions, and examples for best results"
                value={sourceText} onChange={e => setSourceText(e.target.value)} />
              {sourceText && <p className="text-xs mt-1" style={{ color: 'rgba(244,249,253,0.3)' }}>{sourceText.split(' ').length} words</p>}
            </div>

            {/* Mode selector */}
            <div>
              <label className="text-xs font-mono-display block mb-2" style={{ color: 'rgba(244,249,253,0.5)' }}>GENERATE</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {GEN_MODES.map(m => (
                  <button key={m.id} onClick={() => setGenMode(m.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-all"
                    style={{
                      background: genMode === m.id ? 'rgba(43,175,252,0.12)' : '#0a0a0b',
                      border: `1px solid ${genMode === m.id ? 'rgba(43,175,252,0.4)' : '#1e1e24'}`,
                      color: genMode === m.id ? '#2baffc' : 'rgba(244,249,253,0.5)',
                    }}>
                    {m.icon}
                    <span className="font-medium">{m.label}</span>
                    <span className="text-center leading-tight" style={{ color: 'rgba(244,249,253,0.3)', fontSize: '10px' }}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {genError && <div className="px-3 py-2 rounded text-xs" style={{ background: 'rgba(255,107,107,0.1)', color: '#ff8080', border: '1px solid rgba(255,107,107,0.2)' }}>{genError}</div>}

            <button onClick={generate} disabled={generating || !sourceText.trim()}
              className="btn-primary flex items-center gap-2 py-3 px-6">
              {generating
                ? <><Loader2 size={14} className="animate-spin" /> Generating with AI...</>
                : <><Sparkles size={14} /> Generate {GEN_MODES.find(m => m.id === genMode)?.label}</>}
            </button>
          </div>

          {/* Generated content */}
          {(generatedNotes || generatedFlashcards.length > 0 || generatedConcepts.length > 0 || generatedQuestions.length > 0) && (
            <div className="space-y-4">
              {/* Notes / Summary output */}
              {(genMode === 'notes' || genMode === 'summary') && generatedNotes && (
                <div className="card" style={{ borderColor: 'rgba(43,175,252,0.2)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} style={{ color: '#2baffc' }} />
                      <span className="font-mono-display font-bold text-sm" style={{ color: '#2baffc' }}>
                        AI Generated {genMode === 'summary' ? 'Summary' : 'Study Notes'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={copyToClipboard} className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs">
                        {copied ? <><Check size={12} style={{ color: '#55c360' }} /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                      <button onClick={saveGeneratedAsNote} className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs">
                        <BookOpen size={12} /> Save to Notes
                      </button>
                    </div>
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                    <MarkdownRender content={generatedNotes} />
                  </div>
                </div>
              )}

              {/* Flashcards */}
              {genMode === 'flashcards' && generatedFlashcards.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={16} style={{ color: '#55c360' }} />
                    <span className="font-mono-display font-bold text-sm" style={{ color: '#55c360' }}>{generatedFlashcards.length} Flashcards</span>
                    <span className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>· Click a card to flip it</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {generatedFlashcards.map((card, i) => {
                      const isFlipped = flippedCards.has(i)
                      return (
                        <div key={i}
                          className="p-5 rounded-xl cursor-pointer transition-all min-h-32 flex flex-col justify-between"
                          style={{
                            background: isFlipped ? 'rgba(85,195,96,0.08)' : '#111114',
                            border: `1px solid ${isFlipped ? 'rgba(85,195,96,0.3)' : '#1e1e24'}`,
                          }}
                          onClick={() => {
                            const next = new Set(flippedCards)
                            if (next.has(i)) next.delete(i); else next.add(i)
                            setFlippedCards(next)
                          }}>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono-display" style={{ color: isFlipped ? '#55c360' : '#2baffc' }}>
                                {isFlipped ? 'ANSWER' : 'QUESTION'}
                              </span>
                              <div className="flex gap-1.5">
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.4)' }}>{card.subject}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{
                                  background: card.difficulty === 'easy' ? 'rgba(85,195,96,0.1)' : card.difficulty === 'hard' ? 'rgba(255,107,107,0.1)' : 'rgba(43,175,252,0.1)',
                                  color: card.difficulty === 'easy' ? '#55c360' : card.difficulty === 'hard' ? '#ff8080' : '#2baffc',
                                }}>{card.difficulty}</span>
                              </div>
                            </div>
                            <p className="text-sm" style={{ color: '#f4f9fd' }}>
                              <MathText text={isFlipped ? card.back : card.front} />
                            </p>
                          </div>
                          <p className="text-xs mt-3" style={{ color: 'rgba(244,249,253,0.3)' }}>
                            {isFlipped ? '↺ Click to see question' : '↻ Click to reveal answer'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Key Concepts */}
              {genMode === 'concepts' && generatedConcepts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} style={{ color: '#f59e0b' }} />
                    <span className="font-mono-display font-bold text-sm" style={{ color: '#f59e0b' }}>{generatedConcepts.length} Key Concepts</span>
                  </div>
                  <div className="space-y-3">
                    {generatedConcepts.map((c, i) => (
                      <div key={i} className="card" style={{ borderColor: c.examRelevance === 'high' ? 'rgba(255,107,107,0.25)' : '#1e1e24' }}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold" style={{ color: '#f4f9fd' }}>{c.concept}</h3>
                          <span className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: c.examRelevance === 'high' ? 'rgba(255,107,107,0.1)' : c.examRelevance === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(85,195,96,0.1)',
                              color: c.examRelevance === 'high' ? '#ff8080' : c.examRelevance === 'medium' ? '#f59e0b' : '#55c360',
                            }}>
                            {c.examRelevance} priority
                          </span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'rgba(244,249,253,0.7)' }}>{c.definition}</p>
                        {c.formula && (
                          <div className="px-3 py-2 rounded-lg mb-2" style={{ background: 'rgba(43,175,252,0.08)', border: '1px solid rgba(43,175,252,0.15)' }}>
                            <span className="text-xs font-mono-display" style={{ color: '#2baffc' }}>Formula: </span>
                            <MathText text={c.formula} />
                          </div>
                        )}
                        {c.example && <p className="text-xs italic" style={{ color: 'rgba(244,249,253,0.4)' }}>Example: {c.example}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Questions */}
              {genMode === 'questions' && generatedQuestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle size={16} style={{ color: '#ec4899' }} />
                    <span className="font-mono-display font-bold text-sm" style={{ color: '#ec4899' }}>{generatedQuestions.length} Practice Questions</span>
                  </div>
                  <div className="space-y-4">
                    {generatedQuestions.map((q, i) => {
                      const revealed = revealedAnswers.has(i)
                      return (
                        <div key={i} className="card" style={{ borderColor: '#1e1e24' }}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono-display text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center"
                              style={{ background: '#1e1e24', color: '#2baffc' }}>{i + 1}</span>
                            <span className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>{q.topic}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded ml-auto"
                              style={{
                                background: q.difficulty === 'easy' ? 'rgba(85,195,96,0.1)' : q.difficulty === 'hard' ? 'rgba(255,107,107,0.1)' : 'rgba(43,175,252,0.1)',
                                color: q.difficulty === 'easy' ? '#55c360' : q.difficulty === 'hard' ? '#ff8080' : '#2baffc',
                              }}>{q.difficulty}</span>
                          </div>
                          <p className="text-sm mb-3" style={{ color: '#f4f9fd' }}>
                            <MathText text={q.question} />
                          </p>
                          <div className="space-y-2 mb-3">
                            {q.options.map((opt, oi) => {
                              const optLetter = opt.charAt(0)
                              const isCorrect = optLetter === q.correct
                              return (
                                <div key={oi} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
                                  style={{
                                    background: revealed && isCorrect ? 'rgba(85,195,96,0.1)' : '#0a0a0b',
                                    border: `1px solid ${revealed && isCorrect ? 'rgba(85,195,96,0.4)' : '#1e1e24'}`,
                                    color: revealed && isCorrect ? '#55c360' : 'rgba(244,249,253,0.6)',
                                  }}>
                                  <MathText text={opt} />
                                  {revealed && isCorrect && <Check size={12} className="ml-auto flex-shrink-0 mt-0.5" />}
                                </div>
                              )
                            })}
                          </div>
                          {revealed ? (
                            <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(43,175,252,0.06)', border: '1px solid rgba(43,175,252,0.15)', color: 'rgba(244,249,253,0.7)' }}>
                              <span className="font-mono-display font-bold" style={{ color: '#2baffc' }}>Explanation: </span>
                              {q.explanation}
                            </div>
                          ) : (
                            <button onClick={() => { const n = new Set(revealedAnswers); n.add(i); setRevealedAnswers(n) }}
                              className="text-xs flex items-center gap-1.5" style={{ color: '#2baffc' }}>
                              <ChevronDown size={12} /> Reveal Answer
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
