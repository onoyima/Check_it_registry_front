import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { apiClient } from '../lib/apiClient'
import {
  User, Smartphone, FileText, ArrowLeftRight, CreditCard, Activity,
  Download, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Clock, Trash2, X
} from 'lucide-react'

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError, toasts, removeToast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'devices' | 'reports' | 'transfers' | 'transactions' | 'activity' | 'exports'>('devices')

  useEffect(() => { if (userId) loadUser() }, [userId])

  const loadUser = async () => {
    setLoading(true)
    try {
      const result = await apiClient.archive.userView(userId!)
      setData(result)
    } catch (err: any) {
      showError('Load failed', err.message || 'User not found')
    } finally { setLoading(false) }
  }

  if (loading) return (
    <Layout requireAuth allowedRoles={['admin']}>
      <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--primary)' }} /></div>
    </Layout>
  )

  if (!data) return (
    <Layout requireAuth allowedRoles={['admin']}>
      <div className="text-center py-5">
        <AlertTriangle size={48} className="text-warning mb-3" />
        <h4>User not found</h4>
        <button onClick={() => navigate(-1)} className="btn btn-outline-primary mt-3">Go Back</button>
      </div>
    </Layout>
  )

  const { user, devices, reports, transfers, transactions, recentActivity, dataExports, newAccount, stats } = data

  const sections = [
    { key: 'devices' as const, label: `Devices (${stats.totalDevices})`, icon: Smartphone },
    { key: 'reports' as const, label: `Reports (${stats.totalReports})`, icon: FileText },
    { key: 'transfers' as const, label: `Transfers (${stats.totalTransfers})`, icon: ArrowLeftRight },
    { key: 'transactions' as const, label: `Transactions (${stats.totalTransactions})`, icon: CreditCard },
    { key: 'activity' as const, label: 'Activity', icon: Activity },
    { key: 'exports' as const, label: 'Exports', icon: Download },
  ]

  return (
    <Layout requireAuth allowedRoles={['admin']}>
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost"><ChevronLeft size={18} /></button>
          <User size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 className="mb-0">{user.name || 'Unnamed User'}</h1>
            <p className="text-secondary mb-0" style={{ fontSize: 13 }}>{user.email}</p>
          </div>
          {user.deleted_at && <span className="badge bg-danger">Deleted</span>}
        </div>

        {/* Profile Card */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="modern-card p-4">
              <h6 className="fw-semibold mb-3">Profile Information</h6>
              <div className="row g-2" style={{ fontSize: 13 }}>
                <div className="col-6"><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
                <div className="col-6"><strong>Region:</strong> {user.region || 'N/A'}</div>
                <div className="col-6"><strong>Phone:</strong> {user.phone || 'N/A'}</div>
                <div className="col-6"><strong>KYC Status:</strong> <span className={`status-badge ${user.kyc_status === 'verified' ? 'status-verified' : 'status-pending'}`}>{user.kyc_status || 'unverified'}</span></div>
                <div className="col-6"><strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
                <div className="col-6"><strong>Last Login:</strong> {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</div>
                {user.deleted_at && <div className="col-12"><strong>Deleted:</strong> <span className="text-danger">{new Date(user.deleted_at).toLocaleString()}</span></div>}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="modern-card p-4">
              <h6 className="fw-semibold mb-3">Summary</h6>
              <div className="row g-3">
                {[
                  { label: 'Devices', value: stats.totalDevices, icon: Smartphone, color: 'var(--primary)' },
                  { label: 'Reports', value: stats.totalReports, icon: FileText, color: 'var(--warning-500)' },
                  { label: 'Transfers', value: stats.totalTransfers, icon: ArrowLeftRight, color: 'var(--success-500)' },
                  { label: 'Transactions', value: stats.totalTransactions, icon: CreditCard, color: '#6366f1' },
                ].map((s, i) => (
                  <div key={i} className="col-6">
                    <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                      <s.icon size={18} style={{ color: s.color }} />
                      <div>
                        <div className="fw-bold" style={{ color: s.color, fontSize: 18 }}>{s.value}</div>
                        <div className="text-secondary" style={{ fontSize: 11 }}>{s.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {newAccount && (
                <div className="alert alert-info mt-3 mb-0" style={{ fontSize: 12 }}>
                  This user has a <a href={`/admin/user/${newAccount.id}`}>new active account</a> ({newAccount.email}) created {new Date(newAccount.created_at).toLocaleDateString()}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {sections.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`btn btn-sm d-flex align-items-center gap-2 ${activeSection === s.key ? 'btn-primary' : 'btn-outline-secondary'}`}>
              <s.icon size={14} /> {s.label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="modern-card">
          {activeSection === 'devices' && (
            <div className="table-responsive">
              <table className="modern-table">
                <thead><tr><th>Brand</th><th>Model</th><th>Category</th><th>IMEI</th><th>Serial</th><th>Status</th><th>Added</th></tr></thead>
                <tbody>
                  {devices.length === 0 ? <tr><td colSpan={7} className="text-center py-4 text-secondary">No devices</td></tr>
                    : devices.map((d: any) => (
                      <tr key={d.id}>
                        <td className="fw-medium">{d.brand}</td>
                        <td>{d.model}</td>
                        <td><span className="status-badge">{d.category}</span></td>
                        <td style={{ fontSize: 12 }}>{d.imei || 'N/A'}</td>
                        <td style={{ fontSize: 12 }}>{d.serial || 'N/A'}</td>
                        <td><span className={`status-badge ${d.status === 'active' ? 'status-verified' : d.status === 'reported_stolen' ? 'status-failed' : ''}`}>{d.status}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="table-responsive">
              <table className="modern-table">
                <thead><tr><th>Case ID</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {reports.length === 0 ? <tr><td colSpan={4} className="text-center py-4 text-secondary">No reports</td></tr>
                    : reports.map((r: any) => (
                      <tr key={r.id}>
                        <td className="fw-medium">{r.case_id}</td>
                        <td><span className="status-badge" style={{ textTransform: 'capitalize' }}>{r.report_type?.replace('_', ' ')}</span></td>
                        <td><span className={`status-badge ${r.status === 'resolved' ? 'status-verified' : r.status === 'active' || r.status === 'pending' ? 'status-pending' : 'status-failed'}`}>{r.status}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'transfers' && (
            <div className="table-responsive">
              <table className="modern-table">
                <thead><tr><th>Transfer ID</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {transfers.length === 0 ? <tr><td colSpan={3} className="text-center py-4 text-secondary">No transfers</td></tr>
                    : transfers.map((t: any) => (
                      <tr key={t.id}>
                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{t.id.slice(0, 8)}...</td>
                        <td><span className={`status-badge ${t.status === 'completed' ? 'status-verified' : 'status-pending'}`}>{t.status}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'transactions' && (
            <div className="table-responsive">
              <table className="modern-table">
                <thead><tr><th>ID</th><th>Amount</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {transactions.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-secondary">No transactions</td></tr>
                    : transactions.map((t: any) => (
                      <tr key={t.id}>
                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{t.id.slice(0, 8)}...</td>
                        <td className="fw-medium">₦{parseFloat(t.amount).toLocaleString()}</td>
                        <td><span className="status-badge" style={{ textTransform: 'capitalize' }}>{t.type}</span></td>
                        <td><span className={`status-badge ${t.status === 'successful' ? 'status-verified' : 'status-pending'}`}>{t.status}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'activity' && (
            <div style={{ maxHeight: 500, overflowX: 'hidden', overflowY: 'auto' }}>
              {recentActivity.length === 0 ? <p className="text-center py-4 text-secondary">No activity logs</p>
                : recentActivity.map((a: any, i: number) => (
                  <div key={i} className="d-flex flex-wrap gap-2 py-2 px-3 border-bottom" style={{ fontSize: 12 }}>
                    <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleString()}</span>
                    <span className="fw-medium" style={{ whiteSpace: 'nowrap' }}>{a.action}</span>
                    <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>{a.table_name}</span>
                    <span className="text-secondary text-truncate" style={{ flex: '1 1 0', minWidth: 0 }}>{typeof a.details === 'string' ? a.details : JSON.stringify(a.details)}</span>
                  </div>
                ))}
            </div>
          )}

          {activeSection === 'exports' && (
            <div className="table-responsive">
              <table className="modern-table">
                <thead><tr><th>Type</th><th>Status</th><th>Requested</th><th>Completed</th></tr></thead>
                <tbody>
                  {dataExports.length === 0 ? <tr><td colSpan={4} className="text-center py-4 text-secondary">No data exports</td></tr>
                    : dataExports.map((e: any, i: number) => (
                      <tr key={i}>
                        <td><span className="status-badge" style={{ textTransform: 'capitalize' }}>{e.export_type}</span></td>
                        <td><span className={`status-badge ${e.status === 'completed' ? 'status-verified' : 'status-pending'}`}>{e.status}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(e.requested_at).toLocaleString()}</td>
                        <td style={{ fontSize: 12 }}>{e.completed_at ? new Date(e.completed_at).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
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
