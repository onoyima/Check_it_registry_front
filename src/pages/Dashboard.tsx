import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  TrendingUp,
  Activity,
  Clock,
  Search,
  FileText,
  BarChart3,
  Eye,
  Edit,
  MoreVertical,
  Bell,
  User,
  Settings,
  QrCode,
  MapPin,
  Calendar
} from 'lucide-react'

import { Device, Report } from '../types/database'
import { useToast, ToastContainer } from '../components/Toast'
import { Layout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

interface RecentActivity {
  id: string
  type: 'device_registered' | 'device_verified' | 'report_filed' | 'device_found' | 'system_alert'
  title: string
  description: string
  timestamp: string
  icon: string
  severity: 'low' | 'medium' | 'high'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toasts, removeToast, showError, showWarning } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const [devicesRes, reportsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/device-management`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/report-management`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (!devicesRes.ok) {
        throw new Error('Failed to fetch devices')
      }

      const devicesData = await devicesRes.json()
      setDevices(devicesData || [])

      // Reports endpoint might not exist yet, so handle gracefully
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData || [])
      } else {
        setReports([])
      }

      // Mock recent activity data
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'device_registered',
          title: 'Device Registered',
          description: 'iPhone 14 Pro successfully registered',
          timestamp: '2 hours ago',
          icon: 'smartphone',
          severity: 'low'
        },
        {
          id: '2',
          type: 'device_verified',
          title: 'Device Verified',
          description: 'Samsung Galaxy S23 verification completed',
          timestamp: '1 day ago',
          icon: 'shield',
          severity: 'low'
        },
        {
          id: '3',
          type: 'system_alert',
          title: 'Security Alert',
          description: 'New login detected from unknown device',
          timestamp: '2 days ago',
          icon: 'alert',
          severity: 'medium'
        }
      ]
      setRecentActivity(mockActivity)
      
      if (devicesData?.length === 0) {
        showWarning('Welcome!', 'Start by registering your first device to protect it from theft.')
      }
    } catch (err) {
      console.error('Error loading data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(errorMessage)
      showError('Loading Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return { icon: CheckCircle, color: 'var(--success-500)' }
      case 'unverified': return { icon: Clock, color: 'var(--warning-500)' }
      case 'stolen': return { icon: AlertTriangle, color: 'var(--danger-500)' }
      case 'lost': return { icon: Search, color: 'var(--warning-500)' }
      case 'found': return { icon: Shield, color: 'var(--primary-500)' }
      default: return { icon: Activity, color: 'var(--gray-500)' }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'status-verified'
      case 'unverified': return 'status-unverified'
      case 'stolen': case 'lost': return 'status-stolen'
      case 'found': return 'status-found'
      default: return 'status-pending'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'device_registered': return Smartphone
      case 'device_verified': return Shield
      case 'report_filed': return FileText
      case 'device_found': return MapPin
      case 'system_alert': return AlertTriangle
      default: return Activity
    }
  }

  const getActivityColor = (severity: string) => {
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
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout requireAuth>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <AlertTriangle size={48} style={{ color: 'var(--danger-500)' }} className="mb-3" />
            <h3 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>Unable to load dashboard</h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button 
              onClick={loadData}
              className="btn-gradient-primary d-flex align-items-center gap-2"
            >
              <Activity size={18} />
              Try Again
            </button>
          </motion.div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    )
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        {/* User Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row mb-4"
        >
          <div className="col-12">
            <div className="modern-card p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: 'var(--primary-100)',
                      border: '3px solid var(--primary-200)'
                    }}
                  >
                    <User size={28} style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <div>
                    <h1 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                      Welcome back, {user?.name || user?.email || 'User'}!
                    </h1>
                    <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                      {user?.role === 'admin' ? 'Administrator' : user?.role === 'business' ? 'Business User' : 'Individual User'}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Link to="/notifications" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                    <Bell size={16} />
                    <span className="d-none d-sm-inline">Notifications</span>
                  </Link>
                  <Link to="/profile" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                    <Settings size={16} />
                    <span className="d-none d-sm-inline">Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="row mb-4"
        >
          <div className="col-12">
            <div className="modern-card p-4">
              <h2 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
              <div className="row g-3">
                <div className="col-md-4">
                  <Link to="/register-device" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 text-decoration-none">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                      }}
                    >
                      <Plus size={24} style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <h3 className="h6 mb-1" style={{ color: 'var(--text-primary)' }}>Register Device</h3>
                    <p className="mb-0 text-center" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Add a new device to your protection
                    </p>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/device-check" className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 text-decoration-none">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                      }}
                    >
                      <QrCode size={24} style={{ color: 'var(--success-600)' }} />
                    </div>
                    <h3 className="h6 mb-1" style={{ color: 'var(--text-primary)' }}>Check Device</h3>
                    <p className="mb-0 text-center" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Scan & verify device status
                    </p>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/report-missing" className="btn btn-outline-danger w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 text-decoration-none">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)' 
                      }}
                    >
                      <AlertTriangle size={24} style={{ color: 'var(--danger-600)' }} />
                    </div>
                    <h3 className="h6 mb-1" style={{ color: 'var(--text-primary)' }}>Report Incident</h3>
                    <p className="mb-0 text-center" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Report theft or loss immediately
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-md-4"
          >
            <div className="modern-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-2 fw-medium" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Devices</p>
                  <div className="d-flex align-items-baseline">
                    <h2 className="display-5 fw-bold mb-0 me-2" style={{ color: 'var(--text-primary)' }}>{devices.length}</h2>
                    <TrendingUp size={20} style={{ color: 'var(--success-500)' }} />
                  </div>
                  <p className="mb-0 mt-1" style={{ color: 'var(--success-500)', fontSize: '14px' }}>Active protection</p>
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                  }}
                >
                  <Smartphone size={24} style={{ color: 'var(--primary-600)' }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-md-4"
          >
            <div className="modern-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-2 fw-medium" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>At Risk</p>
                  <div className="d-flex align-items-baseline">
                    <h2 className="display-5 fw-bold mb-0 me-2" style={{ color: 'var(--text-primary)' }}>
                      {devices.filter(d => d.status === 'stolen' || d.status === 'lost').length}
                    </h2>
                    {devices.filter(d => d.status === 'stolen' || d.status === 'lost').length === 0 && (
                      <CheckCircle size={20} style={{ color: 'var(--success-500)' }} />
                    )}
                  </div>
                  <p 
                    className="mb-0 mt-1" 
                    style={{ 
                      color: devices.filter(d => d.status === 'stolen' || d.status === 'lost').length === 0 ? 'var(--success-500)' : 'var(--danger-500)',
                      fontSize: '14px'
                    }}
                  >
                    {devices.filter(d => d.status === 'stolen' || d.status === 'lost').length === 0 ? 'All devices safe' : 'Requires attention'}
                  </p>
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)' 
                  }}
                >
                  <AlertTriangle size={24} style={{ color: 'var(--danger-500)' }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-md-4"
          >
            <div className="modern-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-2 fw-medium" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verified</p>
                  <div className="d-flex align-items-baseline">
                    <h2 className="display-5 fw-bold mb-0 me-2" style={{ color: 'var(--text-primary)' }}>
                      {devices.filter(d => d.status === 'verified').length}
                    </h2>
                    <BarChart3 size={20} style={{ color: 'var(--primary-500)' }} />
                  </div>
                  <p className="mb-0 mt-1" style={{ color: 'var(--primary-500)', fontSize: '14px' }}>
                    {Math.round((devices.filter(d => d.status === 'verified').length / Math.max(devices.length, 1)) * 100)}% verified
                  </p>
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                  }}
                >
                  <Shield size={24} style={{ color: 'var(--success-500)' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Row */}
        <div className="row g-4 mb-5">
          {/* My Devices Section */}
          <div className="col-lg-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="modern-card">
                <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                    <div className="mb-3 mb-sm-0">
                      <h2 className="h4 mb-1 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                        <Smartphone size={24} className="me-2" style={{ color: 'var(--primary-600)' }} />
                        My Devices
                      </h2>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Manage your registered devices</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Link to="/register-device" className="btn-gradient-primary btn-sm d-flex align-items-center gap-2">
                        <Plus size={16} />
                        Register
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {devices.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-5"
                    >
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                        }}
                      >
                        <Smartphone size={40} style={{ color: 'var(--primary-600)' }} />
                      </div>
                      <h3 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>No devices registered</h3>
                      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Register your first device to get started with protection.</p>
                      <Link to="/register-device" className="btn-gradient-primary d-flex align-items-center gap-2 mx-auto" style={{ width: 'fit-content' }}>
                        <Plus size={18} />
                        Register Your First Device
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      {/* Device Carousel for Mobile */}
                      <div className="d-block d-lg-none mb-4">
                        <div className="row g-3">
                          {devices.slice(0, 3).map((device, index) => {
                            const { icon: StatusIcon } = getStatusIcon(device.status);
                            return (
                              <div key={device.id} className="col-12">
                                <div 
                                  className="p-3 rounded-3 border"
                                  style={{ 
                                    borderColor: 'var(--border-color)',
                                    backgroundColor: 'var(--bg-primary)'
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-3">
                                    <div 
                                      className="d-flex align-items-center justify-content-center rounded-3"
                                      style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                                      }}
                                    >
                                      <Smartphone size={20} style={{ color: 'var(--primary-600)' }} />
                                    </div>
                                    <div className="flex-grow-1">
                                      <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>{device.brand} {device.model}</p>
                                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{device.imei || device.serial}</p>
                                    </div>
                                    <span className={`status-badge ${getStatusBadge(device.status)} d-flex align-items-center gap-1`}>
                                      <StatusIcon size={12} />
                                      {device.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {devices.length > 3 && (
                          <div className="text-center mt-3">
                            <Link to="/my-devices" className="btn btn-outline-primary btn-sm">
                              View All {devices.length} Devices
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Desktop Table */}
                      <div className="d-none d-lg-block">
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
                            <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                              <tr>
                                <th className="border-0 fw-semibold py-3" style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Device</th>
                                <th className="border-0 fw-semibold py-3" style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>IMEI / Serial</th>
                                <th className="border-0 fw-semibold py-3" style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th className="border-0 fw-semibold py-3" style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered</th>
                                <th className="border-0 fw-semibold py-3" style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {devices.map((device, index) => {
                                const { icon: StatusIcon } = getStatusIcon(device.status);
                                return (
                                  <motion.tr 
                                    key={device.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border-0"
                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                  >
                                    <td className="py-3">
                                      <div className="d-flex align-items-center gap-3">
                                        <div 
                                          className="d-flex align-items-center justify-content-center rounded-3"
                                          style={{ 
                                            width: '40px', 
                                            height: '40px', 
                                            backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                                          }}
                                        >
                                          <Smartphone size={20} style={{ color: 'var(--primary-600)' }} />
                                        </div>
                                        <div>
                                          <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>{device.brand} {device.model}</p>
                                          {device.color && (
                                            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{device.color}</p>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3">
                                      <div>
                                        <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>{device.imei || '-'}</p>
                                        <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{device.serial || '-'}</p>
                                      </div>
                                    </td>
                                    <td className="py-3">
                                      <span className={`status-badge ${getStatusBadge(device.status)} d-flex align-items-center gap-1`}>
                                        <StatusIcon size={12} />
                                        {device.status}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        {new Date(device.created_at).toLocaleDateString()}
                                      </p>
                                    </td>
                                    <td className="py-3">
                                      <div className="d-flex align-items-center gap-2">
                                        <button className="btn btn-sm btn-link p-2" style={{ color: 'var(--text-secondary)' }}>
                                          <Eye size={16} />
                                        </button>
                                        <button className="btn btn-sm btn-link p-2" style={{ color: 'var(--text-secondary)' }}>
                                          <Edit size={16} />
                                        </button>
                                        <button className="btn btn-sm btn-link p-2" style={{ color: 'var(--text-secondary)' }}>
                                          <MoreVertical size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Section */}
          <div className="col-lg-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="modern-card">
                <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <h2 className="h5 mb-1 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                    <Activity size={20} className="me-2" style={{ color: 'var(--primary-600)' }} />
                    Recent Activity
                  </h2>
                  <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Latest updates and alerts</p>
                </div>

                <div className="p-4">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-4">
                      <Activity size={32} style={{ color: 'var(--text-secondary)' }} className="mb-3" />
                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No recent activity</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {recentActivity.map((activity, index) => {
                        const ActivityIcon = getActivityIcon(activity.type);
                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="d-flex align-items-start gap-3"
                          >
                            <div 
                              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: `${getActivityColor(activity.severity)}20`,
                                border: `2px solid ${getActivityColor(activity.severity)}30`
                              }}
                            >
                              <ActivityIcon size={14} style={{ color: getActivityColor(activity.severity) }} />
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                                {activity.title}
                              </p>
                              <p className="mb-1" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                {activity.description}
                              </p>
                              <div className="d-flex align-items-center gap-2">
                                <Calendar size={12} style={{ color: 'var(--text-secondary)' }} />
                                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                  {activity.timestamp}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* My Reports Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="row mb-5"
        >
          <div className="col-12">
            <div className="modern-card">
              <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                  <div className="mb-3 mb-sm-0">
                    <h2 className="h4 mb-1 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                      <FileText size={24} className="me-2" style={{ color: 'var(--primary-600)' }} />
                      My Reports
                    </h2>
                    <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Track your theft and loss reports</p>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex gap-2">
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                          color: 'var(--primary-800)',
                          fontSize: '12px'
                        }}
                      >
                        {reports.length} Total
                      </span>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                          color: 'var(--warning-800)',
                          fontSize: '12px'
                        }}
                      >
                        {reports.filter(r => r.status === 'open').length} Open
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {reports.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-5"
                  >
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                      }}
                    >
                      <FileText size={40} style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <h3 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>No reports filed</h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>You haven't filed any theft or loss reports yet.</p>
                    <Link to="/report-missing" className="btn-gradient-danger d-flex align-items-center gap-2 mx-auto" style={{ width: 'fit-content' }}>
                      <AlertTriangle size={18} />
                      Report Missing Device
                    </Link>
                  </motion.div>
                ) : (
                  <div className="row g-3">
                    {reports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="col-12"
                      >
                        <div 
                          className="p-4 rounded-3 border"
                          style={{ 
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'var(--bg-primary)'
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <div 
                                className="d-flex align-items-center justify-content-center rounded-3"
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  backgroundColor: 'rgba(245, 158, 11, 0.1)' 
                                }}
                              >
                                <FileText size={20} style={{ color: 'var(--warning-600)' }} />
                              </div>
                              <div>
                                <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>{report.case_id}</p>
                                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                  {report.devices && `${report.devices.brand} ${report.devices.model}`}
                                </p>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <span className={`status-badge ${getStatusBadge(report.status)} text-capitalize`}>
                                {report.status.replace('_', ' ')}
                              </span>
                              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {new Date(report.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}