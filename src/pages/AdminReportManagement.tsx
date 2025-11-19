import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

type AdminReportItem = {
  id: number
  case_id: string
  report_type: string
  status: string
  brand?: string
  model?: string
  reporter_name?: string
  device_id?: number
  created_at: string
}

export default function AdminReportManagement() {
  const [reports, setReports] = useState<AdminReportItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'all'|'open'|'under_review'|'resolved'|'dismissed'>('all')
  const [type, setType] = useState<'all'|'stolen'|'lost'|'found'>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [showAssign, setShowAssign] = useState<{ reportId: number } | null>(null)
  const [leaQuery, setLeaQuery] = useState('')
  const [leaResults, setLeaResults] = useState<Array<{id:number;name:string;email:string;badge_number?:string}>>([])
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit','20')
        if (status !== 'all') params.set('status', status)
        if (type !== 'all') params.set('type', type)
        if (q.trim()) params.set('search', q.trim())
        const token = localStorage.getItem('auth_token')
        const res = await fetch(`/api/admin-dashboard/reports?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`)
        const json = await res.json()
        const list = json.reports || []
        if (isMounted) {
          setReports(list)
          const p = json.pagination?.pages || 1
          setPages(p)
        }
      } catch (err: any) {
        console.error('Admin reports load error:', err)
        if (isMounted) setError(err.message || 'Failed to load')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, q, page])

  const filtered = useMemo(() => reports, [reports])

  async function updateReportStatus(id: number, newStatus: string) {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/admin-dashboard/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    } catch (err) {
      console.error(err)
      setError('Failed to update status')
    }
  }

  async function searchLeaDirectory(query: string) {
    try {
      const res = await fetch(`/api/admin-dashboard/lea-directory?search=${encodeURIComponent(query)}`)
      const json = await res.json()
      setLeaResults(json.users || [])
    } catch (e) {
      console.error('LEA directory search failed', e)
      setLeaResults([])
    }
  }

  async function assignLeaById(reportId: number, leaId: number) {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/admin-dashboard/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ lea_assigned: leaId })
      })
      if (!res.ok) throw new Error('Failed to assign LEA')
      setShowAssign(null)
    } catch (err) {
      console.error(err)
      setError('Failed to assign LEA')
    }
  }

  return (
    <Layout requireAuth allowedRoles={["admin"]}>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">Report Management</h2>
            <p className="text-secondary m-0">Review and process device incident reports</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary">Export</button>
            <button className="btn-gradient-primary">Create Manual Report</button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3">
            <AlertTriangle size={18} className="me-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="modern-card p-3 mb-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <input className="modern-input" placeholder="Search by ID, device, reporter" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="col-12 col-md-6 d-flex gap-2 align-items-center">
              <label className="text-secondary">Status:</label>
              <select className="form-select" style={{ maxWidth: 240 }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <label className="text-secondary ms-3">Type:</label>
              <select className="form-select" style={{ maxWidth: 240 }} value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="all">All</option>
                <option value="stolen">Stolen</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modern-card p-0">
          <div className="table-responsive">
            <table className="table align-middle m-0">
              <thead>
                <tr>
                  <th scope="col">Report</th>
                  <th scope="col">Type</th>
                  <th scope="col">Device</th>
                  <th scope="col">Reporter</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.case_id}</td>
                    <td className="text-capitalize">{r.report_type}</td>
                    <td>{r.brand || ''} {r.model || ''}</td>
                    <td>{r.reporter_name || '—'}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${r.status === 'resolved' ? 'status-verified' : r.status === 'under_review' ? 'status-unverified' : 'status-stolen'}`}>{r.status.replace('_',' ')}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/admin/report-management/${r.case_id}`)}>Open</button>
                        {r.device_id && (
                          <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/admin/devices/${r.device_id}`)}>Device</button>
                        )}
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => { setShowAssign({ reportId: r.id }); setLeaQuery(''); setLeaResults([]); }}>Assign</button>
                        <button className="btn btn-sm btn-outline-success" onClick={() => updateReportStatus(r.id, 'resolved')}>Resolve</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-4">No reports match your filters</td>
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

      {showAssign && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content modern-card">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Assign LEA Officer/Team</h5>
                <button className="btn-close" onClick={() => setShowAssign(null)}></button>
              </div>
              <div className="modal-body">
                <input 
                  className="modern-input mb-2" 
                  placeholder="Search by name, email, badge number" 
                  value={leaQuery} 
                  onChange={(e) => { setLeaQuery(e.target.value); searchLeaDirectory(e.target.value); }}
                />
                <div className="list-group">
                  {leaResults.map(u => (
                    <button 
                      key={u.id} 
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => assignLeaById(showAssign.reportId, u.id)}
                    >
                      <span>
                        <span className="fw-semibold">{u.name}</span>{' '}
                        <span className="text-secondary" style={{fontSize:13}}>{u.email}</span>
                      </span>
                      {u.badge_number && (
                        <span className="badge bg-light text-dark">{u.badge_number}</span>
                      )}
                    </button>
                  ))}
                  {leaResults.length === 0 && (
                    <div className="text-secondary">Type to search LEA directory…</div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowAssign(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  )
}