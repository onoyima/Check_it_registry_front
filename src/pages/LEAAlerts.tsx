import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { AlertTriangle, ShieldAlert, Eye } from 'lucide-react'

interface ReportedDevice {
  id: string
  brand: string
  model: string
  imei?: string
  serial?: string
  status: string
  owner_name: string
  owner_email: string
  owner_phone: string
  owner_region: string
  latest_report_at: string
  latest_report_type: string
  report_count: number
}

interface DeviceCheckAlert {
  id: string
  device_id: string | null
  check_type: string
  created_at: string
  latitude?: number
  longitude?: number
  location_accuracy?: number
  ip_address?: string
  mac_address?: string
  user_agent?: string
  checker_user_id?: string
  brand?: string
  model?: string
  imei?: string
  serial?: string
  owner_name?: string
  owner_email?: string
  owner_phone?: string
  owner_region?: string
  checker_name?: string
  checker_email?: string
  checker_phone?: string
}

export default function LEAAlerts() {
  const [reportedDevices, setReportedDevices] = useState<ReportedDevice[]>([])
  const [alerts, setAlerts] = useState<DeviceCheckAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('auth_token')
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {}

      const [reportedRes, alertsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/lea-portal/reported-devices?page=1&limit=50', { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/lea-portal/alerts/device-checks?limit=50', { headers })
      ])
      if (!reportedRes.ok) throw new Error('Failed to load reported devices')
      if (!alertsRes.ok) throw new Error('Failed to load alerts')

      const reportedJson = await reportedRes.json()
      const alertsJson = await alertsRes.json()
      setReportedDevices(reportedJson.devices || [])
      setAlerts(alertsJson.alerts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load LEA alerts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <div className="d-flex align-items-center gap-2 mb-4">
          <ShieldAlert />
          <div>
            <h1 className="h4 m-0">LEA Alerts</h1>
            <small className="text-secondary">Reported devices and recent check alerts</small>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Reported Devices */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2"><AlertTriangle /><strong>Reported Devices</strong></div>
            <small className="text-muted">Active cases in your region</small>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Identifier</th>
                    <th>Owner</th>
                    <th>Region</th>
                    <th>Latest Report</th>
                    <th>Type</th>
                    <th>Reports</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedDevices.map(dev => (
                    <tr key={dev.id}>
                      <td>{dev.brand} {dev.model}</td>
                      <td>{dev.imei || dev.serial || '-'}</td>
                      <td>
                        <div className="small">{dev.owner_name}</div>
                        <div className="text-muted small">{dev.owner_email}</div>
                      </td>
                      <td>{dev.owner_region || '-'}</td>
                      <td>{new Date(dev.latest_report_at).toLocaleString()}</td>
                      <td className="text-uppercase">{dev.latest_report_type}</td>
                      <td>{dev.report_count}</td>
                      <td>
                        <a className="btn btn-sm btn-outline-primary" href={`/lea/devices/${dev.id}`}>
                          <Eye size={16} className="me-1" /> View
                        </a>
                      </td>
                    </tr>
                  ))}
                  {reportedDevices.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-4 text-muted">No active reported devices</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Check Alerts */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2"><ShieldAlert /><strong>Recent Alerts</strong></div>
            <small className="text-muted">Checks on reported devices</small>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Device</th>
                    <th>Identifier</th>
                    <th>Checker</th>
                    <th>Network</th>
                    <th>Location</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert.id}>
                      <td>{new Date(alert.created_at).toLocaleString()}</td>
                      <td>{alert.brand} {alert.model}</td>
                      <td>{alert.imei || alert.serial || '-'}</td>
                      <td>
                        <div className="small">{alert.checker_name || 'Anonymous'}</div>
                        <div className="text-muted small">{alert.checker_email || alert.checker_phone || ''}</div>
                      </td>
                      <td>
                        <div className="small">IP: {alert.ip_address || '-'}</div>
                        <div className="text-muted small">MAC: {alert.mac_address || '-'}</div>
                      </td>
                      <td>
                        <div className="small">
                          {alert.latitude && alert.longitude ? `${alert.latitude}, ${alert.longitude}` : 'Unknown'}
                        </div>
                        <div className="text-muted small">±{alert.location_accuracy || 'n/a'}m</div>
                      </td>
                      <td>
                        <a className="btn btn-sm btn-outline-primary" href={`/device-check-report?checkId=${alert.id}`}>
                          <Eye size={16} className="me-1" /> Details
                        </a>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-4 text-muted">No recent alerts</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}