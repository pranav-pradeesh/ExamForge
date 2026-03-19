'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Zap, RotateCcw, Sparkles, User } from 'lucide-react'
import { SiriOrb } from '@/components/ui/siri-orb'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUBJECT_CHIPS = [
  { label: 'Physics', icon: <Zap size={12} />, color: '#2baffc', examples: ['Explain Newton\'s laws with examples', 'How to solve circular motion problems?', 'Derive the lens formula'] },
  { label: 'Chemistry', icon: <FlaskConical size={12} />, color: '#55c360', examples: ['Explain hybridization in benzene', 'Mole concept shortcut tricks', 'Organic reaction mechanisms'] },
  { label: 'Mathematics', icon: <Calculator size={12} />, color: '#f59e0b', examples: ['Integration by parts explained', 'How to solve quadratic inequalities?', 'Matrix multiplication tricks'] },
  { label: 'Biology', icon: <Leaf size={12} />, color: '#ec4899', examples: ['Cell division explained simply', 'Photosynthesis vs respiration', 'DNA replication steps'] },
]

const STARTERS = [
  'Explain this concept step by step:',
  'Solve this problem:',
  'What is the difference between',
  'Give me a trick to remember',
  'What are common mistakes in',
  'How is this topic important for JEE/VIT?',
]

// Simple math renderer
function MathText({ text }: { text: string }) {
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return (
            <div key={i} className="my-2 px-3 py-2 rounded-lg text-center overflow-x-auto"
              style={{ background: 'rgba(43,175,252,0.08)', border: '1px solid rgba(43,175,252,0.2)' }}>
              <code className="text-sm" style={{ color: '#2baffc', fontFamily: 'JetBrains Mono, monospace' }}>
                {part.slice(2, -2)}
              </code>
            </div>
          )
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return (
            <code key={i} className="px-1.5 py-0.5 rounded text-xs mx-0.5"
              style={{ background: 'rgba(43,175,252,0.1)', color: '#2baffc', fontFamily: 'JetBrains Mono, monospace' }}>
              {part.slice(1, -1)}
            </code>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

// Render markdown-ish message content
function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        if (line.startsWith('# ')) return <h2 key={i} className="font-mono-display font-bold text-base mt-2" style={{ color: '#f4f9fd' }}>{line.slice(2)}</h2>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-sm mt-3 mb-1" style={{ color: '#2baffc' }}>{line.slice(3)}</h3>
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2" style={{ color: '#55c360' }}>{line.slice(4)}</h4>
        if (line.startsWith('⚡ Exam Tip:')) return (
          <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg mt-2"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Zap size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <MathText text={line.slice(12)} />
          </div>
        )
        if (line.match(/^\d+\. /)) return (
          <div key={i} className="flex gap-2 ml-2">
            <span className="font-mono-display text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: '#2baffc' }}>
              {line.match(/^\d+/)?.[0]}.
            </span>
            <MathText text={line.replace(/^\d+\. /, '')} />
          </div>
        )
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <div key={i} className="flex gap-2 ml-2">
            <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#2baffc' }} />
            <MathText text={line.slice(2)} />
          </div>
        )
        if (line.startsWith('**') && line.endsWith('**')) return (
          <strong key={i} className="font-semibold" style={{ color: '#f4f9fd' }}><MathText text={line.slice(2, -2)} /></strong>
        )
        if (line.startsWith('`') && line.endsWith('`') && !line.includes('``')) return (
          <code key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: '#1e1e24', color: '#55c360', fontFamily: 'JetBrains Mono, monospace' }}>
            {line.slice(1, -1)}
          </code>
        )
        // Handle | table rows
        if (line.startsWith('|') && line.endsWith('|')) {
          if (line.includes('---')) return null
          const cells = line.split('|').filter(c => c.trim())
          return (
            <div key={i} className="flex gap-0 text-xs overflow-x-auto">
              {cells.map((cell, ci) => (
                <div key={ci} className="px-3 py-1.5 flex-1 min-w-24"
                  style={{ background: ci % 2 === 0 ? '#0a0a0b' : '#111114', border: '1px solid #1e1e24', color: 'rgba(244,249,253,0.7)' }}>
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `# Hey! I'm your ExamForge AI Tutor 👋

I can help you with **Physics, Chemistry, Mathematics, Biology** and more for JEE & VIT prep.

Ask me anything — concept explanations, problem solving, formula derivations, exam tips, or tricky questions. I'll break everything down step by step.

What would you like to study today?`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || streaming) return

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    // Add empty assistant message to stream into
    const assistantMsg: Message = { role: 'assistant', content: '', timestamp: new Date() }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          subject: activeSubject,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const { text } = JSON.parse(data)
              fullText += text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...assistantMsg, content: fullText }
                return updated
              })
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...assistantMsg, content: 'Sorry, I ran into an issue. Please try again.' }
        return updated
      })
    }
    setStreaming(false)
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! What would you like to study?',
      timestamp: new Date(),
    }])
  }

  const activeSubjectData = SUBJECT_CHIPS.find(s => s.label === activeSubject)

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)]" style={{ minHeight: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* SiriOrb — pulses when AI is streaming */}
          <div className="relative flex-shrink-0">
            <SiriOrb
              size={52}
              active={streaming}
              speed={streaming ? 1.8 : 0.8}
            />
            {streaming && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ background: '#010101' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#55c360' }} />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-mono-display font-bold text-xl" style={{ color: '#f4f9fd' }}>
              AI Study Chat
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(244,249,253,0.4)' }}>
              {streaming
                ? <span style={{ color: '#2baffc' }}>Thinking...</span>
                : 'Powered by Llama 4 · Ask anything about JEE & VIT'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(85,195,96,0.1)', color: '#55c360', border: '1px solid rgba(85,195,96,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
          <button onClick={clearChat} className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs">
            <RotateCcw size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Subject chips */}
      <div className="flex gap-2 mb-3 flex-shrink-0 overflow-x-auto pb-1">
        {SUBJECT_CHIPS.map(s => (
          <button key={s.label}
            onClick={() => setActiveSubject(activeSubject === s.label ? null : s.label)}
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
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4" style={{ minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {msg.role === 'assistant' ? (
              <div className="flex-shrink-0 mt-0.5">
                <SiriOrb
                  size={32}
                  active={streaming && i === messages.length - 1}
                  speed={streaming && i === messages.length - 1 ? 2 : 0.7}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(43,175,252,0.2)', border: '1px solid rgba(43,175,252,0.3)' }}>
                <User size={14} style={{ color: '#2baffc' }} />
              </div>
            )}

            {/* Bubble */}
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
                      {[0, 1, 2].map(d => (
                        <div key={d} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ background: '#2baffc', animationDelay: `${d * 0.15}s` }} />
                      ))}
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

      {/* Quick starters (show when only 1 message) */}
      {messages.length === 1 && (
        <div className="mb-3 flex-shrink-0">
          {activeSubjectData ? (
            <div className="flex flex-wrap gap-2">
              {activeSubjectData.examples.map(ex => (
                <button key={ex} onClick={() => sendMessage(ex)}
                  className="text-xs px-3 py-2 rounded-xl transition-all text-left"
                  style={{ background: '#111114', color: 'rgba(244,249,253,0.6)', border: '1px solid #1e1e24' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = activeSubjectData.color + '50')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>
                  {ex}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {STARTERS.map(s => (
                <button key={s} onClick={() => { setInput(s + ' '); inputRef.current?.focus() }}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{ background: '#111114', color: 'rgba(244,249,253,0.5)', border: '1px solid #1e1e24' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#2baffc50')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e24')}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="flex gap-3 items-end p-3 rounded-2xl"
          style={{ background: '#111114', border: '1px solid #1e1e24' }}>
          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{
              color: '#f4f9fd', fontFamily: 'Space Grotesk, sans-serif',
              maxHeight: '120px', minHeight: '24px',
            }}
            placeholder={activeSubject ? `Ask about ${activeSubject}...` : 'Ask anything about JEE & VIT...'}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: input.trim() && !streaming ? '#2baffc' : '#1e1e24', color: input.trim() && !streaming ? '#010101' : 'rgba(244,249,253,0.4)' }}>
            {streaming
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Send size={15} />}
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: 'rgba(244,249,253,0.2)' }}>
          Press Enter to send · Shift+Enter for new line · Select a subject above for focused help
        </p>
      </div>
    </div>
  )
}
