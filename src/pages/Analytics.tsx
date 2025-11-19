import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Smartphone, 
  FileText, 
  Download,
  RefreshCw
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'

interface AnalyticsData {
  overview: {
    total_users: number
    total_devices: number
    total_reports: number
    recovery_rate: number
    user_growth: number
    device_growth: number
  }
  trends: {
    user_registrations: Array<{ date: string; count: number }>
    device_registrations: Array<{ date: string; count: number }>
    reports_filed: Array<{ date: string; count: number }>
  }
  demographics: {
    regions: Array<{ name: string; users: number; devices: number }>
    user_types: Array<{ type: string; count: number; percentage: number }>
    device_brands: Array<{ brand: string; count: number; percentage: number }>
  }
  security: {
    theft_reports: number
    loss_reports: number
    recovery_success: number
    average_recovery_time: number
  }
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'demographics' | 'security'>('overview')
  const { toasts, removeToast, showError } = useToast()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      const mockData: AnalyticsData = {
        overview: {
          total_users: 12847,
          total_devices: 45632,
          total_reports: 1247,
          recovery_rate: 67.8,
          user_growth: 12.5,
          device_growth: 18.3
        },
        trends: {
          user_registrations: [
            { date: '2024-01-15', count: 45 },
            { date: '2024-01-16', count: 52 },
            { date: '2024-01-17', count: 38 },
            { date: '2024-01-18', count: 67 },
            { date: '2024-01-19', count: 43 },
            { date: '2024-01-20', count: 58 },
            { date: '2024-01-21', count: 72 }
          ],
          device_registrations: [
            { date: '2024-01-15', count: 123 },
            { date: '2024-01-16', count: 145 },
            { date: '2024-01-17', count: 98 },
            { date: '2024-01-18', count: 167 },
            { date: '2024-01-19', count: 134 },
            { date: '2024-01-20', count: 189 },
            { date: '2024-01-21', count: 201 }
          ],
          reports_filed: [
            { date: '2024-01-15', count: 8 },
            { date: '2024-01-16', count: 12 },
            { date: '2024-01-17', count: 6 },
            { date: '2024-01-18', count: 15 },
            { date: '2024-01-19', count: 9 },
            { date: '2024-01-20', count: 11 },
            { date: '2024-01-21', count: 13 }
          ]
        },
        demographics: {
          regions: [
            { name: 'Lagos', users: 4567, devices: 16234 },
            { name: 'Abuja', users: 2345, devices: 8901 },
            { name: 'Kano', users: 1876, devices: 6543 },
            { name: 'Port Harcourt', users: 1543, devices: 5432 },
            { name: 'Ibadan', users: 1234, devices: 4321 }
          ],
          user_types: [
            { type: 'Regular Users', count: 10456, percentage: 81.4 },
            { type: 'Business Users', count: 1876, percentage: 14.6 },
            { type: 'Law Enforcement', count: 345, percentage: 2.7 },
            { type: 'Administrators', count: 170, percentage: 1.3 }
          ],
          device_brands: [
            { brand: 'Samsung', count: 15678, percentage: 34.4 },
            { brand: 'Apple', count: 12345, percentage: 27.1 },
            { brand: 'Tecno', count: 8901, percentage: 19.5 },
            { brand: 'Infinix', count: 5432, percentage: 11.9 },
            { brand: 'Others', count: 3276, percentage: 7.1 }
          ]
        },
        security: {
          theft_reports: 789,
          loss_reports: 458,
          recovery_success: 845,
          average_recovery_time: 72
        }
      }

      setData(mockData)
    } catch (err) {
      console.error('Error loading analytics data:', err)
      showError('Loading Error', 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'security', label: 'Security', icon: FileText }
  ]

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
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
                  Analytics & Insights
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Comprehensive platform analytics and reporting
                </p>
              </div>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button 
                  onClick={loadAnalyticsData}
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

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="row mb-4"
        >
          <div className="col-12">
            <div className="modern-card p-3">
              <nav className="nav nav-pills justify-content-center justify-content-md-start">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`nav-link d-flex align-items-center gap-2 ${
                        activeTab === tab.id ? 'active' : ''
                      }`}
                      style={{
                        backgroundColor: activeTab === tab.id ? 'var(--primary-600)' : 'transparent',
                        color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        margin: '0 4px'
                      }}
                    >
                      <IconComponent size={18} />
                      <span className="fw-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {data && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="row g-4 mb-5">
                  <div className="col-lg-3 col-md-6">
                    <div className="modern-card p-4 text-center">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                        }}
                      >
                        <Users size={24} style={{ color: 'var(--primary-600)' }} />
                      </div>
                      <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                        {data.overview.total_users.toLocaleString()}
                      </h3>
                      <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Total Users
                      </p>
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <TrendingUp size={14} style={{ color: 'var(--success-500)' }} />
                        <small style={{ color: 'var(--success-500)' }}>
                          +{data.overview.user_growth}%
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="modern-card p-4 text-center">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                        }}
                      >
                        <Smartphone size={24} style={{ color: 'var(--success-500)' }} />
                      </div>
                      <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                        {data.overview.total_devices.toLocaleString()}
                      </h3>
                      <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Registered Devices
                      </p>
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <TrendingUp size={14} style={{ color: 'var(--success-500)' }} />
                        <small style={{ color: 'var(--success-500)' }}>
                          +{data.overview.device_growth}%
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="modern-card p-4 text-center">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)' 
                        }}
                      >
                        <FileText size={24} style={{ color: 'var(--danger-500)' }} />
                      </div>
                      <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                        {data.overview.total_reports.toLocaleString()}
                      </h3>
                      <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Total Reports
                      </p>
                      <small style={{ color: 'var(--text-secondary)' }}>
                        Theft & Loss Cases
                      </small>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="modern-card p-4 text-center">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: 'rgba(245, 158, 11, 0.1)' 
                        }}
                      >
                        <TrendingUp size={24} style={{ color: 'var(--warning-500)' }} />
                      </div>
                      <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                        {data.overview.recovery_rate}%
                      </h3>
                      <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Recovery Rate
                      </p>
                      <small style={{ color: 'var(--text-secondary)' }}>
                        Success Rate
                      </small>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Demographics Tab */}
            {activeTab === 'demographics' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="row g-4">
                  {/* Regional Distribution */}
                  <div className="col-lg-6">
                    <div className="modern-card p-4">
                      <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                        Regional Distribution
                      </h3>
                      <div className="d-flex flex-column gap-3">
                        {data.demographics.regions.map((region) => (
                          <div key={region.name} className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>
                                {region.name}
                              </p>
                              <small style={{ color: 'var(--text-secondary)' }}>
                                {region.users.toLocaleString()} users, {region.devices.toLocaleString()} devices
                              </small>
                            </div>
                            <div className="text-end">
                              <div 
                                className="progress mb-1"
                                style={{ width: '100px', height: '6px' }}
                              >
                                <div 
                                  className="progress-bar"
                                  style={{ 
                                    width: `${(region.users / data.overview.total_users) * 100}%`,
                                    backgroundColor: 'var(--primary-500)'
                                  }}
                                />
                              </div>
                              <small style={{ color: 'var(--text-secondary)' }}>
                                {((region.users / data.overview.total_users) * 100).toFixed(1)}%
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* User Types */}
                  <div className="col-lg-6">
                    <div className="modern-card p-4">
                      <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                        User Types
                      </h3>
                      <div className="d-flex flex-column gap-3">
                        {data.demographics.user_types.map((type) => (
                          <div key={type.type} className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>
                                {type.type}
                              </p>
                              <small style={{ color: 'var(--text-secondary)' }}>
                                {type.count.toLocaleString()} users
                              </small>
                            </div>
                            <div className="text-end">
                              <div 
                                className="progress mb-1"
                                style={{ width: '100px', height: '6px' }}
                              >
                                <div 
                                  className="progress-bar"
                                  style={{ 
                                    width: `${type.percentage}%`,
                                    backgroundColor: 'var(--success-500)'
                                  }}
                                />
                              </div>
                              <small style={{ color: 'var(--text-secondary)' }}>
                                {type.percentage}%
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Device Brands */}
                  <div className="col-12">
                    <div className="modern-card p-4">
                      <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                        Popular Device Brands
                      </h3>
                      <div className="row g-4">
                        {data.demographics.device_brands.map((brand, index) => (
                          <div key={brand.brand} className="col-md-2 col-sm-4 col-6">
                            <div className="text-center">
                              <div 
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                style={{ 
                                  width: '48px', 
                                  height: '48px',
                                  backgroundColor: `hsl(${index * 60}, 70%, 90%)`
                                }}
                              >
                                <Smartphone size={24} style={{ color: `hsl(${index * 60}, 70%, 50%)` }} />
                              </div>
                              <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>
                                {brand.brand}
                              </p>
                              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {brand.count.toLocaleString()}
                              </p>
                              <small style={{ color: 'var(--text-secondary)' }}>
                                {brand.percentage}%
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="row g-4">
                  <div className="col-lg-8">
                    <div className="modern-card p-4">
                      <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                        Security Overview
                      </h3>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="text-center p-4 rounded-3" style={{ backgroundColor: 'var(--danger-50)' }}>
                            <h4 className="h3 mb-2" style={{ color: 'var(--danger-600)' }}>
                              {data.security.theft_reports}
                            </h4>
                            <p className="mb-0" style={{ color: 'var(--text-primary)' }}>Theft Reports</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center p-4 rounded-3" style={{ backgroundColor: 'var(--warning-50)' }}>
                            <h4 className="h3 mb-2" style={{ color: 'var(--warning-600)' }}>
                              {data.security.loss_reports}
                            </h4>
                            <p className="mb-0" style={{ color: 'var(--text-primary)' }}>Loss Reports</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center p-4 rounded-3" style={{ backgroundColor: 'var(--success-50)' }}>
                            <h4 className="h3 mb-2" style={{ color: 'var(--success-600)' }}>
                              {data.security.recovery_success}
                            </h4>
                            <p className="mb-0" style={{ color: 'var(--text-primary)' }}>Successful Recoveries</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center p-4 rounded-3" style={{ backgroundColor: 'var(--primary-50)' }}>
                            <h4 className="h3 mb-2" style={{ color: 'var(--primary-600)' }}>
                              {data.security.average_recovery_time}h
                            </h4>
                            <p className="mb-0" style={{ color: 'var(--text-primary)' }}>Avg Recovery Time</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="modern-card p-4">
                      <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                        Recovery Success Rate
                      </h3>
                      <div className="text-center">
                        <div 
                          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                          style={{ 
                            width: '120px', 
                            height: '120px',
                            background: `conic-gradient(var(--success-500) 0deg ${data.overview.recovery_rate * 3.6}deg, var(--gray-200) ${data.overview.recovery_rate * 3.6}deg 360deg)`
                          }}
                        >
                          <div 
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{ 
                              width: '80px', 
                              height: '80px',
                              backgroundColor: 'var(--bg-primary)'
                            }}
                          >
                            <span className="h4 mb-0" style={{ color: 'var(--text-primary)' }}>
                              {data.overview.recovery_rate}%
                            </span>
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Overall device recovery success rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}