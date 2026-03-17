import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { RefreshCw, Search, ArrowLeftRight, Shield } from 'lucide-react'

interface TransferRow {
  id: string
  brand: string
  model: string
  imei?: string
  serial?: string
  from_user_name: string
  to_user_name: string
  status: string
  created_at: string
}

export default function LEATransferHistory() {
  const [rows, setRows] = useState<TransferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams()
      params.append('limit', '50')
      if (status !== 'all') params.append('status', status)

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/device-transfer/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      const transfers = (json?.transfers || []) as any[]
      const mapped = transfers.map(t => ({
        id: String(t.id),
        brand: t.brand,
        model: t.model,
        imei: t.imei,
        serial: t.serial,
        from_user_name: t.from_user_name,
        to_user_name: t.to_user_name,
        status: t.status,
        created_at: t.created_at
      }))
      setRows(mapped)
    } catch (e) {
      console.error('Failed to load LEA transfers', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const filtered = rows.filter(r => {
    const s = search.toLowerCase()
    return !s ||
      r.brand?.toLowerCase().includes(s) ||
      r.model?.toLowerCase().includes(s) ||
      r.imei?.toLowerCase().includes(s) ||
      r.serial?.toLowerCase().includes(s) ||
      r.from_user_name?.toLowerCase().includes(s) ||
      r.to_user_name?.toLowerCase().includes(s)
  })

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h4 fw-bold" style={{ color: 'var(--text-primary)' }}>Regional Ownership Transfers</h1>
            <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Transfers scoped to your LEA region</p>
          </div>
          <div className="d-flex gap-2">
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
                      <small className="text-muted">IMEI: {r.imei || 'N/A'} • Serial: {r.serial || 'N/A'}</small>
                    </td>
                    <td>{r.from_user_name}</td>
                    <td>{r.to_user_name}</td>
                    <td>
                      <span className={`badge text-bg-${r.status === 'accepted' ? 'success' : r.status === 'pending' ? 'warning' : r.status === 'rejected' ? 'danger' : 'secondary'}`}>{r.status}</span>
                    </td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
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