import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { AlertTriangle, ShieldAlert, Eye, MapPin, Network, Clock, Smartphone, RefreshCw } from 'lucide-react'

interface ReportedDevice {
  id: string; brand: string; model: string; imei?: string; serial?: string
  status: string; owner_name: string; owner_email: string; owner_phone: string
  latest_report_at: string; latest_report_type: string; report_count: number
}

interface DeviceCheckAlert {
  id: string; device_id: string | null; check_type: string; created_at: string
  latitude?: number; longitude?: number; location_accuracy?: number
  ip_address?: string; mac_address?: string; user_agent?: string
  checker_user_id?: string; brand?: string; model?: string; imei?: string; serial?: string
  owner_name?: string; owner_email?: string; owner_phone?: string
  checker_name?: string; checker_email?: string; checker_phone?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function AdminAlerts() {
  const [reportedDevices, setReportedDevices] = useState<ReportedDevice[]>([])
  const [alerts, setAlerts] = useState<DeviceCheckAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true); setError(null)
      const token = localStorage.getItem('auth_token')
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const [reportedRes, alertsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/admin-portal/reported-devices?page=1&limit=50`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/admin-portal/alerts/device-checks?limit=50`, { headers })
      ])
      if (!reportedRes.ok) throw new Error('Failed to load reported devices')
      if (!alertsRes.ok) throw new Error('Failed to load alerts')
      setReportedDevices((await reportedRes.json()).devices || [])
      setAlerts((await alertsRes.json()).alerts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin alerts')
    } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['admin', 'super_admin']}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)', width: '3rem', height: '3rem' }} role="status" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading alerts...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requireAuth allowedRoles={['admin', 'super_admin']}>
      <div className="container-fluid px-0">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="page-header">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-500)', width: 52, height: 52 }}>
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h1>Admin Alerts</h1>
                  <p>Reported devices and recent check alerts</p>
                </div>
              </div>
              <button onClick={loadData} className="btn-ghost"><RefreshCw size={18} /> Refresh</button>
            </div>
          </motion.div>

          {error && <div className="alert-banner alert-banner-danger mb-4"><AlertTriangle size={18} /><span>{error}</span></div>}

          <motion.div variants={itemVariants} className="modern-card mb-4">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderBottomColor: 'var(--border-color)' }}>
              <div className="d-flex align-items-center gap-2">
                <AlertTriangle size={20} style={{ color: 'var(--danger-500)' }} />
                <h3 className="h5 mb-0" style={{ color: 'var(--text-primary)' }}>Reported Devices</h3>
              </div>
              <span className="status-badge status-stolen">{reportedDevices.length} active</span>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Identifier</th>
                    <th>Owner</th>
                    <th>Latest Report</th>
                    <th>Type</th>
                    <th>Reports</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedDevices.map(dev => (
                    <tr key={dev.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Smartphone size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-primary)' }}>{dev.brand} {dev.model}</span>
                        </div>
                      </td>
                      <td><small style={{ color: 'var(--text-tertiary)' }}>{dev.imei || dev.serial || '-'}</small></td>
                      <td>
                        <div style={{ color: 'var(--text-primary)' }}>{dev.owner_name}</div>
                        <small style={{ color: 'var(--text-tertiary)' }}>{dev.owner_email}</small>
                      </td>
                      <td><small style={{ color: 'var(--text-tertiary)' }}>{new Date(dev.latest_report_at).toLocaleString()}</small></td>
                      <td>
                        <span className={`status-badge ${dev.latest_report_type === 'stolen' ? 'status-stolen' : dev.latest_report_type === 'lost' ? 'status-unverified' : 'status-found'}`}>
                          {dev.latest_report_type.toUpperCase()}
                        </span>
                      </td>
                      <td><span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{dev.report_count}</span></td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <a href={`/admin/devices/${dev.id}`} className="btn-ghost"><Eye size={16} /> View</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reportedDevices.length === 0 && (
                    <tr><td colSpan={7}>
                      <div className="empty-state py-4">
                        <div className="empty-state-icon" style={{ width: 60, height: 60 }}><AlertTriangle size={24} /></div>
                        <h3 style={{ fontSize: 16 }}>No active reported devices</h3>
                        <p>All devices are currently clear.</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="modern-card">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderBottomColor: 'var(--border-color)' }}>
              <div className="d-flex align-items-center gap-2">
                <ShieldAlert size={20} style={{ color: 'var(--warning-500)' }} />
                <h3 className="h5 mb-0" style={{ color: 'var(--text-primary)' }}>Recent Alerts</h3>
              </div>
              <small style={{ color: 'var(--text-tertiary)' }}>Checks on reported devices</small>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Device</th>
                    <th>Identifier</th>
                    <th>Checker</th>
                    <th>Network</th>
                    <th>Location</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert.id}>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                          <small style={{ color: 'var(--text-tertiary)' }}>{new Date(alert.created_at).toLocaleString()}</small>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>{alert.brand} {alert.model}</td>
                      <td><small style={{ color: 'var(--text-tertiary)' }}>{alert.imei || alert.serial || '-'}</small></td>
                      <td>
                        <div style={{ color: 'var(--text-primary)' }}>{alert.checker_name || 'Anonymous'}</div>
                        <small style={{ color: 'var(--text-tertiary)' }}>{alert.checker_email || alert.checker_phone || ''}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <Network size={14} style={{ color: 'var(--text-tertiary)' }} />
                          <div>
                            <small style={{ color: 'var(--text-primary)' }}>IP: {alert.ip_address || '-'}</small>
                            <br />
                            <small style={{ color: 'var(--text-tertiary)' }}>MAC: {alert.mac_address || '-'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
                          <small style={{ color: 'var(--text-primary)' }}>
                            {alert.latitude != null && alert.longitude != null ? `${Number(alert.latitude).toFixed(4)}, ${Number(alert.longitude).toFixed(4)}` : 'Unknown'}
                          </small>
                        </div>
                        {alert.location_accuracy && <small style={{ color: 'var(--text-tertiary)' }}> &plusmn;{alert.location_accuracy}m</small>}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <a href={`/device-check-report?checkId=${alert.id}`} className="btn-ghost"><Eye size={16} /> Details</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr><td colSpan={7}>
                      <div className="empty-state py-4">
                        <div className="empty-state-icon" style={{ width: 60, height: 60 }}><ShieldAlert size={24} /></div>
                        <h3 style={{ fontSize: 16 }}>No recent alerts</h3>
                        <p>No device check alerts have been triggered.</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}
