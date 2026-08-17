import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { apiClient } from '../lib/apiClient'
import {
  Building2, User, Smartphone, FileText, ArrowLeftRight, CreditCard, Activity,
  Download, ChevronLeft, AlertTriangle, CheckCircle, Clock, Shield, Users
} from 'lucide-react'

export default function AdminBusinessDetail() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError, toasts, removeToast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'devices' | 'onboardings' | 'verification' | 'activity'>('overview')

  useEffect(() => { if (userId) loadBusiness() }, [userId])

  const loadBusiness = async () => {
    setLoading(true)
    try {
      const result = await apiClient.archive.businessView(userId!)
      setData(result)
    } catch (err: any) {
      showError('Load failed', err.message || 'Business not found')
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
        <h4>Business not found</h4>
        <button onClick={() => navigate(-1)} className="btn btn-outline-primary mt-3">Go Back</button>
      </div>
    </Layout>
  )

  const { user, devices, reports, transfers, transactions, recentActivity, stats, businessProfile, onboardings, verificationAttempts } = data

  const sections = [
    { key: 'overview' as const, label: 'Overview', icon: Building2 },
    { key: 'devices' as const, label: `Devices (${stats.totalDevices})`, icon: Smartphone },
    { key: 'onboardings' as const, label: `Onboardings (${onboardings?.length || 0})`, icon: Users },
    { key: 'verification' as const, label: `Verification (${verificationAttempts?.length || 0})`, icon: Shield },
    { key: 'activity' as const, label: 'Activity', icon: Activity },
  ]

  return (
    <Layout requireAuth allowedRoles={['admin']}>
      <div className="container-fluid px-0">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost"><ChevronLeft size={18} /></button>
          <Building2 size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 className="mb-0">{user.name || 'Unnamed Business'}</h1>
            <p className="text-secondary mb-0" style={{ fontSize: 13 }}>{user.email}</p>
          </div>
          {user.deleted_at && <span className="badge bg-danger">Deleted</span>}
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

        {/* Overview */}
        {activeSection === 'overview' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="modern-card p-4">
                <h6 className="fw-semibold mb-3">User Profile</h6>
                <div className="row g-2" style={{ fontSize: 13 }}>
                  <div className="col-6"><strong>Email:</strong> {user.email}</div>
                  <div className="col-6"><strong>Phone:</strong> {user.phone || 'N/A'}</div>
                  <div className="col-6"><strong>Region:</strong> {user.region || 'N/A'}</div>
                  <div className="col-6"><strong>KYC:</strong> <span className={`status-badge ${user.kyc_status === 'verified' ? 'status-verified' : 'status-pending'}`}>{user.kyc_status || 'unverified'}</span></div>
                  <div className="col-6"><strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
                  <div className="col-6"><strong>Last Login:</strong> {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</div>
                  {user.deleted_at && <div className="col-12"><strong className="text-danger">Deleted:</strong> {new Date(user.deleted_at).toLocaleString()}</div>}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="modern-card p-4">
                <h6 className="fw-semibold mb-3">Business Profile</h6>
                {businessProfile ? (
                  <div className="row g-2" style={{ fontSize: 13 }}>
                    <div className="col-6"><strong>Business Name:</strong> {businessProfile.business_name}</div>
                    <div className="col-6"><strong>Registration #:</strong> {businessProfile.registration_number}</div>
                    <div className="col-6"><strong>Type:</strong> {businessProfile.business_type || 'N/A'}</div>
                    <div className="col-6"><strong>Sector:</strong> {businessProfile.sector || 'N/A'}</div>
                    <div className="col-6"><strong>Address:</strong> {businessProfile.business_address || 'N/A'}</div>
                    <div className="col-6"><strong>State:</strong> {businessProfile.state || 'N/A'}</div>
                    <div className="col-6"><strong>Verified:</strong> <span className={`status-badge ${businessProfile.is_verified ? 'status-verified' : 'status-pending'}`}>{businessProfile.is_verified ? 'Yes' : 'No'}</span></div>
                    <div className="col-6"><strong>Created:</strong> {new Date(businessProfile.created_at).toLocaleDateString()}</div>
                  </div>
                ) : <p className="text-secondary">No business profile on file</p>}
              </div>
            </div>
            <div className="col-12">
              <div className="modern-card p-4">
                <h6 className="fw-semibold mb-3">Summary</h6>
                <div className="d-flex gap-4 flex-wrap">
                  {[
                    { label: 'Devices', value: stats.totalDevices, color: 'var(--primary)' },
                    { label: 'Reports', value: stats.totalReports, color: 'var(--warning-500)' },
                    { label: 'Transfers', value: stats.totalTransfers, color: 'var(--success-500)' },
                    { label: 'Transactions', value: stats.totalTransactions, color: '#6366f1' },
                    { label: 'Onboardings', value: onboardings?.length || 0, color: 'var(--info-500)' },
                  ].map((s, i) => (
                    <div key={i} className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                      <div className="fw-bold" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
                      <div className="text-secondary" style={{ fontSize: 12 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devices */}
        {activeSection === 'devices' && (
          <div className="modern-card">
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
          </div>
        )}

        {/* Onboardings */}
        {activeSection === 'onboardings' && (
          <div className="modern-card">
            <div className="table-responsive">
              <table className="modern-table">
                <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {!onboardings || onboardings.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-secondary">No onboardings</td></tr>
                    : onboardings.map((o: any) => (
                      <tr key={o.id}>
                        <td className="fw-medium">{o.customer_name || 'N/A'}</td>
                        <td style={{ fontSize: 12 }}>{o.customer_email || 'N/A'}</td>
                        <td style={{ fontSize: 12 }}>{o.customer_phone || 'N/A'}</td>
                        <td><span className={`status-badge ${o.status === 'completed' ? 'status-verified' : o.status === 'pending' ? 'status-pending' : 'status-failed'}`}>{o.status}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Verification */}
        {activeSection === 'verification' && (
          <div className="modern-card">
            <div className="table-responsive">
              <table className="modern-table">
                <thead><tr><th>Type</th><th>Status</th><th>Submitted</th><th>Reviewed</th><th>Notes</th></tr></thead>
                <tbody>
                  {!verificationAttempts || verificationAttempts.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-secondary">No verification attempts</td></tr>
                    : verificationAttempts.map((v: any) => (
                      <tr key={v.id}>
                        <td><span className="status-badge">{v.verification_type || 'CAC'}</span></td>
                        <td><span className={`status-badge ${v.status === 'verified' || v.status === 'approved' ? 'status-verified' : v.status === 'rejected' ? 'status-failed' : 'status-pending'}`}>{v.status}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(v.created_at).toLocaleString()}</td>
                        <td style={{ fontSize: 12 }}>{v.reviewed_at ? new Date(v.reviewed_at).toLocaleString() : '—'}</td>
                        <td style={{ fontSize: 12, maxWidth: 200 }} className="text-truncate">{v.admin_notes || v.rejection_reason || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity */}
        {activeSection === 'activity' && (
          <div className="modern-card">
            <div style={{ maxHeight: 500, overflowX: 'hidden', overflowY: 'auto' }}>
              {!recentActivity || recentActivity.length === 0 ? <p className="text-center py-4 text-secondary">No activity logs</p>
                : recentActivity.map((a: any, i: number) => (
                  <div key={i} className="d-flex flex-wrap gap-2 py-2 px-3 border-bottom" style={{ fontSize: 12 }}>
                    <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleString()}</span>
                    <span className="fw-medium" style={{ whiteSpace: 'nowrap' }}>{a.action}</span>
                    <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>{a.table_name}</span>
                    <span className="text-secondary text-truncate" style={{ flex: '1 1 0', minWidth: 0 }}>{typeof a.details === 'string' ? a.details : JSON.stringify(a.details)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}
