import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { FileText, Search, AlertTriangle, Calendar, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

type CaseItem = {
  id: number
  case_id: string
  report_type: string
  status: string
  description?: string
  created_at: string
  location?: string
  device_brand?: string
  device_model?: string
}

export default function LEACases() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', '20')
        if (status !== 'all') params.set('status', status)
        if (type !== 'all') params.set('type', type)
        if (q.trim()) params.set('search', q.trim())
        const res = await fetch(`/api/lea-portal/cases?${params.toString()}`)
        if (!res.ok) throw new Error(`Failed to fetch cases: ${res.status}`)
        const json = await res.json()
        // support both {cases:[]} or array
        const list = Array.isArray(json) ? json : (json.cases || [])
        if (isMounted) {
          setCases(list)
          const p = (json.pagination && (json.pagination.pages || 1)) || 1
          setPages(p)
        }
      } catch (err: any) {
        console.error('LEA cases load error:', err)
        if (isMounted) setError(err.message || 'Failed to load')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, type, page])

  const filtered = useMemo(() => cases, [cases])

  return (
    <Layout requireAuth allowedRoles={["lea", "admin"]}>
      <div className="container py-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <FileText />
          <div>
            <h1 className="h5 m-0">LEA Cases</h1>
            <small className="text-secondary">Assigned and active investigations</small>
          </div>
        </div>

        <div className="modern-card p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text"><Search size={16} /></span>
                <input className="form-control" placeholder="Search by case ID, device, location" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="stolen">Stolen</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3">
            <AlertTriangle size={18} className="me-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="modern-card p-0">
          <div className="table-responsive">
            <table className="table align-middle m-0">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Type</th>
                  <th>Device</th>
                  <th>Location</th>
                  <th>Reported</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.case_id}</td>
                    <td className="text-capitalize">{c.report_type}</td>
                    <td>{c.device_brand || ''} {c.device_model || ''}</td>
                    <td>{c.location || '—'}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: 13 }}>
                        <Calendar size={14} /> {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td><span className={`status-badge ${c.status === 'resolved' ? 'status-verified' : c.status === 'under_review' ? 'status-unverified' : 'status-stolen'}`}>{c.status.replace('_',' ')}</span></td>
                    <td className="text-end">
                      <Link to={`/lea/cases/${c.case_id}`} className="btn btn-sm btn-outline-primary">Open</Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-4">No cases found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <div className="text-secondary" style={{fontSize:13}}>Page {page} of {pages}</div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(prev => Math.max(1, prev-1))} disabled={page<=1}>Prev</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(prev => Math.min(pages, prev+1))} disabled={page>=pages}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}