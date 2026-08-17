import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { apiClient } from '../lib/apiClient'
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, User, Mail } from 'lucide-react'

interface QueueItem {
  id: string
  item_type: string
  item_id: string
  submitted_by: string
  status: string
  priority: string
  notes: string | null
  admin_notes: string | null
  verification_data: any
  created_at: string
  submitter_name: string
  submitter_email: string
}

const STATUS_OPTIONS = ['pending', 'in_review', 'approved', 'rejected', 'requires_info'] as const

export default function AdminVerificationQueue() {
  const { showSuccess, showError, toasts, removeToast } = useToast()
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })

  useEffect(() => { fetchQueue() }, [statusFilter, page])

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const data = await apiClient.security.getVerificationQueue(statusFilter, page)
      setItems(data.data || [])
      setPagination(data.pagination || { total: 0, totalPages: 0 })
    } catch (err: any) {
      showError('Failed to load queue', err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (itemId: string, newStatus: string) => {
    try {
      await apiClient.security.updateQueueItem(itemId, newStatus)
      showSuccess('Updated', `Item marked as ${newStatus}`)
      fetchQueue()
    } catch (err: any) {
      showError('Update failed', err.message)
    }
  }

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return '#EF4444'
      case 'high': return '#F59E0B'
      case 'medium': return 'var(--primary)'
      default: return 'var(--text-tertiary)'
    }
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case 'approved': return <CheckCircle size={14} style={{ color: 'var(--success)' }} />
      case 'rejected': return <XCircle size={14} style={{ color: '#EF4444' }} />
      case 'in_review': return <Clock size={14} style={{ color: 'var(--primary)' }} />
      case 'requires_info': return <AlertTriangle size={14} style={{ color: '#F59E0B' }} />
      default: return <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
    }
  }

  return (
    <Layout requireAuth allowedRoles={['admin']}>
      <div className="container-fluid px-0">
        <div className="page-header">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
            <div>
              <h1>Business Verification Queue</h1>
              <p className="text-secondary">Review and manage business verification requests</p>
            </div>
            <button onClick={fetchQueue} className="btn btn-outline-primary d-flex align-items-center gap-2">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {s.replace('_', ' ')}
              {s === 'pending' && items.length > 0 && statusFilter === 'pending' && (
                <span className="badge bg-danger ms-1" style={{ fontSize: 10 }}>{pagination.total}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="modern-card p-5 text-center">
            <Shield size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
            <h5 className="text-secondary">No items in queue</h5>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              {statusFilter === 'pending' ? 'All caught up! No pending verification items.' : `No ${statusFilter.replace('_', ' ')} items.`}
            </p>
          </div>
        ) : (
          <div className="modern-card">
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Submitted By</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={14} style={{ color: 'var(--text-secondary)' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{item.submitter_name || 'Unknown'}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.submitter_email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 12, textTransform: 'capitalize' }}>{item.item_type}</span></td>
                      <td>
                        <span style={{ fontSize: 12, color: priorityColor(item.priority), fontWeight: 600, textTransform: 'uppercase' }}>
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <span className="d-flex align-items-center gap-1" style={{ fontSize: 12, textTransform: 'capitalize' }}>
                          {statusIcon(item.status)} {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          {item.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(item.id, 'in_review')} className="btn btn-sm btn-outline-primary" style={{ fontSize: 12 }}>
                                Review
                              </button>
                              <button onClick={() => updateStatus(item.id, 'approved')} className="btn btn-sm btn-outline-success" style={{ fontSize: 12 }}>
                                Approve
                              </button>
                              <button onClick={() => updateStatus(item.id, 'rejected')} className="btn btn-sm btn-outline-danger" style={{ fontSize: 12 }}>
                                Reject
                              </button>
                            </>
                          )}
                          {item.status === 'in_review' && (
                            <>
                              <button onClick={() => updateStatus(item.id, 'approved')} className="btn btn-sm btn-outline-success" style={{ fontSize: 12 }}>
                                Approve
                              </button>
                              <button onClick={() => updateStatus(item.id, 'rejected')} className="btn btn-sm btn-outline-danger" style={{ fontSize: 12 }}>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 p-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm btn-outline-secondary">Previous</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                  Page {page} of {pagination.totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn btn-sm btn-outline-secondary">Next</button>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  )
}
