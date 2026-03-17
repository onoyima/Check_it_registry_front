import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { RefreshCw, Search, ArrowLeftRight, Shield } from 'lucide-react'

interface TransferRow {
  id: string
  device_id: string
  brand: string
  model: string
  imei?: string
  serial?: string
  category?: string
  from_user_name: string
  from_user_email: string
  to_user_name: string
  to_user_email: string
  status: string
  created_at: string
  accepted_at?: string
  rejected_at?: string
}

export default function AdminTransferHistory() {
  const [rows, setRows] = useState<TransferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams()
      params.append('limit', '50')
      // Map UI statuses to unified backend statuses
      const statusMap: Record<string, string> = {
        pending: 'active',
        accepted: 'completed',
        rejected: 'rejected',
        expired: 'expired',
        cancelled: 'cancelled',
      }
      if (status !== 'all') params.append('status', statusMap[status] || status)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)

      // Use unified API base URL (env or default 3001)
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || '/api')
      const res = await fetch(`${API_URL}/device-transfer/history?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const json = await res.json()
      const transfers = (json?.transfers || []) as any[]
      const mapped = transfers.map(t => ({
        id: String(t.id),
        device_id: String(t.device_id),
        brand: t.brand,
        model: t.model,
        imei: t.imei,
        serial: t.serial,
        category: t.category,
        from_user_name: t.from_user_name,
        from_user_email: t.from_user_email,
        to_user_name: t.to_user_name,
        to_user_email: t.to_user_email,
        status: t.status,
        created_at: t.created_at,
        accepted_at: t.accepted_at,
        rejected_at: t.rejected_at
      }))
      setRows(mapped)
    } catch (e) {
      console.error('Failed to load transfers', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Distinct categories derived from device category
  const categories = useMemo(() => {
    const set = new Set<string>()
    rows.forEach(r => { if (r.category) set.add(r.category) })
    return Array.from(set)
  }, [rows])

  const filtered = rows.filter(r => {
    const s = search.toLowerCase()
    return !s ||
      r.brand?.toLowerCase().includes(s) ||
      r.model?.toLowerCase().includes(s) ||
      r.imei?.toLowerCase().includes(s) ||
      r.serial?.toLowerCase().includes(s) ||
      r.from_user_email?.toLowerCase().includes(s) ||
      r.to_user_email?.toLowerCase().includes(s)
  }).filter(r => selectedCategory === 'all' ? true : r.category === selectedCategory)

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h4 fw-bold" style={{ color: 'var(--text-primary)' }}>Ownership Transfers</h1>
            <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>All device ownership transfer records</p>
          </div>
          <div className="d-flex gap-2">
            <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button onClick={loadData} className="btn btn-outline-primary d-flex align-items-center gap-2">
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div className="modern-card p-3 mb-3">
          <div className="input-group">
            <span className="input-group-text"><Search size={16} /></span>
            <input className="form-control" placeholder="Search by device or user" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border" style={{ color: 'var(--primary-600)' }} />
          </div>
        ) : (
          <div className="modern-card p-0">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th style={{ width: '28px' }}><Shield size={16} /></th>
                  <th>Device</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><ArrowLeftRight size={16} style={{ color: 'var(--primary-600)' }} /></td>
                    <td>
                      <div className="fw-semibold">{r.brand} {r.model}</div>
                      <div className="mt-1">
                        <span className="badge text-bg-secondary">{r.category || '—'}</span>
                      </div>
                      <small className="text-muted">IMEI: {r.imei || 'N/A'} • Serial: {r.serial || 'N/A'}</small>
                    </td>
                    <td>
                      <div className="fw-semibold">{r.from_user_name}</div>
                      <small className="text-muted">{r.from_user_email}</small>
                    </td>
                    <td>
                      <div className="fw-semibold">{r.to_user_name}</div>
                      <small className="text-muted">{r.to_user_email}</small>
                    </td>
                    <td>
                      <span className={`badge text-bg-${r.status === 'completed' ? 'success' : r.status === 'active' ? 'warning' : r.status === 'rejected' ? 'danger' : r.status === 'expired' ? 'dark' : r.status === 'cancelled' ? 'secondary' : 'secondary'}`}>{r.status}</span>
                    </td>
                    <td>
                      <div>{new Date(r.created_at).toLocaleString()}</div>
                      {r.accepted_at && <small className="text-muted">Accepted: {new Date(r.accepted_at).toLocaleString()}</small>}
                      {r.rejected_at && <small className="text-muted">Rejected: {new Date(r.rejected_at).toLocaleString()}</small>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted p-4">No transfers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}