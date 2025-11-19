import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useToast, ToastContainer } from '../components/Toast'

type VerificationItem = {
  id: string
  device: string
  owner: string
  submitted: string
  status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'unverified'
}

export default function DeviceVerificationStatus() {
  const { user } = useAuth()
  const { toasts, removeToast, showError } = useToast()
  const [items, setItems] = useState<VerificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'all'|'pending'|'in_review'|'verified'|'rejected'|'unverified'>('all')
  const [q, setQ] = useState('')

  // Unified API base: prefer VITE_API_BASE_URL, fallback to VITE_API_URL or dev proxy '/api'
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem('auth_token')
        if (!token) throw new Error('Authentication required')

        // Admins/managers: load verification queue
        if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'business') {
          const res = await fetch(`${API_URL}/admin-portal/verification-queue`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(json.error || 'Failed to load verification queue')
          const queue = (json?.devices || []) as any[]
          const mapped: VerificationItem[] = queue.map((d, idx) => ({
            id: d.id || `REQ-${idx + 1}`,
            device: `${d.brand || ''} ${d.model || ''} ${d.imei ? `(IMEI ${d.imei})` : d.serial ? `(SN ${d.serial})` : ''}`.trim(),
            owner: d.owner_name || d.user_name || d.user_email || 'Unknown',
            submitted: d.created_at || new Date().toISOString(),
            status: (d.status as any) || 'pending'
          }))
          setItems(mapped)
        } else {
          // Regular users: load own devices and show verification status
          const res = await fetch(`${API_URL}/user-portal/devices?limit=100`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(json.error || 'Failed to load devices')
          const devices = (json?.data?.devices || json || []) as any[]
          const mapped: VerificationItem[] = devices.map((d) => ({
            id: d.id,
            device: `${d.brand || ''} ${d.model || ''} ${d.imei ? `(IMEI ${d.imei})` : d.serial ? `(SN ${d.serial})` : ''}`.trim(),
            owner: user?.name || 'You',
            submitted: d.created_at || new Date().toISOString(),
            status: (d.status as any) || 'unverified'
          }))
          setItems(mapped)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load verification status'
        setError(msg)
        showError('Loading Error', msg)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role])

  const filtered = useMemo(() => items.filter(i => (
    (status === 'all' || i.status === status) &&
    (i.id.toLowerCase().includes(q.toLowerCase()) || i.device.toLowerCase().includes(q.toLowerCase()) || i.owner.toLowerCase().includes(q.toLowerCase()))
  )), [items, status, q])

  return (
    <Layout requireAuth>
      <div className="container py-4">
        <h2 className="fw-bold mb-3">Verification Status</h2>

        <div className="modern-card p-3 mb-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <input className="modern-input" placeholder="Search by ID, device, owner" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="col-12 col-md-6 d-flex gap-2 align-items-center">
              <label className="text-secondary">Status:</label>
              <select className="form-select" style={{ maxWidth: 240 }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modern-card p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: 'var(--primary-600)' }} />
              <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle m-0">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Device</th>
                    <th>Owner</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => (
                    <tr key={i.id}>
                      <td className="fw-semibold">{i.id}</td>
                      <td>{i.device}</td>
                      <td>{i.owner}</td>
                      <td>{new Date(i.submitted).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${i.status === 'verified' ? 'status-verified' : i.status === 'in_review' ? 'status-unverified' : i.status === 'pending' ? 'status-found' : i.status === 'rejected' ? 'status-stolen' : 'status-unverified'}`}>{i.status.replace('_',' ')}</span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary">View</button>
                          <button className="btn btn-sm btn-outline-secondary">Message</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary py-4">No verification records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}