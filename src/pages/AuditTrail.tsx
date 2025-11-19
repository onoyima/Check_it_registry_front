import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Search, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Download,
  RefreshCw,
  Eye,
  Clock,
  MapPin
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast, ToastContainer } from '../components/Toast'

interface AuditLog {
  id: string
  timestamp: string
  user_id: string
  user_name: string
  user_role: string
  action: string
  resource_type: 'user' | 'device' | 'report' | 'system' | 'auth'
  resource_id?: string
  details: string
  ip_address: string
  user_agent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'success' | 'failed' | 'warning'
}

interface AuditStats {
  total_events: number
  events_24h: number
  critical_events: number
  failed_actions: number
  unique_users: number
  top_actions: Array<{ action: string; count: number }>
}

export default function AuditTrail() {
  const location = useLocation()
  const { user } = useAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const { toasts, removeToast, showError } = useToast()

  useEffect(() => {
    // Prefill filters from query params if provided
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    const resource = params.get('resource') || params.get('resource_type') || ''
    const dr = params.get('dr') || ''
    if (q) setSearchTerm(q)
    if (resource) setResourceFilter(resource)
    if (dr) setDateRange(dr)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadAuditData()
  }, [dateRange])

  const loadAuditData = async () => {
    try {
      setLoading(true)
      // Build date range
      const now = new Date()
      const start = new Date(now)
      const periodDays = dateRange === '1d' ? 1 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      start.setDate(now.getDate() - periodDays)
      const start_date = start.toISOString().slice(0, 10)
      const end_date = now.toISOString().slice(0, 10)

      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      // Build filters
      const params = new URLSearchParams()
      params.append('limit', '50')
      params.append('start_date', start_date)
      params.append('end_date', end_date)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())
      if (severityFilter !== 'all') params.append('severity', severityFilter)
      if (resourceFilter !== 'all') params.append('resource_type', resourceFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      // Choose endpoint based on role
      const base = 'http://localhost:3006/api/audit-trail'
      const logsPath = user?.role === 'admin' ? '/logs' : user?.role === 'lea' ? '/lea/logs' : '/my/logs'

      // Fetch logs
      const res = await fetch(`${base}${logsPath}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch audit logs')
      const json = await res.json()
      const logs: AuditLog[] = (json?.logs || []).map((l: any) => ({
        id: String(l.id),
        timestamp: l.created_at,
        user_id: String(l.user_id || ''),
        user_name: l.user_name || 'Unknown',
        user_role: l.user_role || 'system',
        action: l.action,
        resource_type: l.resource_type,
        resource_id: l.resource_id,
        details: l.details || '',
        ip_address: l.ip_address || '',
        user_agent: l.user_agent || '',
        severity: (l.severity || 'low') as AuditLog['severity'],
        status: (l.status || 'success') as AuditLog['status']
      }))

      // Fetch stats only for admin; otherwise derive minimal stats from logs
      if (user?.role === 'admin') {
        const resStats = await fetch(`${base}/stats?period=${periodDays}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (resStats.ok) {
          const statsJson = await resStats.json()
          const overview = statsJson?.overview || {}
          const topActions = (statsJson?.top_actions || []).map((a: any) => ({ action: a.action, count: a.count }))
          const computedStats: AuditStats = {
            total_events: overview.total_events || 0,
            events_24h: overview.events_24h || 0,
            critical_events: overview.critical_events || 0,
            failed_actions: overview.failed_actions || 0,
            unique_users: overview.unique_users || 0,
            top_actions: topActions
          }
          setStats(computedStats)
        } else {
          // Gracefully handle non-admin access or error
          setStats(null)
        }
      } else {
        // Derived stats for non-admin users
        const total = logs.length
        const now = Date.now()
        const events24h = logs.filter(l => {
          const t = new Date(l.timestamp).getTime()
          return now - t <= 24 * 60 * 60 * 1000
        }).length
        const critical = logs.filter(l => l.severity === 'critical').length
        const failed = logs.filter(l => l.status === 'failed').length
        const uniqueUsers = new Set(logs.map(l => l.user_id)).size
        const actionCounts: Record<string, number> = {}
        logs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] || 0) + 1 })
        const topActions = Object.entries(actionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([action, count]) => ({ action, count }))
        setStats({
          total_events: total,
          events_24h: events24h,
          critical_events: critical,
          failed_actions: failed,
          unique_users: uniqueUsers,
          top_actions: topActions
        })
      }

      setAuditLogs(logs)
    } catch (err) {
      console.error('Error loading audit data:', err)
      showError('Loading Error', 'Failed to load audit trail data')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    
    return matchesSearch && matchesSeverity && matchesResource && matchesStatus
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--danger-500)'
      case 'high': return 'var(--warning-500)'
      case 'medium': return 'var(--primary-500)'
      case 'low': return 'var(--success-500)'
      default: return 'var(--gray-500)'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'failed': return AlertTriangle
      case 'warning': return Info
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'var(--success-500)'
      case 'failed': return 'var(--danger-500)'
      case 'warning': return 'var(--warning-500)'
      default: return 'var(--gray-500)'
    }
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading audit trail...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row mb-5"
        >
          <div className="col-12">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
              <div className="mb-3 mb-sm-0">
                <h1 className="display-6 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Audit Trail
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  System activity logs and security monitoring
                </p>
              </div>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button 
                  onClick={loadAuditData}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="row g-4 mb-5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-lg-3 col-md-6"
            >
              <div className="modern-card p-4 text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                  }}
                >
                  <Activity size={24} style={{ color: 'var(--primary-600)' }} />
                </div>
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                  {stats.total_events.toLocaleString()}
                </h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Total Events
                </p>
                <small style={{ color: 'var(--success-500)' }}>
                  +{stats.events_24h} today
                </small>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-lg-3 col-md-6"
            >
              <div className="modern-card p-4 text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)' 
                  }}
                >
                  <AlertTriangle size={24} style={{ color: 'var(--danger-500)' }} />
                </div>
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                  {stats.critical_events}
                </h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Critical Events
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-lg-3 col-md-6"
            >
              <div className="modern-card p-4 text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgba(245, 158, 11, 0.1)' 
                  }}
                >
                  <Shield size={24} style={{ color: 'var(--warning-500)' }} />
                </div>
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                  {stats.failed_actions}
                </h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Failed Actions
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-lg-3 col-md-6"
            >
              <div className="modern-card p-4 text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                  }}
                >
                  <User size={24} style={{ color: 'var(--success-500)' }} />
                </div>
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                  {stats.unique_users.toLocaleString()}
                </h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Active Users
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="modern-card p-4 mb-4"
        >
          <div className="row g-3 align-items-end">
            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                <Search size={16} className="me-2" />
                Search Logs
              </label>
              <input
                type="text"
                className="modern-input"
                placeholder="Search by user, action, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                Severity
              </label>
              <select
                className="modern-input"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                Resource
              </label>
              <select
                className="modern-input"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
              >
                <option value="all">All Resources</option>
                <option value="user">Users</option>
                <option value="device">Devices</option>
                <option value="report">Reports</option>
                <option value="auth">Authentication</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                Status
              </label>
              <select
                className="modern-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div className="col-lg-3 col-md-12">
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSeverityFilter('all')
                  setResourceFilter('all')
                  setStatusFilter('all')
                }}
                className="btn btn-outline-secondary w-100"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Audit Logs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="modern-card"
        >
          <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
            <h3 className="h5 mb-0" style={{ color: 'var(--text-primary)' }}>
              Audit Logs ({filteredLogs.length})
            </h3>
          </div>

          <div className="p-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-5">
                <Shield size={48} className="mb-3" style={{ color: 'var(--text-secondary)' }} />
                <h4 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>No audit logs found</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                <AnimatePresence>
                  {filteredLogs.map((log, index) => {
                    const StatusIcon = getStatusIcon(log.status)
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-3 border"
                        style={{ 
                          borderColor: 'var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          borderLeft: `4px solid ${getSeverityColor(log.severity)}`
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div className="position-relative flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                              style={{ 
                                width: '40px', 
                                height: '40px',
                                background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%)',
                                color: 'white'
                              }}
                            >
                              {getInitials(log.user_name)}
                            </div>
                            <span
                              className="position-absolute rounded-circle"
                              style={{
                                width: '10px',
                                height: '10px',
                                right: '-1px',
                                bottom: '-1px',
                                border: '2px solid var(--bg-primary)',
                                backgroundColor: getStatusColor(log.status)
                              }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                                  {formatAction(log.action)}
                                </h6>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                  <span 
                                    className="badge px-2 py-1"
                                    style={{ 
                                      backgroundColor: `${getSeverityColor(log.severity)}20`,
                                      color: getSeverityColor(log.severity),
                                      fontSize: '11px'
                                    }}
                                  >
                                    {log.severity.toUpperCase()}
                                  </span>
                                  <span 
                                    className="badge px-2 py-1"
                                    style={{ 
                                      backgroundColor: 'var(--primary-100)',
                                      color: 'var(--primary-700)',
                                      fontSize: '11px'
                                    }}
                                  >
                                    {log.resource_type.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                                  <small style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                  </small>
                                </div>
                                <button 
                                  onClick={() => {
                                    setSelectedLog(log)
                                    setShowDetails(true)
                                  }}
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                >
                                  <Eye size={14} />
                                  Details
                                </button>
                              </div>
                            </div>
                            <p className="mb-2" style={{ color: 'var(--text-primary)' }}>
                              {log.details}
                            </p>
                            <div className="d-flex flex-wrap gap-3 text-sm">
                              <div className="d-flex align-items-center gap-1">
                                <User size={14} style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                  {log.user_name} ({log.user_role})
                                </span>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                  {log.ip_address}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Details Modal */}
        {showDetails && selectedLog && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modern-card">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title" style={{ color: 'var(--text-primary)' }}>
                    Audit Log Details
                  </h5>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="btn-close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Timestamp
                      </label>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(selectedLog.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Action
                      </label>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {formatAction(selectedLog.action)}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        User
                      </label>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {selectedLog.user_name} ({selectedLog.user_role})
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Resource Type
                      </label>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {selectedLog.resource_type}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        IP Address
                      </label>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {selectedLog.ip_address}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Severity
                      </label>
                      <span 
                        className="badge px-2 py-1"
                        style={{ 
                          backgroundColor: `${getSeverityColor(selectedLog.severity)}20`,
                          color: getSeverityColor(selectedLog.severity)
                        }}
                      >
                        {selectedLog.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Details
                      </label>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {selectedLog.details}
                      </p>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        User Agent
                      </label>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {selectedLog.user_agent}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="btn btn-outline-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}