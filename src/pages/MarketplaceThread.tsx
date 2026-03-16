import { useState, useEffect, useRef } from 'react'
import { Layout } from '../components/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, ChevronRight, CheckCheck, Send, BadgeCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast, ToastContainer } from '../components/Toast'

type ChatMessage = {
  id: string
  // we'll derive 'type' from sender_id match
  sender_id: string
  content: string
  created_at: string
}

export default function MarketplaceThread() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, removeToast, showError } = useToast()
  
  const [listing, setListing] = useState<any>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id || !user) return
    fetchData()
    // Poll for messages every 5s
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [id, user])

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const fetchData = async () => {
    try {
        setLoading(true)
        await Promise.all([fetchListing(), fetchMessages()])
    } catch (err) {
        console.error(err)
        showError('Error', 'Failed to load chat')
    } finally {
        setLoading(false)
    }
  }

  const fetchListing = async () => {
      // @ts-ignore
      const data = await supabase.marketplace.get(id)
      setListing(data)
  }

  const fetchMessages = async () => {
      if (!id) return
      // @ts-ignore
      const data = await supabase.marketplace.getMessages(id)
      if (Array.isArray(data)) {
          setMessages(data)
      }
  }

  const handleSend = async () => {
    if (!input.trim() || sending) return
    
    try {
        setSending(true)
        // @ts-ignore
        await supabase.marketplace.sendMessage(id, input)
        setInput('')
        await fetchMessages()
    } catch (err: any) {
        showError('Failed to send', err.message)
    } finally {
        setSending(false)
    }
  }

  const formatTime = (iso: string) => {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading && !listing) {
      return <Layout requireAuth><div className="p-5 text-center"><div className="spinner-border"/></div></Layout>
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid h-100 d-flex flex-column" style={{ maxWidth: 900, minHeight: 'calc(100vh - 100px)' }}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        {/* Top bar */}
        <div className="d-flex align-items-center justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-decoration-none" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={22} style={{ color: 'var(--text-primary)' }} />
            </button>
            <div className="position-relative" style={{ width: 40, height: 40 }}>
              <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 40, height: 40 }}>
                 {listing?.seller_name?.[0] || 'U'}
              </div>
              <span className="position-absolute" style={{ bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: 'var(--success-500)', border: '2px solid var(--bg-primary)' }} />
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{listing?.seller_name || 'Seller'}</div>
              <div style={{ color: 'var(--success-500)', fontSize: 12 }}>{listing?.seller_verified === 'verified' ? 'Verified' : 'Online'}</div>
            </div>
          </div>
          <button className="btn btn-link text-decoration-none" aria-label="More">
            <MoreVertical size={22} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {/* Context banner */}
        {listing && (
        <div className="d-flex align-items-center gap-3 py-3 border-bottom cursor-pointer" onClick={() => navigate(`/marketplace/listing/${id}`)} style={{ borderColor: 'var(--border-color)' }}>
          <img 
            src={(Array.isArray(listing.images) && listing.images.length > 0) ? listing.images[0] : 'https://via.placeholder.com/50'} 
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/50')}
            className="rounded-3" 
            style={{ width: 48, height: 48, objectFit: 'cover' }} 
            alt="Product"
          />
          <div className="flex-grow-1">
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{listing.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{listing.currency} {listing.price?.toLocaleString()}</div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
        </div>
        )}

        {/* Chat window */}
        <div className="flex-grow-1 py-3 overflow-auto" style={{ maxHeight: '60vh' }}>
          {messages.length === 0 ? (
              <div className="text-center text-secondary mt-5">
                  <p>Start a conversation with the seller about this item.</p>
              </div>
          ) : (
            <div className="d-flex flex-column gap-3">
             {messages.map(m => {
                const isMe = m.sender_id === user?.id
                return (
                    <div key={m.id} className={`d-flex ${isMe ? 'justify-content-end' : ''} align-items-end gap-2 px-2`}>
                    {!isMe && (
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 12 }}>
                            {listing?.seller_name?.[0] || 'S'}
                        </div>
                    )}
                    <div className="d-flex flex-column" style={{ maxWidth: '80%' }}>
                        <div className={`px-3 py-2 rounded-3 ${isMe ? 'text-white' : ''}`}
                        style={{ background: isMe ? 'var(--primary-600)' : 'var(--gray-200)', color: isMe ? '#fff' : 'var(--text-primary)' }}>
                        {m.content}
                        </div>
                        <div className={`d-flex ${isMe ? 'justify-content-end' : ''} align-items-center gap-1 mt-1`}>
                        <small style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{formatTime(m.created_at)}</small>
                        {isMe && <CheckCheck size={14} style={{ color: 'var(--primary-600)' }} />}
                        </div>
                    </div>
                    </div>
                )
             })}
             <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* Footer input */}
        <div className="d-flex align-items-center gap-2 border-top py-3 mt-auto" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
          <input 
            type="text" 
            className="form-control rounded-pill" 
            placeholder="Type a message..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={sending}
          />
          <button 
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-2" 
            style={{ width: 40, height: 40 }}
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Layout>
  )
}