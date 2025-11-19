import React, { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'

type Thread = { id: string, agency: string, unread: number, last: string }
type Message = { id: string, threadId: string, from: 'lea' | 'me', text: string, time: string }

export default function LEACommunication() {
  const threads = useMemo<Thread[]>(() => ([
    { id: 'T-001', agency: 'Lagos State Police', unread: 2, last: '2025-05-02T10:24:00Z' },
    { id: 'T-002', agency: 'Abuja FCT Police', unread: 0, last: '2025-05-01T14:12:00Z' },
    { id: 'T-003', agency: 'Interpol Nigeria', unread: 1, last: '2025-04-28T09:00:00Z' },
  ]), [])

  const initialMessages = useMemo<Message[]>(() => ([
    { id: 'M-1', threadId: 'T-001', from: 'lea', text: 'We received your device verification request.', time: '2025-05-02T10:10:00Z' },
    { id: 'M-2', threadId: 'T-001', from: 'me', text: 'Thanks. Do you need additional documents?', time: '2025-05-02T10:20:00Z' },
    { id: 'M-3', threadId: 'T-001', from: 'lea', text: 'Please upload proof of purchase.', time: '2025-05-02T10:24:00Z' },
    { id: 'M-4', threadId: 'T-002', from: 'lea', text: 'Incident report acknowledged.', time: '2025-05-01T14:12:00Z' },
    { id: 'M-5', threadId: 'T-003', from: 'lea', text: 'Global registry check ongoing.', time: '2025-04-28T09:00:00Z' },
  ]), [])

  const [activeId, setActiveId] = useState('T-001')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const activeMessages = messages.filter(m => m.threadId === activeId)

  const send = () => {
    if (!draft.trim()) return
    const msg: Message = {
      id: `M-${messages.length + 1}`,
      threadId: activeId,
      from: 'me',
      text: draft.trim(),
      time: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setDraft('')
  }

  return (
    <Layout requireAuth allowedRoles={["lea"]}>
      <div className="container py-4">
        <h2 className="fw-bold mb-3">LEA Communication</h2>

        <div className="row g-3">
          <div className="col-12 col-lg-4">
            <div className="modern-card p-0">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <strong>Conversations</strong>
                <a className="btn btn-sm btn-outline-primary" href="#/verification-status">View Requests</a>
              </div>
              <div className="list-group list-group-flush">
                {threads.map(t => (
                  <button key={t.id} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeId === t.id ? 'active' : ''}`} onClick={() => setActiveId(t.id)}>
                    <span>{t.agency}</span>
                    <span className="d-flex align-items-center gap-2">
                      {t.unread > 0 && <span className="badge bg-danger">{t.unread}</span>}
                      <small className="text-secondary">{new Date(t.last).toLocaleDateString()}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-8">
            <div className="modern-card p-0 h-100 d-flex flex-column">
              <div className="p-3 border-bottom">
                <strong>{threads.find(t => t.id === activeId)?.agency}</strong>
                <div className="text-secondary">Secure channel • End-to-end encrypted</div>
              </div>
              <div className="p-3 flex-grow-1" style={{ minHeight: 320 }}>
                <div className="d-flex flex-column gap-2">
                  {activeMessages.map(m => (
                    <div key={m.id} className={`d-flex ${m.from === 'me' ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`glass-card p-2 ${m.from === 'me' ? 'bg-primary-subtle' : ''}`} style={{ maxWidth: '75%' }}>
                        <div>{m.text}</div>
                        <small className="text-secondary">{new Date(m.time).toLocaleTimeString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 border-top">
                <div className="d-flex align-items-center gap-2">
                  <input className="modern-input" placeholder="Type a message" value={draft} onChange={e => setDraft(e.target.value)} />
                  <button className="btn btn-primary" type="button" onClick={send}>Send</button>
                </div>
                <div className="mt-2 d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" type="button">Attach File</button>
                  <button className="btn btn-sm btn-outline-secondary" type="button">Request Evidence</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}