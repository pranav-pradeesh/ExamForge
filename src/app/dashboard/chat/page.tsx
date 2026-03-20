'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Zap, RotateCcw, Sparkles, User, FlaskConical, Calculator, Leaf, Plus, MessageSquare, Trash2, ChevronLeft } from 'lucide-react'
import { SiriOrb } from '@/components/ui/siri-orb'
import { supabase } from '@/lib/supabase'
import { DashCard } from '@/components/ui/spotlight-card'

interface Message { role: 'user' | 'assistant'; content: string }
interface ChatSession { id: string; title: string; subject: string | null; updated_at: string }

const SUBJECT_CHIPS = [
  { label: 'Physics', icon: <Zap size={12} />, color: '#2baffc', examples: ["Explain Newton's laws", 'Circular motion problems', 'Derive lens formula'] },
  { label: 'Chemistry', icon: <FlaskConical size={12} />, color: '#55c360', examples: ['Hybridization in benzene', 'Mole concept tricks', 'Organic mechanisms'] },
  { label: 'Mathematics', icon: <Calculator size={12} />, color: '#f59e0b', examples: ['Integration by parts', 'Quadratic inequalities', 'Matrix tricks'] },
  { label: 'Biology', icon: <Leaf size={12} />, color: '#ec4899', examples: ['Cell division', 'Photosynthesis vs respiration', 'DNA replication'] },
]
const STARTERS = ['Explain this concept:', 'Solve this problem:', 'Give me a trick to remember', 'What are common mistakes in']

// Simple markdown + math renderer
function MathText({ text }: { text: string }) {
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g)
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith('$$') && p.endsWith('$$')) return (
          <div key={i} className="my-2 px-3 py-2 rounded-lg text-center overflow-x-auto" style={{ background: 'rgba(43,175,252,0.08)', border: '1px solid rgba(43,175,252,0.2)' }}>
            <code className="text-sm" style={{ color: '#2baffc', fontFamily: 'JetBrains Mono, monospace' }}>{p.slice(2, -2)}</code>
          </div>
        )
        if (p.startsWith('$') && p.endsWith('$')) return (
          <code key={i} className="px-1.5 py-0.5 rounded text-xs mx-0.5" style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', fontFamily: 'JetBrains Mono, monospace' }}>{p.slice(1, -1)}</code>
        )
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}

function MessageContent({ content }: { content: string }) {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        if (line.startsWith('# ')) return <h2 key={i} className="font-mono-display font-bold text-base mt-2" style={{ color: '#f4f9fd' }}>{line.slice(2)}</h2>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-sm mt-3 mb-1" style={{ color: '#2baffc' }}>{line.slice(3)}</h3>
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2" style={{ color: '#55c360' }}>{line.slice(4)}</h4>
        if (line.startsWith('⚡')) return (
          <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg mt-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Zap size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <MathText text={line.slice(1).trim()} />
          </div>
        )
        if (line.match(/^\d+\. /)) return (
          <div key={i} className="flex gap-2 ml-2">
            <span className="font-mono-display text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: '#2baffc' }}>{line.match(/^\d+/)?.[0]}.</span>
            <MathText text={line.replace(/^\d+\. /, '')} />
          </div>
        )
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <div key={i} className="flex gap-2 ml-2">
            <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#2baffc' }} />
            <MathText text={line.slice(2)} />
          </div>
        )
        if (line.startsWith('|') && line.endsWith('|')) {
          if (line.includes('---')) return null
          const cells = line.split('|').filter(c => c.trim())
          return (
            <div key={i} className="flex overflow-x-auto">
              {cells.map((cell, ci) => (
                <div key={ci} className="px-3 py-1.5 flex-1 min-w-20 text-xs" style={{ background: ci % 2 === 0 ? '#0a0a0b' : '#111114', border: '1px solid #1e1e24', color: 'rgba(244,249,253,0.7)' }}>
                  <MathText text={cell.trim()} />
                </div>
              ))}
            </div>
          )
        }
        return <div key={i}><MathText text={line} /></div>
      })}
    </div>
  )
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { userIdRef.current = user.id; loadSessions(user.id) }
    })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadSessions(userId: string) {
    const { data } = await supabase.from('chat_sessions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(30)
    setSessions((data as ChatSession[]) || [])
  }

  async function newChat() {
    setActiveSessionId(null)
    setMessages([{
      role: 'assistant',
      content: `# Hey! I'm your ExamForge AI Tutor 👋\n\nAsk me anything about Physics, Chemistry, Mathematics, Biology for JEE, VITEEE, KEAM, CUSAT & NEET. I'll break everything down step by step.\n\nWhat would you like to study today?`,
    }])
    setInput('')
    setActiveSubject(null)
  }

  async function loadSession(session: ChatSession) {
    setLoadingHistory(true)
    setActiveSessionId(session.id)
    setActiveSubject(session.subject)
    const { data } = await supabase.from('chat_messages').select('role,content').eq('session_id', session.id).order('created_at')
    setMessages((data as Message[]) || [])
    setLoadingHistory(false)
  }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await supabase.from('chat_sessions').delete().eq('id', id)
    setSessions(s => s.filter(s => s.id !== id))
    if (activeSessionId === id) newChat()
  }

  async function ensureSession(firstUserMsg: string): Promise<string> {
    if (activeSessionId) return activeSessionId
    const userId = userIdRef.current
    if (!userId) return ''
    const title = firstUserMsg.slice(0, 50) + (firstUserMsg.length > 50 ? '…' : '')
    const { data } = await supabase.from('chat_sessions').insert({
      user_id: userId, title, subject: activeSubject, updated_at: new Date().toISOString(),
    }).select().single()
    if (data) {
      setActiveSessionId(data.id)
      setSessions(s => [data as ChatSession, ...s])
      return data.id
    }
    return ''
  }

  async function saveMessages(sessionId: string, userMsg: string, assistantMsg: string) {
    if (!sessionId) return
    await supabase.from('chat_messages').insert([
      { session_id: sessionId, role: 'user', content: userMsg },
      { session_id: sessionId, role: 'assistant', content: assistantMsg },
    ])
    await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId)
    // Update session title preview in sidebar
    setSessions(s => s.map(sess => sess.id === sessionId ? { ...sess, updated_at: new Date().toISOString() } : sess))
  }

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || streaming) return

    const userMsg: Message = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    let fullText = ''
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          subject: activeSubject,
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const { text: t } = JSON.parse(data)
              fullText += t
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: fullText }
                return updated
              })
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      fullText = 'Sorry, something went wrong. Please try again.'
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: fullText }
        return updated
      })
    }

    setStreaming(false)

    // Save to DB
    const sessionId = await ensureSession(msg)
    if (sessionId) await saveMessages(sessionId, msg, fullText)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, messages, streaming, activeSubject, activeSessionId])

  // Init with welcome message
  useEffect(() => {
    if (messages.length === 0) newChat()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeSubjectData = SUBJECT_CHIPS.find(s => s.label === activeSubject)

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-4" style={{ minHeight: '500px' }}>

      {/* ── SIDEBAR: Chat History ── */}
      <div className={`flex-shrink-0 transition-all duration-300 ${showSidebar ? 'w-60' : 'w-0 overflow-hidden'}`}>
        <DashCard glowColor="blue" className="h-full flex flex-col" style={{ padding: '16px' }}>
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <span className="font-mono-display text-xs font-bold" style={{ color: 'rgba(244,249,253,0.5)' }}>HISTORY</span>
            <button onClick={newChat}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', border: '1px solid rgba(43,175,252,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(43,175,252,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(43,175,252,0.1)')}>
              <Plus size={11} /> New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={24} className="mx-auto mb-2" style={{ color: 'rgba(244,249,253,0.15)' }} />
                <p className="text-xs" style={{ color: 'rgba(244,249,253,0.3)' }}>No history yet</p>
              </div>
            ) : sessions.map(sess => (
              <div key={sess.id}
                onClick={() => loadSession(sess)}
                className="group flex items-start gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all"
                style={{
                  background: activeSessionId === sess.id ? 'rgba(43,175,252,0.1)' : 'transparent',
                  border: `1px solid ${activeSessionId === sess.id ? 'rgba(43,175,252,0.25)' : 'transparent'}`,
                }}>
                <MessageSquare size={12} className="flex-shrink-0 mt-0.5" style={{ color: activeSessionId === sess.id ? '#2baffc' : 'rgba(244,249,253,0.3)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: activeSessionId === sess.id ? '#f4f9fd' : 'rgba(244,249,253,0.55)' }}>
                    {sess.title}
                  </p>
                  {sess.subject && (
                    <span className="text-xs mt-0.5 block" style={{ color: 'rgba(244,249,253,0.3)' }}>{sess.subject}</span>
                  )}
                </div>
                <button onClick={e => deleteSession(sess.id, e)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded transition-all"
                  style={{ color: 'rgba(244,249,253,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ff8080')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.3)')}>
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </DashCard>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(s => !s)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'rgba(244,249,253,0.4)', border: '1px solid #1e1e24' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2baffc')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,249,253,0.4)')}>
              <ChevronLeft size={14} style={{ transform: showSidebar ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
            </button>
            <SiriOrb size={48} active={streaming} speed={streaming ? 1.8 : 0.7} />
            <div>
              <h1 className="font-mono-display font-bold text-lg" style={{ color: '#f4f9fd' }}>AI Study Chat</h1>
              <p className="text-xs" style={{ color: 'rgba(244,249,253,0.4)' }}>
                {streaming ? <span style={{ color: '#2baffc' }}>Thinking...</span> : 'Llama 4 · JEE · VITEEE · KEAM · CUSAT · NEET'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(85,195,96,0.1)', color: '#55c360', border: '1px solid rgba(85,195,96,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#55c360' }} />
              Online
            </span>
            <button onClick={newChat} className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs">
              <RotateCcw size={11} /> New Chat
            </button>
          </div>
        </div>

        {/* Subject chips */}
        <div className="flex gap-2 mb-3 flex-shrink-0 overflow-x-auto pb-1">
          {SUBJECT_CHIPS.map(s => (
            <button key={s.label} onClick={() => setActiveSubject(activeSubject === s.label ? null : s.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all"
              style={{
                background: activeSubject === s.label ? s.color + '20' : '#111114',
                color: activeSubject === s.label ? s.color : 'rgba(244,249,253,0.5)',
                border: `1px solid ${activeSubject === s.label ? s.color + '50' : '#1e1e24'}`,
              }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3" style={{ minHeight: 0 }}>
          {loadingHistory ? (
            <div className="flex justify-center pt-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#2baffc', borderTopColor: 'transparent' }} />
            </div>
          ) : messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' ? (
                <div className="flex-shrink-0 mt-0.5">
                  <SiriOrb size={30} active={streaming && i === messages.length - 1} speed={streaming && i === messages.length - 1 ? 2.2 : 0.6} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(43,175,252,0.2)', border: '1px solid rgba(43,175,252,0.3)' }}>
                  <User size={14} style={{ color: '#2baffc' }} />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={{
                  background: msg.role === 'user' ? 'rgba(43,175,252,0.12)' : '#111114',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(43,175,252,0.25)' : '#1e1e24'}`,
                }}>
                {msg.role === 'assistant' ? (
                  <>
                    <MessageContent content={msg.content} />
                    {streaming && i === messages.length - 1 && !msg.content && (
                      <div className="flex gap-1 py-1">
                        {[0, 1, 2].map(d => <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#2baffc', animationDelay: `${d * 0.15}s` }} />)}
                      </div>
                    )}
                    {streaming && i === messages.length - 1 && msg.content && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: '#2baffc' }} />
                    )}
                  </>
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: '#f4f9fd' }}>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Starters */}
        {messages.length <= 1 && (
          <div className="mb-3 flex-shrink-0">
            {activeSubjectData ? (
              <div className="flex flex-wrap gap-2">
                {activeSubjectData.examples.map(ex => (
                  <button key={ex} onClick={() => sendMessage(ex)}
                    className="text-xs px-3 py-2 rounded-xl transition-all"
                    style={{ background: '#111114', color: 'rgba(244,249,253,0.6)', border: '1px solid #1e1e24' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = activeSubjectData.color + '50')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>{ex}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => { setInput(s + ' '); inputRef.current?.focus() }}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{ background: '#111114', color: 'rgba(244,249,253,0.5)', border: '1px solid #1e1e24' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2baffc40')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>{s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0">
          <div className="flex gap-3 items-end p-3 rounded-2xl" style={{ background: '#111114', border: '1px solid #1e1e24' }}>
            <textarea ref={inputRef} rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
              style={{ color: '#f4f9fd', fontFamily: 'Space Grotesk, sans-serif', maxHeight: '120px', minHeight: '24px' }}
              placeholder={activeSubject ? `Ask about ${activeSubject}...` : 'Ask anything about JEE, VITEEE, KEAM, CUSAT or NEET...'}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || streaming}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
              style={{ background: input.trim() && !streaming ? '#2baffc' : '#1e1e24', color: input.trim() && !streaming ? '#010101' : 'rgba(244,249,253,0.4)' }}>
              {streaming ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <p className="text-center text-xs mt-1.5" style={{ color: 'rgba(244,249,253,0.2)' }}>Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
