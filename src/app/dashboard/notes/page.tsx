'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Pin, BookOpen, X } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  subject_id: string | null
  tags: string[]
  is_pinned: boolean
  created_at: string
  subjects?: { name: string }
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tags: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('student_notes').select('*, subjects(name)').eq('user_id', user.id).order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    setNotes((data as Note[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveNote() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    await supabase.from('student_notes').insert({ user_id: user.id, title: form.title, content: form.content, tags })
    setForm({ title: '', content: '', tags: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deleteNote(id: string) {
    await supabase.from('student_notes').delete().eq('id', id)
    setNotes(n => n.filter(note => note.id !== id))
  }

  async function togglePin(id: string, current: boolean) {
    await supabase.from('student_notes').update({ is_pinned: !current }).eq('id', id)
    setNotes(n => n.map(note => note.id === id ? { ...note, is_pinned: !current } : note))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>Notes</h1>
          <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>Your personal study notes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={14} /> New Note
        </button>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ borderColor: 'rgba(43,175,252,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono-display text-sm font-bold" style={{ color: '#2baffc' }}>New Note</span>
            <button onClick={() => setShowForm(false)} style={{ color: 'rgba(244,249,253,0.4)' }}><X size={16} /></button>
          </div>
          <div className="space-y-3">
            <input className="input-field" placeholder="Note title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="input-field resize-none" rows={5} placeholder="Write your notes here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            <input className="input-field" placeholder="Tags (comma separated): Integration, Mechanics..." value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
              <button onClick={saveNote} disabled={!form.title || !form.content || saving} className="btn-primary text-sm py-2 px-4">
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="card h-32 animate-pulse" style={{ borderColor: '#1e1e24' }} />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="card text-center py-16" style={{ borderColor: '#1e1e24' }}>
          <BookOpen size={40} className="mx-auto mb-4" style={{ color: 'rgba(244,249,253,0.2)' }} />
          <p className="mb-4" style={{ color: 'rgba(244,249,253,0.4)' }}>No notes yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-6">Create First Note</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 animate-in stagger-1">
          {notes.map(note => (
            <div key={note.id} className="card" style={{ borderColor: note.is_pinned ? 'rgba(245,158,11,0.3)' : '#1e1e24' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm" style={{ color: '#f4f9fd' }}>{note.title}</h3>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => togglePin(note.id, note.is_pinned)} className="p-1 rounded transition-colors"
                    style={{ color: note.is_pinned ? '#f59e0b' : 'rgba(244,249,253,0.3)' }}>
                    <Pin size={13} />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-1 rounded transition-colors"
                    style={{ color: 'rgba(244,249,253,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ff8080')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.3)')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: 'rgba(244,249,253,0.55)' }}>{note.content}</p>
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: '#1e1e24', color: 'rgba(244,249,253,0.5)' }}>{t}</span>
                  ))}
                </div>
              )}
              <div className="mt-3 text-xs" style={{ color: 'rgba(244,249,253,0.25)' }}>
                {new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
