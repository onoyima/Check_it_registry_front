import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Smartphone,
  FileText,
  Activity,
  Lock,
  KeyRound,
  Settings as SettingsIcon
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  region?: string
  role: string
  profile_image_url?: string
  created_at: string
  verified_at?: string
  last_login_at?: string
  login_count: number
}

interface ProfileStats {
  total_devices: number
  verified_devices: number
  total_reports: number
  active_transfers: number
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    region: ''
  })
  const { toasts, removeToast, showSuccess, showError } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Mock profile data - replace with actual API call
      const mockProfile: UserProfile = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+234 801 234 5678',
        region: 'lagos',
        role: 'user',
        profile_image_url: '',
        created_at: '2024-01-10T08:00:00Z',
        verified_at: '2024-01-15T10:30:00Z',
        last_login_at: '2024-01-21T14:30:00Z',
        login_count: 25
      }

      const mockStats: ProfileStats = {
        total_devices: 3,
        verified_devices: 2,
        total_reports: 1,
        active_transfers: 0
      }

      setProfile(mockProfile)
      setStats(mockStats)
      setFormData({
        name: mockProfile.name,
        phone: mockProfile.phone || '',
        region: mockProfile.region || ''
      })
      // Mock 2FA status; replace with API integration when available
      setTwoFAEnabled(false)
    } catch (err) {
      console.error('Error loading profile:', err)
      showError('Loading Error', 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          phone: formData.phone,
          region: formData.region
        })
      }
      
      setEditing(false)
      showSuccess('Profile Updated', 'Your profile has been updated successfully')
    } catch (err) {
      console.error('Error saving profile:', err)
      showError('Save Failed', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || '',
        region: profile.region || ''
      })
    }
    setEditing(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'var(--danger-500)'
      case 'lea': return 'var(--warning-500)'
      case 'business': return 'var(--primary-500)'
      default: return 'var(--success-500)'
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'lea': return 'Law Enforcement'
      case 'business': return 'Business User'
      default: return 'Regular User'
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
            <p style={{ color: 'var(--text-secondary)' }}>Loading your profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout requireAuth>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="modern-card text-center p-5">
                <User size={48} className="mb-3" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>Profile Not Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Unable to load your profile information.
                </p>
                <button onClick={loadProfile} className="btn-gradient-primary">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
              <div className="mb-3 mb-sm-0">
                <h1 className="h3 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  My Profile
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Manage your personal information and account settings
                </p>
              </div>
              <div className="d-flex gap-2">
                {!editing ? (
                  <button 
                    onClick={() => setEditing(true)}
                    className="btn-gradient-primary d-flex align-items-center gap-2"
                  >
                    <Edit3 size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button 
                      onClick={handleCancel}
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      disabled={saving}
                    >
                      <X size={18} />
                      Cancel
                    </button>
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
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Profile Information */}
          <div className="col-lg-8">
            <div className="modern-card p-4 mb-4">
              <div className="d-flex align-items-center gap-4 mb-4">
                <div className="position-relative">
                  {profile.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt={profile.name}
                      className="rounded-circle"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ 
                        width: '80px', 
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%)',
                        fontSize: '24px'
                      }}
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button 
                    className="btn btn-sm btn-light rounded-circle position-absolute bottom-0 end-0"
                    style={{ width: '32px', height: '32px' }}
                    title="Change Photo"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {profile.name}
                  </h3>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {profile.email}
                  </p>
                  <span 
                    className="badge px-3 py-2"
                    style={{ 
                      backgroundColor: `${getRoleColor(profile.role)}20`,
                      color: getRoleColor(profile.role),
                      fontSize: '12px'
                    }}
                  >
                    <Shield size={12} className="me-1" />
                    {getRoleBadge(profile.role)}
                  </span>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    <User size={16} className="me-2" />
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      className="modern-input"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)', color: 'var(--text-primary)' }}>
                      {profile.name}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    <Mail size={16} className="me-2" />
                    Email Address
                  </label>
                  <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)', color: 'var(--text-secondary)' }}>
                    {profile.email}
                    <small className="d-block mt-1">Email cannot be changed</small>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    <Phone size={16} className="me-2" />
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      className="modern-input"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)', color: 'var(--text-primary)' }}>
                      {profile.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    <MapPin size={16} className="me-2" />
                    Region
                  </label>
                  {editing ? (
                    <select
                      className="modern-input"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    >
                      <option value="">Select your region</option>
                      <option value="lagos">Lagos</option>
                      <option value="abuja">Abuja</option>
                      <option value="kano">Kano</option>
                      <option value="port-harcourt">Port Harcourt</option>
                      <option value="ibadan">Ibadan</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--gray-50)', color: 'var(--text-primary)' }}>
                      {profile.region ? profile.region.charAt(0).toUpperCase() + profile.region.slice(1) : 'Not specified'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="modern-card p-4">
              <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                Account Information
              </h3>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3">
                    <Calendar size={20} style={{ color: 'var(--primary-600)' }} />
                    <div>
                      <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>Member Since</p>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {new Date(profile.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3">
                    <Activity size={20} style={{ color: 'var(--success-500)' }} />
                    <div>
                      <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>Last Login</p>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {profile.last_login_at 
                          ? new Date(profile.last_login_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Management */}
            <div className="modern-card p-4 mt-4">
              <h3 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>
                Account Management
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Manage your password, security settings, and sessions
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <Link to="/password-reset" className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2">
                    <KeyRound size={18} />
                    Change Password
                  </Link>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      const newVal = !twoFAEnabled
                      setTwoFAEnabled(newVal)
                      showSuccess('Two-Factor Authentication', newVal ? '2FA enabled for your account' : '2FA disabled for your account')
                    }}
                  >
                    <Lock size={18} />
                    {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => showSuccess('Sessions', 'All other sessions have been logged out')}
                  >
                    <Activity size={18} />
                    Log Out Other Sessions
                  </button>
                </div>
                <div className="col-md-6">
                  <Link to="/settings" className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2">
                    <SettingsIcon size={18} />
                    Open Security Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="col-lg-4">
            <div className="modern-card p-4">
              <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>
                Account Statistics
              </h3>
              
              {stats && (
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center justify-content-between">
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
                        <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>Devices</p>
                        <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {stats.verified_devices} verified
                        </p>
                      </div>
                    </div>
                    <span className="h4 mb-0" style={{ color: 'var(--primary-600)' }}>
                      {stats.total_devices}
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{ 
                          width: '40px', 
                          height: '40px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        <FileText size={20} style={{ color: 'var(--danger-500)' }} />
                      </div>
                      <div>
                        <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>Reports</p>
                        <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Filed reports
                        </p>
                      </div>
                    </div>
                    <span className="h4 mb-0" style={{ color: 'var(--danger-500)' }}>
                      {stats.total_reports}
                    </span>
                  </div>

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
                        <Activity size={20} style={{ color: 'var(--warning-500)' }} />
                      </div>
                      <div>
                        <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>Transfers</p>
                        <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Active transfers
                        </p>
                      </div>
                    </div>
                    <span className="h4 mb-0" style={{ color: 'var(--warning-500)' }}>
                      {stats.active_transfers}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="modern-card p-4 mt-4">
              <h3 className="h6 mb-3" style={{ color: 'var(--text-primary)' }}>
                Quick Links
              </h3>
              <div className="d-flex flex-column gap-2">
                <Link to="/my-devices" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2">
                  <Smartphone size={16} />
                  Manage Devices
                </Link>
                <Link to="/reports" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2">
                  <FileText size={16} />
                  View Reports
                </Link>
                <Link to="/device-transfer" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2">
                  <Activity size={16} />
                  Transfer Devices
                </Link>
                <Link to="/settings" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2">
                  <SettingsIcon size={16} />
                  Security & Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}