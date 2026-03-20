'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DashCard } from '@/components/ui/spotlight-card'
import { Plus, X, CheckSquare, Square, Zap } from 'lucide-react'

interface ChecklistItem {
  id: string
  subject: string
  topic: string
  is_completed: boolean
  priority: 'high' | 'medium' | 'low'
  source: 'ai' | 'manual'
  created_at: string
}

const PRIORITY_COLOR = { high: '#ff6b6b', medium: '#f59e0b', low: '#55c360' }

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: 'Physics', topic: '', priority: 'medium' as 'high' | 'medium' | 'low' })
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending')

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('study_checklist').select('*').eq('user_id', user.id).order('priority').order('created_at', { ascending: false })
    setItems((data as ChecklistItem[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggle(id: string, current: boolean) {
    await supabase.from('study_checklist').update({ is_completed: !current }).eq('id', id)
    setItems(i => i.map(item => item.id === id ? { ...item, is_completed: !current } : item))
  }

  async function addItem() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !form.topic) return
    await supabase.from('study_checklist').insert({ user_id: user.id, subject: form.subject, topic: form.topic, priority: form.priority, source: 'manual' })
    setForm(f => ({ ...f, topic: '' }))
    setShowForm(false)
    load()
  }

  async function removeItem(id: string) {
    await supabase.from('study_checklist').delete().eq('id', id)
    setItems(i => i.filter(item => item.id !== id))
  }

  const filtered = items.filter(i => {
    if (filter === 'pending') return !i.is_completed
    if (filter === 'done') return i.is_completed
    return true
  })

  const pending = items.filter(i => !i.is_completed).length
  const done = items.filter(i => i.is_completed).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="font-mono-display font-bold text-2xl mb-1" style={{ color: '#f4f9fd' }}>Study Plan</h1>
          <p className="text-sm" style={{ color: 'rgba(244,249,253,0.5)' }}>{pending} topics remaining · {done} completed</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={14} /> Add Topic
        </button>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="animate-in stagger-1">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(244,249,253,0.5)' }}>
            <span>Overall Progress</span>
            <span className="font-mono-display" style={{ color: '#55c360' }}>{Math.round((done / items.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e24' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(done / items.length) * 100}%`, background: 'linear-gradient(90deg, #2baffc, #55c360)' }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <DashCard className="animate-in" style={{ borderColor: 'rgba(43,175,252,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono-display text-sm font-bold" style={{ color: '#2baffc' }}>Add Topic</span>
            <button onClick={() => setShowForm(false)} style={{ color: 'rgba(244,249,253,0.4)' }}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>SUBJECT</label>
              <select className="input-field text-sm" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                {['Physics', 'Chemistry', 'Mathematics', 'English'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-mono-display block mb-1.5" style={{ color: 'rgba(244,249,253,0.5)' }}>TOPIC</label>
              <input className="input-field text-sm" placeholder="e.g. Rotational Motion" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            {(['high', 'medium', 'low'] as const).map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                className="px-3 py-1.5 rounded-lg text-xs font-mono-display font-bold capitalize transition-all"
                style={{
                  background: form.priority === p ? PRIORITY_COLOR[p] + '20' : 'transparent',
                  color: form.priority === p ? PRIORITY_COLOR[p] : 'rgba(244,249,253,0.4)',
                  border: `1px solid ${form.priority === p ? PRIORITY_COLOR[p] + '50' : '#1e1e24'}`,
                }}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
            <button onClick={addItem} disabled={!form.topic} className="btn-primary text-sm py-2 px-4">Add</button>
          </div>
        </DashCard>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 animate-in stagger-2">
        {(['all', 'pending', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-xs font-mono-display font-bold capitalize transition-all"
            style={{
              background: filter === f ? '#2baffc' : '#111114',
              color: filter === f ? '#010101' : 'rgba(244,249,253,0.5)',
              border: `1px solid ${filter === f ? '#2baffc' : '#1e1e24'}`,
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#111114' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <DashCard className="text-center py-12" style={{ borderColor: '#1e1e24' }}>
          <CheckSquare size={36} className="mx-auto mb-3" style={{ color: 'rgba(244,249,253,0.2)' }} />
          <p style={{ color: 'rgba(244,249,253,0.4)' }}>
            {filter === 'done' ? 'Nothing completed yet' : 'All caught up! 🎉'}
          </p>
        </DashCard>
      ) : (
        <div className="space-y-2 animate-in stagger-3">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{
                background: '#111114',
                border: `1px solid ${item.is_completed ? '#1e1e24' : PRIORITY_COLOR[item.priority] + '25'}`,
                opacity: item.is_completed ? 0.55 : 1,
              }}>
              <button onClick={() => toggle(item.id, item.is_completed)} className="flex-shrink-0">
                {item.is_completed
                  ? <CheckSquare size={18} style={{ color: '#55c360' }} />
                  : <Square size={18} style={{ color: 'rgba(244,249,253,0.3)' }} />}
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-sm" style={{ color: item.is_completed ? 'rgba(244,249,253,0.4)' : '#f4f9fd', textDecoration: item.is_completed ? 'line-through' : 'none' }}>
                  {item.topic}
                </span>
                <span className="ml-2 text-xs" style={{ color: 'rgba(244,249,253,0.35)' }}>{item.subject}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.source === 'ai' && (
                  <span className="text-xs flex items-center gap-1" style={{ color: '#2baffc' }}>
                    <Zap size={10} /> AI
                  </span>
                )}
                <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLOR[item.priority] }} />
                <button onClick={() => removeItem(item.id)} className="p-1 rounded"
                  style={{ color: 'rgba(244,249,253,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ff8080')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.2)')}>
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
