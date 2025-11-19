import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Filter, RefreshCw, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface InboxMessage {
  id: string
  device_id?: string
  device_title?: string
  from_name: string
  from_contact?: string
  subject: string
  message: string
  status: 'unread' | 'read'
  created_at: string
  online?: boolean
}

export default function MarketplaceInbox() {
  const [items, setItems] = useState<InboxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [search, setSearch] = useState('')
  const { toasts, removeToast, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Placeholder: no backend route yet; show sample data
    const sample: InboxMessage[] = [
      {
        id: 'msg_1',
        device_id: 'dev_123',
        device_title: 'Samsung S22 - Blue',
        from_name: 'Jane Doe',
        from_contact: '+233 555 123 456',
        subject: 'Interested in your device',
        message: 'Hi, is this device still available? Can we meet at Accra Mall?',
        status: 'unread',
        created_at: new Date().toISOString(),
        online: true
      },
      {
        id: 'msg_2',
        device_id: 'dev_987',
        device_title: 'iPhone 12 - Black',
        from_name: 'Kofi Mensah',
        subject: 'Can you share more photos?',
        message: 'Please send additional photos and battery health.',
        status: 'read',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        online: false
      }
    ]
    setItems(sample)
    setLoading(false)
  }, [])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    let list = items
    if (filter !== 'all') list = list.filter(i => i.status === filter)
    if (s) list = list.filter(i => [i.subject, i.message, i.device_title || '', i.from_name].some(v => v.toLowerCase().includes(s)))
    return list
  }, [items, filter, search])

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    const first = parts[0]?.charAt(0).toUpperCase() || ''
    const second = parts[1]?.charAt(0).toUpperCase() || ''
    return `${first}${second}` || first
  }

  const refresh = async () => {
    try {
      setLoading(true)
      // future: fetch from backend endpoint
      setLoading(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error refreshing inbox'
      setError(msg)
      showError('Inbox Error', msg)
      setLoading(false)
    }
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold" style={{ color: 'var(--text-primary)' }}>Marketplace Inbox</h1>
              <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Manage buyer inquiries and messages</p>
            </div>
            <div className="d-flex gap-2">
              <button onClick={refresh} className="btn btn-outline-secondary d-flex align-items-center gap-2"><RefreshCw size={16} /> Refresh</button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="modern-card p-3 mb-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Search</label>
              <div className="input-group">
                <span className="input-group-text"><Search size={16} /></span>
                <input value={search} onChange={e => setSearch(e.target.value)} className="form-control" placeholder="Subject, message, device, sender" />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <div className="d-flex align-items-center gap-2">
                <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
                <select value={filter} onChange={e => setFilter(e.target.value as 'all' | 'read' | 'unread')} className="form-select">
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation list inspired by mobile_app/marketplace_inbox */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--primary-600)' }} />
            <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Loading inbox…</p>
          </div>
        ) : error ? (
          <div className="modern-card p-4 text-center" style={{ color: 'var(--danger-500)' }}>{error}</div>
        ) : (
          <div className="modern-card p-0 position-relative">
            <AnimatePresence>
              {filtered.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="p-3 d-flex align-items-center gap-3 justify-between rounded inbox-item"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                  onClick={() => navigate(`/marketplace-inbox/${m.id}`)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                      <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 56, height: 56, backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary-700)', fontWeight: 700 }}>
                        {getInitials(m.from_name)}
                      </div>
                      {m.online && (
                        <span className="position-absolute" style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: 'var(--success-500)', bottom: 0, right: 0, border: '2px solid var(--bg-primary)' }} />
                      )}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.from_name}</p>
                      <p className="mb-0" style={{ color: 'var(--primary-600)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.subject}</p>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</p>
                      {m.device_title && (
                        <small className="text-muted" style={{ fontSize: 12 }}>Device: {m.device_title}</small>
                      )}
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-2">
                    <small style={{ color: 'var(--text-tertiary)' }}>{new Date(m.created_at).toLocaleString()}</small>
                    {m.status === 'unread' && (
                      <div className="d-flex align-items-center justify-content-center" style={{ minWidth: 28, height: 24, borderRadius: 12, background: 'var(--primary-600)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '0 8px' }}>Unread</div>
                    )}
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>No messages</div>
              )}
            </AnimatePresence>

            {/* Floating compose button */}
            <button
              className="btn-gradient-primary d-flex align-items-center gap-2"
              style={{ position: 'sticky', bottom: 16, left: 'calc(100% - 64px)', width: 56, height: 56, borderRadius: 28, justifyContent: 'center' }}
              title="Compose"
              onClick={() => showError('Compose', 'Compose modal is coming soon')}
            >
              <Plus size={22} />
            </button>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}