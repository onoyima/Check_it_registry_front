import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Smartphone, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Shield,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { Link } from 'react-router-dom'

interface DashboardStats {
  users: {
    total: number
    new_24h: number
    verified: number
    growth_rate: number
  }
  devices: {
    total: number
    new_24h: number
    verified: number
    stolen: number
    lost: number
    found: number
  }
  reports: {
    total: number
    new_24h: number
    open: number
    resolved: number
    under_review: number
  }
  system: {
    uptime: string
    response_time: number
    error_rate: number
    active_sessions: number
  }
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'device_registration' | 'report_filed' | 'device_verified' | 'system_alert'
  description: string
  timestamp: string
  user?: string
  severity?: 'low' | 'medium' | 'high'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toasts, removeToast, showSuccess, showError } = useToast()

  // Unified API base
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const res = await fetch(`${API_URL}/admin-dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load admin statistics')
      }

      // Map backend stats into UI structure
      const devicesByStatus: Record<string, number> = {}
      for (const row of (data.devices_by_status || [])) {
        if (row?.status) devicesByStatus[row.status] = row.count || 0
      }

      const reportsByType: Record<string, number> = {}
      for (const row of (data.reports_by_type || [])) {
        if (row?.report_type) reportsByType[row.report_type] = row.count || 0
      }

      const mapped: DashboardStats = {
        users: {
          total: data.total_users || 0,
          new_24h: data.new_users_30_days || 0, // backend provides 30d; show as-is
          verified: 0, // not provided; keep 0 or derive if endpoint added
          growth_rate: 0 // not provided; placeholder
        },
        devices: {
          total: data.total_devices || 0,
          new_24h: data.new_devices_30_days || 0,
          verified: devicesByStatus['verified'] || 0,
          stolen: devicesByStatus['stolen'] || 0,
          lost: devicesByStatus['lost'] || 0,
          found: devicesByStatus['found'] || 0
        },
        reports: {
          total: data.total_reports || 0,
          new_24h: 0,
          open: data.active_cases || 0,
          resolved: 0,
          under_review: 0
        },
        system: {
          uptime: '—',
          response_time: 0,
          error_rate: 0,
          active_sessions: 0
        }
      }

      setStats(mapped)

      // Fetch recent reports for activity feed
      const reportsRes = await fetch(`${API_URL}/admin-dashboard/reports?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const reportsData = await reportsRes.json().catch(() => ({}))
      if (reportsRes.ok && Array.isArray(reportsData?.reports)) {
        const activities: RecentActivity[] = reportsData.reports.map((r: any) => {
          const severity: 'low' | 'medium' | 'high' =
            r.report_type === 'stolen' ? 'high' : r.report_type === 'lost' ? 'medium' : 'low'
          const desc = `New ${r.report_type} report for ${r.brand ?? ''} ${r.model ?? ''} (Case ${r.case_id})`
          return {
            id: r.id,
            type: 'report_filed',
            description: desc.trim(),
            timestamp: r.created_at,
            user: r.reporter_name || r.owner_name || 'Unknown',
            severity
          }
        })
        setRecentActivity(activities)
      } else {
        setRecentActivity([])
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard data'
      showError('Loading Error', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
    showSuccess('Data Refreshed', 'Dashboard data has been updated')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return Users
      case 'device_registration': return Smartphone
      case 'report_filed': return FileText
      case 'device_verified': return CheckCircle
      case 'system_alert': return AlertTriangle
      default: return Activity
    }
  }

  const getActivityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'var(--danger-500)'
      case 'medium': return 'var(--warning-500)'
      case 'low': return 'var(--success-500)'
      default: return 'var(--primary-500)'
    }
  }

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading admin dashboard...</p>
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
                  Admin Dashboard
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  System overview and management controls
                </p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  onClick={handleRefresh}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={refreshing}
                >
                  <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                  Refresh
                </button>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <>
            {/* Main Stats Cards */}
            <div className="row g-4 mb-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="col-lg-3 col-md-6"
              >
                <div className="modern-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                      }}
                    >
                      <Users size={24} style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <TrendingUp size={16} style={{ color: 'var(--success-500)' }} />
                      <span style={{ color: 'var(--success-500)', fontSize: '12px' }}>
                        +{stats.users.growth_rate}%
                      </span>
                    </div>
                  </div>
                  <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats.users.total.toLocaleString()}
                  </h3>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Total Users
                  </p>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    +{stats.users.new_24h} new today
                  </small>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="col-lg-3 col-md-6"
              >
                <div className="modern-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                      }}
                    >
                      <Smartphone size={24} style={{ color: 'var(--success-500)' }} />
                    </div>
                  </div>
                  <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats.devices.total.toLocaleString()}
                  </h3>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Registered Devices
                  </p>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    +{stats.devices.new_24h} new today
                  </small>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="col-lg-3 col-md-6"
              >
                <div className="modern-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)' 
                      }}
                    >
                      <FileText size={24} style={{ color: 'var(--danger-500)' }} />
                    </div>
                  </div>
                  <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats.reports.total.toLocaleString()}
                  </h3>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Total Reports
                  </p>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {stats.reports.open} open cases
                  </small>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-lg-3 col-md-6"
              >
                <div className="modern-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(245, 158, 11, 0.1)' 
                      }}
                    >
                      <Activity size={24} style={{ color: 'var(--warning-500)' }} />
                    </div>
                  </div>
                  <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats.system.uptime}
                  </h3>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    System Uptime
                  </p>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {stats.system.active_sessions} active sessions
                  </small>
                </div>
              </motion.div>
            </div>

            {/* Detailed Stats */}
            <div className="row g-4 mb-5">
              {/* Device Status Breakdown */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="col-lg-6"
              >
                <div className="modern-card p-4">
                  <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                    Device Status Overview
                  </h3>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-2"
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: 'var(--success-500)' 
                          }}
                        />
                        <span style={{ color: 'var(--text-primary)' }}>Verified</span>
                      </div>
                      <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        {stats.devices.verified.toLocaleString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-2"
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: 'var(--danger-500)' 
                          }}
                        />
                        <span style={{ color: 'var(--text-primary)' }}>Stolen</span>
                      </div>
                      <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        {stats.devices.stolen.toLocaleString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-2"
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: 'var(--warning-500)' 
                          }}
                        />
                        <span style={{ color: 'var(--text-primary)' }}>Lost</span>
                      </div>
                      <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        {stats.devices.lost.toLocaleString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-2"
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: 'var(--primary-500)' 
                          }}
                        />
                        <span style={{ color: 'var(--text-primary)' }}>Found</span>
                      </div>
                      <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        {stats.devices.found.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* System Performance */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="col-lg-6"
              >
                <div className="modern-card p-4">
                  <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                    System Performance
                  </h3>
                  <div className="d-flex flex-column gap-4">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ color: 'var(--text-primary)' }}>Response Time</span>
                        <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                          {stats.system.response_time}ms
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: '75%',
                            backgroundColor: 'var(--success-500)'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ color: 'var(--text-primary)' }}>Error Rate</span>
                        <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                          {stats.system.error_rate}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: '2%',
                            backgroundColor: 'var(--success-500)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Quick Actions & Recent Activity */}
        <div className="row g-4 mb-5">
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="col-lg-4"
          >
            <div className="modern-card p-4">
              <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                Quick Actions
              </h3>
              <div className="d-flex flex-column gap-3">
                <Link to="/user-management" className="btn btn-outline-primary d-flex align-items-center gap-3 text-start">
                  <Users size={20} />
                  <div>
                    <div className="fw-medium">Manage Users</div>
                    <small style={{ color: 'var(--text-secondary)' }}>User roles and permissions</small>
                  </div>
                </Link>
                <Link to="/analytics" className="btn btn-outline-primary d-flex align-items-center gap-3 text-start">
                  <BarChart3 size={20} />
                  <div>
                    <div className="fw-medium">View Analytics</div>
                    <small style={{ color: 'var(--text-secondary)' }}>Detailed reports and insights</small>
                  </div>
                </Link>
                <Link to="/audit-trail" className="btn btn-outline-primary d-flex align-items-center gap-3 text-start">
                  <Shield size={20} />
                  <div>
                    <div className="fw-medium">Audit Trail</div>
                    <small style={{ color: 'var(--text-secondary)' }}>System logs and security</small>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="col-lg-8"
          >
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 mb-0" style={{ color: 'var(--text-primary)' }}>
                  Recent Activity
                </h3>
                <Link to="/audit-trail" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2">
                  <Eye size={16} />
                  View All
                </Link>
              </div>
              <div className="d-flex flex-column gap-3">
                {recentActivity.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type)
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (index * 0.1) }}
                      className="d-flex align-items-center gap-3 p-3 rounded-3"
                      style={{ backgroundColor: 'var(--gray-50)' }}
                    >
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ 
                          width: '32px', 
                          height: '32px',
                          backgroundColor: `${getActivityColor(activity.severity)}20`
                        }}
                      >
                        <IconComponent size={16} style={{ color: getActivityColor(activity.severity) }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>
                          {activity.description}
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          {activity.user && (
                            <small style={{ color: 'var(--text-secondary)' }}>
                              by {activity.user}
                            </small>
                          )}
                          <small style={{ color: 'var(--text-secondary)' }}>
                            {new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}