import { useEffect, useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Smartphone, Search, Filter, User, CheckCircle, XCircle, Clock, Tag } from 'lucide-react'
import { ToastContainer, useToast } from '../components/Toast'

interface AdminDevice {
  id: string
  brand: string
  model: string
  imei?: string
  serial?: string
  owner_name: string
  owner_email?: string
  owner_phone?: string
  status: 'unverified' | 'verified'
  created_at?: string
  updated_at?: string
  verified_at?: string
  category?: string
}

export default function AdminDeviceManagement() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | AdminDevice['status']>('all')
  const [category, setCategory] = useState('')
  const [modelQuery, setModelQuery] = useState('')
  const [categories, setCategories] = useState<{ key: string; label: string }[]>([])
  const [devices, setDevices] = useState<AdminDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null)
  const { toasts, removeToast, showError, showSuccess } = useToast()

  // Unified API base
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

  // Reporting state
  const [reportingDeviceId, setReportingDeviceId] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'stolen' | 'lost' | 'found'>('stolen')
  const [reportDescription, setReportDescription] = useState('')

  // Edit modal state
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    brand: string
    model: string
    color?: string
    category?: string
    imei?: string
    serial?: string
    device_image_url?: string
    proof_url?: string
    status?: AdminDevice['status'] | 'found'
  }>({ brand: '', model: '' })

  const startEdit = (d: AdminDevice) => {
    setEditingDeviceId(d.id)
    setEditForm({
      brand: d.brand || '',
      model: d.model || '',
      color: undefined,
      category: d.category || '',
      imei: d.imei || '',
      serial: d.serial || '',
      device_image_url: undefined,
      proof_url: undefined,
      status: d.status
    })
  }

  const submitEdit = async () => {
    if (!editingDeviceId) return
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')
      const res = await fetch(`${API_URL}/admin-portal/devices/${editingDeviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update device')
      }
      setDevices(prev => prev.map(d => d.id === editingDeviceId ? { ...d, ...data } : d))
      setEditingDeviceId(null)
      showSuccess('Device Updated', 'Device details saved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update device'
      showError('Update Error', msg)
    }
  }

  useEffect(() => {
    loadDevices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, category, query, modelQuery])

  // Sync route param to category filter
  useEffect(() => {
    if (categoryKey) {
      setCategory(categoryKey)
    }
  }, [categoryKey])

  // Load categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return
        const res = await fetch(`${API_URL}/device-management/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        const opts = Array.isArray(data) ? data : []
        setCategories(opts)
      } catch {}
    }
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', String(limit))
      if (status !== 'all') params.append('status', status)
      if (category) params.append('category', category)
      if (query) params.append('search', query)
      if (modelQuery) params.append('model', modelQuery)

      const res = await fetch(`${API_URL}/admin-portal/devices?${params.toString()}` , {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch devices')
      const json = await res.json()
      const list: AdminDevice[] = json?.devices || json?.data?.devices || []
      setDevices(list)
      const pg = json?.pagination || json?.data?.pagination
      if (pg) {
        setPagination({
          page: parseInt(String(pg.page || page)),
          limit: parseInt(String(pg.limit || limit)),
          total: parseInt(String(pg.total || list.length)),
          pages: parseInt(String(pg.pages || Math.max(1, Math.ceil((pg.total || list.length) / (pg.limit || limit)))))
        })
      } else {
        setPagination(null)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading verification queue'
      setError(msg)
      showError('Loading Error', msg)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return devices.filter(d => {
      const matchesQuery = `${d.brand} ${d.model} ${d.imei || ''} ${d.serial || ''} ${d.owner_name}`.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || d.status === status
      const matchesCategory = !category || d.category === category
      return matchesQuery && matchesStatus && matchesCategory
    })
  }, [devices, query, status, category])

  const handleCreateReport = async (deviceId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')
      const body = {
        device_id: deviceId,
        report_type: reportType,
        description: reportDescription || `${reportType} device reported by admin`,
        occurred_at: new Date().toISOString()
      }
      const res = await fetch(`${API_URL}/report-management`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to create report')
      }
      setReportingDeviceId(null)
      setReportDescription('')
      showSuccess('Report Created', 'The device report has been created')
      // Refresh device list to reflect any changes
      await loadDevices()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create report'
      showError('Report Error', msg)
    }
  }

  const statusColor = (s: AdminDevice['status']) => {
    switch (s) {
      case 'verified': return 'var(--success-500)'
      case 'unverified': return 'var(--warning-500)'
      default: return 'var(--text-secondary)'
    }
  }

  const handleResendVerificationEmail = async (deviceId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const res = await fetch(`${API_URL}/admin-portal/resend-device-verification/${deviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to resend verification email')
      }
      showSuccess('Email Sent', 'Verification email resent to the owner')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend verification email'
      showError('Email Error', msg)
    }
  }

  const handleVerify = async (deviceId: string, approved: boolean) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/admin-portal/verify-device/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      })
      if (!res.ok) throw new Error('Failed to update device verification')
      const updated = await res.json()

      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: updated.status || (approved ? 'verified' : 'unverified'), verified_at: updated.verified_at, updated_at: updated.updated_at } : d))
      showSuccess(approved ? 'Device Verified' : 'Verification Rejected', approved ? 'The device is now verified.' : 'Verification rejected; device remains unverified.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Action failed'
      showError('Action Error', msg)
    }
  }

  return (
    <Layout>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
            <div className="d-flex align-items-center gap-2 mb-2 mb-sm-0">
              <Smartphone />
              <div>
                <h2 className="h4 mb-0">Admin • Device Management</h2>
                <small className="text-secondary">Browse by category, filter, edit, report</small>
              </div>
            </div>
            <div className="text-muted" style={{ fontSize: '13px' }}>
              Queue, actions, filters
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="modern-card p-3 mb-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Link to="/admin/device-management" className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-outline-primary'}`}>All</Link>
            {categories.map(c => (
              <Link key={c.key} to={`/admin/device-management/category/${c.key}`} className={`btn btn-sm ${category === c.key ? 'btn-primary' : 'btn-outline-primary'}`}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="modern-card p-3 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                <Search size={16} className="me-2" />
                Search Devices
              </label>
              <input
                className="modern-input"
                placeholder="Search by brand, model, IMEI, or owner"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                <Filter size={16} className="me-2" />
                Model
              </label>
              <input
                className="modern-input"
                placeholder="Filter by model"
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                <Filter size={16} className="me-2" />
                Status
              </label>
              <select
                className="modern-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                <Filter size={16} className="me-2" />
                Category
              </label>
              <select
                className="modern-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categories.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <button
                onClick={() => { setQuery(''); setModelQuery(''); setStatus('all'); setCategory(''); setPage(1); setRefreshing(true); loadDevices().finally(() => setRefreshing(false)); navigate('/admin/device-management'); }}
                className="btn btn-outline-secondary w-100"
              >
                {refreshing ? 'Refreshing...' : 'Clear Filters & Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="modern-card">
          <div className="p-3 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
            <h3 className="h6 mb-0" style={{ color: 'var(--text-primary)' }}>
              {loading ? 'Loading devices...' : `Devices (${filtered.length})`}
            </h3>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                <tr>
                  <th className="border-0">Device</th>
                  <th className="border-0">Owner</th>
                  <th className="border-0">Status</th>
                  <th className="border-0">Last Update</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.map(d => (
                  <tr key={d.id} style={{ borderBottomColor: 'var(--border-color)' }}>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ color: 'var(--text-primary)' }}>{d.brand} {d.model}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>
                            <Tag size={12} className="me-1" /> IMEI: {d.imei || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <User size={16} />
                        <div>
                          <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{d.owner_name}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>{d.owner_email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="badge px-3 py-2" style={{ backgroundColor: `${statusColor(d.status)}20`, color: statusColor(d.status), fontSize: '12px' }}>
                        {d.status === 'unverified' ? 'Unverified' : 'Verified'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <Clock size={14} />{new Date(d.updated_at || d.created_at || Date.now()).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex gap-2 justify-content-end">
                        <Link to={`/admin/devices/${d.id}`} className="btn btn-sm btn-outline-info" title="View Device">
                          View
                        </Link>
                        <button className="btn btn-sm btn-outline-success" title="Verify" onClick={() => handleVerify(d.id, true)}>
                          <CheckCircle size={14} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" title="Reject" onClick={() => handleVerify(d.id, false)}>
                          <XCircle size={14} />
                        </button>
                        <button className="btn btn-sm btn-outline-primary" title="Report" onClick={() => setReportingDeviceId(prev => prev === d.id ? null : d.id)}>
                          Report
                        </button>
                        <button className="btn btn-sm btn-outline-warning" title="Mark Found" onClick={async () => {
                          try {
                            const token = localStorage.getItem('auth_token')
                            if (!token) throw new Error('No authentication token found')
                            const res = await fetch(`${API_URL}/admin-portal/devices/${d.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ status: 'found' })
                            })
                            if (!res.ok) throw new Error('Failed to mark device as found')
                            const updated = await res.json()
                            setDevices(prev => prev.map(x => x.id === d.id ? { ...x, status: updated.status, updated_at: updated.updated_at } as AdminDevice : x))
                            showSuccess('Device Flagged', 'Device marked as found')
                          } catch (err) {
                            const msg = err instanceof Error ? err.message : 'Failed to flag device'
                            showError('Flag Error', msg)
                          }
                        }}>
                          Flag
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" title="Edit" onClick={() => startEdit(d)}>
                          Edit
                        </button>
                        {d.status === 'unverified' && (
                          <button className="btn btn-sm btn-outline-secondary" title="Resend verification email" onClick={() => handleResendVerificationEmail(d.id)}>
                            Resend Email
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Inline reporting form */}
                {!loading && filtered.map(d => (
                  reportingDeviceId === d.id ? (
                    <tr key={`report-${d.id}`}>
                      <td colSpan={5} className="py-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                        <div className="d-flex flex-wrap gap-3 align-items-end">
                          <div>
                            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Type</label>
                            <select className="form-select" value={reportType} onChange={e => setReportType(e.target.value as any)}>
                              <option value="stolen">Stolen</option>
                              <option value="lost">Lost</option>
                              <option value="found">Found</option>
                            </select>
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 240 }}>
                            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Description</label>
                            <input className="form-control" value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Notes…" />
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={() => handleCreateReport(d.id)}>Create Report</button>
                            <button className="btn btn-outline-secondary" onClick={() => setReportingDeviceId(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-5">
              <Smartphone size={48} className="mb-3" style={{ color: 'var(--text-secondary)' }} />
              <h4 className="h6 mb-2" style={{ color: 'var(--text-primary)' }}>No devices found</h4>
              <div className="text-muted">Try adjusting the search or filters.</div>
            </div>
          )}
          {error && (
            <div className="text-center py-3">
              <div className="text-danger" style={{ fontSize: '13px' }}>{error}</div>
            </div>
          )}
          {/* Pagination Controls */}
          {!loading && pagination && (
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 p-3 border-top" style={{ borderTopColor: 'var(--border-color)' }}>
              <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <span>•</span>
                <span>{pagination.total} total</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                >
                  Next
                </button>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Edit Device Modal */}
        {editingDeviceId && (
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1050 }}>
            <div className="modern-card" style={{ maxWidth: 720, margin: '60px auto' }}>
              <div className="p-3 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                <h3 className="h6 mb-0" style={{ color: 'var(--text-primary)' }}>Edit Device</h3>
              </div>
              <div className="p-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Brand</label>
                    <input className="form-control" value={editForm.brand}
                      onChange={e => setEditForm(prev => ({ ...prev, brand: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Model</label>
                    <input className="form-control" value={editForm.model}
                      onChange={e => setEditForm(prev => ({ ...prev, model: e.target.value }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Color</label>
                    <input className="form-control" value={editForm.color || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, color: e.target.value }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={editForm.category || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}>
                      <option value="">—</option>
                      {categories.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={editForm.status || 'unverified'}
                      onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}>
                      <option value="unverified">Unverified</option>
                      <option value="verified">Verified</option>
                      <option value="found">Found</option>
                    </select>
                    <small className="text-muted">Use report action for stolen/lost</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">IMEI</label>
                    <input className="form-control" value={editForm.imei || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, imei: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Serial</label>
                    <input className="form-control" value={editForm.serial || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, serial: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Device Image URL</label>
                    <input className="form-control" value={editForm.device_image_url || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, device_image_url: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Proof URL</label>
                    <input className="form-control" value={editForm.proof_url || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, proof_url: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 p-3 border-top" style={{ borderTopColor: 'var(--border-color)' }}>
                <button className="btn btn-outline-secondary" onClick={() => setEditingDeviceId(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}