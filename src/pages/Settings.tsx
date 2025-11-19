import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Mail, 
  Smartphone, 
  Eye,
  Save,
  RefreshCw,
  Lock,
  Key,
  Trash2,
  Download
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { useTheme } from '../contexts/ThemeContext'

interface UserPreferences {
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  device_alerts: boolean
  transfer_notifications: boolean
  verification_notifications: boolean
  report_updates: boolean
  marketing_emails: boolean
  language: string
  timezone: string
  two_factor_enabled: boolean
}

export default function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    device_alerts: true,
    transfer_notifications: true,
    verification_notifications: true,
    report_updates: true,
    marketing_emails: false,
    language: 'en',
    timezone: 'Africa/Lagos',
    two_factor_enabled: false
  })

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'privacy' | 'security'>('notifications')
  const { theme, toggleTheme } = useTheme()
  const { toasts, removeToast, showSuccess, showError } = useToast()

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showSuccess('Settings Saved', 'Your preferences have been updated successfully')
    } catch (err) {
      console.error('Error saving preferences:', err)
      showError('Save Failed', 'Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield }
  ]

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
                  Settings
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Customize your preferences and account settings
                </p>
              </div>
              <button 
                onClick={handleSave}
                className="btn-gradient-primary d-flex align-items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="row g-4">
          {/* Sidebar Navigation */}
          <div className="col-lg-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="modern-card p-3"
            >
              <nav className="nav flex-column">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`nav-link d-flex align-items-center gap-3 p-3 rounded-3 border-0 text-start ${
                        activeTab === tab.id ? 'active' : ''
                      }`}
                      style={{
                        backgroundColor: activeTab === tab.id ? 'var(--primary-100)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--text-secondary)',
                        marginBottom: '8px'
                      }}
                    >
                      <IconComponent size={20} />
                      <span className="fw-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          </div>

          {/* Settings Content */}
          <div className="col-lg-9">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="modern-card p-4"
            >
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                    <Bell size={20} className="me-2" />
                    Notification Preferences
                  </h3>
                  
                  <div className="row g-4">
                    <div className="col-12">
                      <h6 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Device & Security Alerts
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                          <div>
                            <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Device Alerts</p>
                            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              Get notified when your devices are checked or reported
                            </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.device_alerts}
                              onChange={(e) => updatePreference('device_alerts', e.target.checked)}
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                          <div>
                            <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Transfer Notifications</p>
                            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              Notifications about device ownership transfers
                            </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.transfer_notifications}
                              onChange={(e) => updatePreference('transfer_notifications', e.target.checked)}
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                          <div>
                            <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Report Updates</p>
                            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              Updates on your theft and loss reports
                            </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.report_updates}
                              onChange={(e) => updatePreference('report_updates', e.target.checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <h6 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Communication Channels
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                          <div className="d-flex align-items-center gap-3">
                            <Mail size={20} style={{ color: 'var(--primary-600)' }} />
                            <div>
                              <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</p>
                              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Receive notifications via email
                              </p>
                            </div>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.email_notifications}
                              onChange={(e) => updatePreference('email_notifications', e.target.checked)}
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                          <div className="d-flex align-items-center gap-3">
                            <Smartphone size={20} style={{ color: 'var(--success-500)' }} />
                            <div>
                              <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>SMS Notifications</p>
                              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Receive critical alerts via SMS
                              </p>
                            </div>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.sms_notifications}
                              onChange={(e) => updatePreference('sms_notifications', e.target.checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                    <Palette size={20} className="me-2" />
                    Appearance & Display
                  </h3>
                  
                  <div className="row g-4">
                    <div className="col-12">
                      <h6 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Theme Preference
                      </h6>
                      <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                        <div>
                          <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
                          <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Switch between light and dark themes
                          </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        <Globe size={16} className="me-2" />
                        Language
                      </label>
                      <select
                        className="modern-input"
                        value={preferences.language}
                        onChange={(e) => updatePreference('language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="ha">Hausa</option>
                        <option value="yo">Yoruba</option>
                        <option value="ig">Igbo</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Timezone
                      </label>
                      <select
                        className="modern-input"
                        value={preferences.timezone}
                        onChange={(e) => updatePreference('timezone', e.target.value)}
                      >
                        <option value="Africa/Lagos">West Africa Time (WAT)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                    <Eye size={20} className="me-2" />
                    Privacy & Data
                  </h3>
                  
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                          <div>
                            <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Marketing Emails</p>
                            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              Receive promotional emails and product updates
                            </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.marketing_emails}
                              onChange={(e) => updatePreference('marketing_emails', e.target.checked)}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-3 border" style={{ borderColor: 'var(--border-color)' }}>
                          <h6 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                            Data Export & Deletion
                          </h6>
                          <div className="d-flex flex-column flex-sm-row gap-3">
                            <button className="btn btn-outline-primary d-flex align-items-center gap-2">
                              <Download size={16} />
                              Export My Data
                            </button>
                            <button className="btn btn-outline-danger d-flex align-items-center gap-2">
                              <Trash2 size={16} />
                              Delete Account
                            </button>
                          </div>
                          <p className="mb-0 mt-3" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Export your data or permanently delete your account and all associated data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                    <Shield size={20} className="me-2" />
                    Security Settings
                  </h3>
                  
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="d-flex flex-column gap-4">
                        <div className="p-4 rounded-3 border" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</p>
                              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={preferences.two_factor_enabled}
                                onChange={(e) => updatePreference('two_factor_enabled', e.target.checked)}
                              />
                            </div>
                          </div>
                          {preferences.two_factor_enabled && (
                            <div className="alert alert-success d-flex align-items-center gap-2">
                              <Shield size={16} />
                              <span>Two-factor authentication is enabled</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-3 border" style={{ borderColor: 'var(--border-color)' }}>
                          <h6 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                            Password & Authentication
                          </h6>
                          <div className="d-flex flex-column flex-sm-row gap-3">
                            <button className="btn btn-outline-primary d-flex align-items-center gap-2">
                              <Lock size={16} />
                              Change Password
                            </button>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                              <Key size={16} />
                              Manage API Keys
                            </button>
                          </div>
                        </div>

                        <div className="p-4 rounded-3 border" style={{ borderColor: 'var(--border-color)' }}>
                          <h6 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                            Active Sessions
                          </h6>
                          <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)' }}>
                            <div>
                              <p className="mb-1 fw-medium" style={{ color: 'var(--text-primary)' }}>Current Session</p>
                              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Windows • Chrome • Lagos, Nigeria
                              </p>
                            </div>
                            <span className="badge bg-success">Active</span>
                          </div>
                          <button className="btn btn-outline-danger btn-sm mt-3 d-flex align-items-center gap-2">
                            <RefreshCw size={14} />
                            Revoke All Sessions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}