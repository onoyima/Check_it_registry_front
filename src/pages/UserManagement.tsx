import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Shield, 
  MapPin, 
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Mail,
  Phone,
  Smartphone,
  FileText
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'business' | 'admin' | 'lea'
  region?: string
  phone?: string
  verified_at?: string
  created_at: string
  last_login_at?: string
  device_count: number
  report_count: number
  status: 'active' | 'suspended' | 'pending'
  avatar_url?: string
}

interface UserStats {
  total_users: number
  new_users_24h: number
  verified_users: number
  admin_users: number
  lea_users: number
  business_users: number
  regular_users: number
  suspended_users: number
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toasts, removeToast, showSuccess, showError } = useToast()
  // Use relative /api; Vite dev proxy forwards to backend
  const API_URL = import.meta.env.VITE_API_URL || '/api'
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; email: string; phone?: string; region?: string; role: User['role'] } | null>(null)
  const [savingEdits, setSavingEdits] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [showConfirmSave, setShowConfirmSave] = useState(false)

  const saveUserField = async (
    userId: string,
    fields: Partial<Pick<User, 'name' | 'email' | 'phone' | 'region'>>
  ) => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      showError('Not Authorized', 'Please log in as an admin')
      return
    }
    try {
      const response = await fetch(`${API_URL}/user-management/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update user')
      }
      showSuccess('Saved', 'User details updated successfully')
    } catch (err) {
      showError('Save Failed', err instanceof Error ? err.message : 'Could not update user')
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      region: user.region,
      role: user.role
    })
    setShowUserModal(true)
  }

  const saveUserEdits = async () => {
    if (!selectedUser || !editForm) return
    const userId = selectedUser.id
    const token = localStorage.getItem('auth_token')
    if (!token) {
      showError('Not Authorized', 'Please log in as an admin')
      return
    }
    try {
      setSavingEdits(true)
      // Determine changed general fields
      const generalChanges: any = {}
      ;(['name','email','phone','region'] as const).forEach((key) => {
        if ((selectedUser as any)[key] !== (editForm as any)[key]) {
          generalChanges[key] = (editForm as any)[key]
        }
      })

      // Basic email validation if changed
      if (generalChanges.email) {
        const ok = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(generalChanges.email)
        if (!ok) {
          throw new Error('Please enter a valid email address')
        }
      }

      if (Object.keys(generalChanges).length > 0) {
        const resp = await fetch(`${API_URL}/user-management/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(generalChanges)
        })
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to save user details')
        }
      }

      // Role change handled separately
      if (selectedUser.role !== editForm.role) {
        const roleResp = await fetch(`${API_URL}/user-management/users/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: editForm.role })
        })
        if (!roleResp.ok) {
          const err = await roleResp.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to update user role')
        }
      }

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        region: editForm.region,
        role: editForm.role
      } : u))
      setSelectedUser({ ...selectedUser, ...editForm })
      showSuccess('Saved', 'User information updated successfully')
      setShowUserModal(false)
    } catch (err) {
      showError('Save Failed', err instanceof Error ? err.message : 'Could not save changes')
    } finally {
      setSavingEdits(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        showError('Not Authorized', 'Please log in as an admin to view user management')
        return
      }

      const response = await fetch(`${API_URL}/user-management/users?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to load users')
      }

      const data = await response.json()
      const apiUsers = (data.users || []) as any[]

      const mappedUsers: User[] = apiUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: (u.role || 'user') as User['role'],
        region: u.region || undefined,
        phone: u.phone || undefined,
        verified_at: u.verified_at || undefined,
        created_at: u.created_at,
        last_login_at: u.last_login_at || undefined,
        device_count: u.device_count || 0,
        report_count: u.report_count || 0,
        status: (u.status || 'active') as User['status'],
        avatar_url: u.avatar_url || undefined
      }))

      setUsers(mappedUsers)

      // Derive lightweight stats for cards
      const stats: UserStats = {
        total_users: mappedUsers.length,
        new_users_24h: 0,
        verified_users: mappedUsers.filter(u => !!u.verified_at).length,
        admin_users: mappedUsers.filter(u => u.role === 'admin').length,
        lea_users: mappedUsers.filter(u => u.role === 'lea').length,
        business_users: mappedUsers.filter(u => u.role === 'business').length,
        regular_users: mappedUsers.filter(u => u.role === 'user').length,
        suspended_users: mappedUsers.filter(u => u.status === 'suspended').length
      }
      setStats(stats)
    } catch (err) {
      console.error('Error loading user data:', err)
      showError('Loading Error', err instanceof Error ? err.message : 'Failed to load user management data')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const isOnline = (user: User) => {
    if (!user.last_login_at || user.status !== 'active') return false
    const last = new Date(user.last_login_at).getTime()
    const now = Date.now()
    // Consider online if last activity within 30 minutes
    return now - last < 30 * 60 * 1000
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        showError('Not Authorized', 'Please log in as an admin')
        return
      }

      const response = await fetch(`${API_URL}/user-management/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update role')
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ))

      showSuccess('Role Updated', `User role has been updated to ${newRole}`)
      setShowUserModal(false)
    } catch (err) {
      showError('Update Failed', err instanceof Error ? err.message : 'Failed to update user role')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      setActionLoading(userId)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        showError('Not Authorized', 'Please log in as an admin')
        return
      }

      const response = await fetch(`${API_URL}/user-management/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ suspended: suspend })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update user suspension')
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: suspend ? 'suspended' : 'active' } : user
      ))

      showSuccess(
        suspend ? 'User Suspended' : 'User Activated', 
        `User has been ${suspend ? 'suspended' : 'activated'} successfully`
      )
    } catch (err) {
      showError('Action Failed', err instanceof Error ? err.message : `Failed to ${suspend ? 'suspend' : 'activate'} user`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (userId: string) => {
    try {
      // Confirmation handled by custom modal; no browser confirm here

      const token = localStorage.getItem('auth_token')
      if (!token) {
        showError('Not Authorized', 'Please log in as an admin to perform this action')
        return
      }

      setActionLoading(userId)

      const response = await fetch(`${API_URL}/user-management/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_password: 'welcome@checkit',
          send_email: true
        })
      })

      if (response.ok) {
        showSuccess('Password Reset', 'Default password set to "welcome@checkit"')
      } else {
        const err = await response.json().catch(() => ({}))
        showError('Reset Failed', err.error || 'Could not reset password')
      }
    } catch (err) {
      showError('Reset Failed', 'Unexpected error occurred while resetting password')
    } finally {
      setActionLoading(null)
    }
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
      case 'business': return 'Business'
      default: return 'Regular User'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success-500)'
      case 'suspended': return 'var(--danger-500)'
      case 'pending': return 'var(--warning-500)'
      default: return 'var(--gray-500)'
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
            <p style={{ color: 'var(--text-secondary)' }}>Loading user management...</p>
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
                  User Management
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  onClick={loadUserData}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw size={18} className={loading ? 'spin' : ''} />
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
              className="col-md-3"
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
                  <Users size={24} style={{ color: 'var(--primary-600)' }} />
                </div>
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>{stats.total_users.toLocaleString()}</h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Users</p>
                <small style={{ color: 'var(--success-500)' }}>+{stats.new_users_24h} today</small>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-md-3"
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
                  <UserCheck size={24} style={{ color: 'var(--success-500)' }} />
                </div>
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>{stats.verified_users.toLocaleString()}</h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verified Users</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-md-3"
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
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>{stats.admin_users + stats.lea_users}</h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Admin & LEA</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-md-3"
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
                  <UserX size={24} style={{ color: 'var(--danger-500)' }} />
                </div>
                <h3 className="h4 mb-1" style={{ color: 'var(--text-primary)' }}>{stats.suspended_users}</h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Suspended</p>
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
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                <Search size={16} className="me-2" />
                Search Users
              </label>
              <input
                type="text"
                className="modern-input"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                <Filter size={16} className="me-2" />
                Role
              </label>
              <select
                className="modern-input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">Regular Users</option>
                <option value="business">Business Users</option>
                <option value="lea">Law Enforcement</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                Status
              </label>
              <select
                className="modern-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('all')
                  setStatusFilter('all')
                }}
                className="btn btn-outline-secondary w-100"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="modern-card"
        >
          <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
            <h3 className="h5 mb-0" style={{ color: 'var(--text-primary)' }}>
              Users ({filteredUsers.length})
            </h3>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                <tr>
                  <th className="border-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>User</th>
                  <th className="border-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Role</th>
                  <th className="border-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="border-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Devices</th>
                  <th className="border-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Last Login</th>
                  <th className="border-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ borderBottomColor: 'var(--border-color)' }}
                    >
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="position-relative flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                                style={{ 
                                  width: '40px', 
                                  height: '40px',
                                  background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%)',
                                  fontSize: '14px'
                                }}
                              >
                                {getInitials(user.name)}
                              </div>
                            )}
                            <span
                              title={isOnline(user) ? 'Online' : 'Offline'}
                              className="position-absolute rounded-circle"
                              style={{
                                width: '10px',
                                height: '10px',
                                right: '-1px',
                                bottom: '-1px',
                                border: '2px solid var(--bg-primary)',
                                backgroundColor: isOnline(user) ? 'var(--success-500)' : 'var(--gray-400)'
                              }}
                            />
                          </div>
                          <div>
                            <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>
                              {user.name}
                            </p>
                            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              {user.email}
                            </p>
                            {user.region && (
                              <small style={{ color: 'var(--text-secondary)' }}>
                                <MapPin size={12} className="me-1" />
                                {user.region.charAt(0).toUpperCase() + user.region.slice(1)}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span 
                          className="badge px-3 py-2"
                          style={{ 
                            backgroundColor: `${getRoleColor(user.role)}20`,
                            color: getRoleColor(user.role),
                            fontSize: '12px'
                          }}
                        >
                          {getRoleBadge(user.role)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span 
                          className="badge px-3 py-2"
                          style={{ 
                            backgroundColor: `${getStatusColor(user.status)}20`,
                            color: getStatusColor(user.status),
                            fontSize: '12px'
                          }}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span style={{ color: 'var(--text-primary)' }}>{user.device_count}</span>
                      </td>
                      <td className="py-3">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {user.last_login_at 
                            ? new Date(user.last_login_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex gap-2">
                          <button 
                            onClick={async () => {
                              setSelectedUser(user)
                              setShowDetailsModal(true)
                              setDetailsLoading(true)
                              try {
                                const token = localStorage.getItem('auth_token')
                                const response = await fetch(`${API_URL}/user-management/users/${user.id}`, {
                                  headers: { 'Authorization': `Bearer ${token || ''}` }
                                })
                                const data = await response.json()
                                setUserDetails(data)
                              } catch (err) {
                                showError('Load Failed', 'Could not fetch user details')
                              } finally {
                                setDetailsLoading(false)
                              }
                            }}
                            className="btn btn-sm btn-outline-secondary"
                            title="View Details"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => openEditModal(user)}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit User"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleSuspendUser(user.id, user.status !== 'suspended')}
                            className={`btn btn-sm ${user.status === 'suspended' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            disabled={actionLoading === user.id}
                            title={user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                          >
                            {actionLoading === user.id ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            ) : user.status === 'suspended' ? (
                              <UserCheck size={14} />
                            ) : (
                              <UserX size={14} />
                            )}
                          </button>
                          <button 
                            onClick={() => { setResetUserId(user.id); setShowConfirmReset(true) }}
                            className="btn btn-sm btn-outline-danger"
                            disabled={actionLoading === user.id}
                            title="Reset Password to default"
                          >
                            {actionLoading === user.id ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            ) : (
                              <RefreshCw size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-5">
              <Users size={48} className="mb-3" style={{ color: 'var(--text-secondary)' }} />
              <h4 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>No users found</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </motion.div>

        {/* User Edit Modal */}
        {showUserModal && selectedUser && (
          <div className="modal show d-block admin-modal-overlay">
            <div 
              className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down"
              style={{ marginLeft: 'auto', maxWidth: '640px', width: '100%' }}
            >
              <div className="modal-content modern-card">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title" style={{ color: 'var(--text-primary)' }}>
                    Edit User: {selectedUser.name}
                  </h5>
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="btn-close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Name
                    </label>
                    <input
                      className="modern-input"
                      value={editForm ? editForm.name : selectedUser.name}
                      onChange={(e) => editForm && setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Email
                    </label>
                    <input
                      className="modern-input"
                      value={editForm ? editForm.email : selectedUser.email}
                      onChange={(e) => editForm && setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Phone
                    </label>
                    <input
                      className="modern-input"
                      value={editForm ? (editForm.phone || '') : (selectedUser.phone || '')}
                      onChange={(e) => editForm && setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Region
                    </label>
                    <input
                      className="modern-input"
                      value={editForm ? (editForm.region || '') : (selectedUser.region || '')}
                      onChange={(e) => editForm && setEditForm({ ...editForm, region: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Role
                    </label>
                    <select 
                      className="modern-input"
                      value={editForm ? editForm.role : selectedUser.role}
                      onChange={(e) => editForm && setEditForm({ ...editForm, role: e.target.value as any })}
                      disabled={savingEdits}
                    >
                      <option value="user">Regular User</option>
                      <option value="business">Business User</option>
                      <option value="lea">Law Enforcement</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  
                  <div className="alert alert-warning d-flex align-items-start gap-2">
                    <Shield size={16} className="mt-1" />
                    <div>
                      <strong>Warning:</strong> Changing user roles will affect their permissions and access levels.
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setShowConfirmSave(true)}
                    className="btn btn-primary"
                    disabled={savingEdits}
                  >
                    {savingEdits ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <div className="modal show d-block admin-modal-overlay">
            <div 
              className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down"
              style={{ marginLeft: 'auto', maxWidth: '720px', width: '100%' }}
            >
              <div className="modal-content modern-card">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title" style={{ color: 'var(--text-primary)' }}>
                    User Details: {selectedUser.name}
                  </h5>
                  <button onClick={() => setShowDetailsModal(false)} className="btn-close"></button>
                </div>
                <div className="modal-body">
                  {detailsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status" />
                    </div>
                  ) : userDetails ? (
                    <div className="d-flex flex-column gap-3">
                      {/* Profile Header */}
                      <div className="d-flex flex-column align-items-center py-3">
                        <div className="position-relative" style={{ width: '72px', height: '72px' }}>
                          {userDetails.user.avatar_url ? (
                            <img
                              src={userDetails.user.avatar_url}
                              alt={userDetails.user.name || selectedUser.name}
                              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                              style={{ 
                                width: '72px', height: '72px', 
                                background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%)',
                                fontSize: '28px'
                              }}
                            >
                              {getInitials(userDetails.user.name || selectedUser.name)}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <p className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '20px' }}>
                            {userDetails.user.name || selectedUser.name}
                          </p>
                          <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                            {userDetails.user.role}
                          </p>
                        </div>
                      </div>

                      {/* Personal Details */}
                      <div className="modern-card p-3">
                        <h6 className="fw-semibold" style={{ color: 'var(--text-secondary)' }}>Personal Details</h6>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center gap-3 py-2">
                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                              <Mail size={18} />
                            </div>
                            <span style={{ color: 'var(--text-primary)' }}>{userDetails.user.email}</span>
                          </div>
                          <div className="d-flex align-items-center gap-3 py-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                              <Phone size={18} />
                            </div>
                            <span style={{ color: 'var(--text-primary)' }}>{userDetails.user.phone || '—'}</span>
                          </div>
                          <div className="d-flex align-items-center gap-3 py-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                              <MapPin size={18} />
                            </div>
                            <span style={{ color: 'var(--text-primary)' }}>{userDetails.user.region || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Devices */}
                      <div className="modern-card p-3">
                        <h6 className="fw-semibold" style={{ color: 'var(--text-secondary)' }}>Devices ({userDetails.devices.length})</h6>
                        <ul className="list-group">
                          {userDetails.devices.map((d: any) => (
                            <li key={d.id} className="list-group-item d-flex justify-content-between" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
                              <span><Smartphone size={16} className="me-2" />{d.brand} {d.model} · IMEI: {d.imei}</span>
                              <small className="text-muted">Reports: {d.report_count || 0}</small>
                            </li>
                          ))}
                          {userDetails.devices.length === 0 && (
                            <li className="list-group-item" style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)' }}>No devices</li>
                          )}
                        </ul>
                      </div>

                      {/* Reports */}
                      <div className="modern-card p-3">
                        <h6 className="fw-semibold" style={{ color: 'var(--text-secondary)' }}>Reports ({userDetails.reports.length})</h6>
                        <ul className="list-group">
                          {userDetails.reports.map((r: any) => (
                            <li key={r.id} className="list-group-item" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
                              <div className="d-flex justify-content-between">
                                <span><FileText size={16} className="me-2" />Type: {r.type || r.status} · Device: {r.brand} {r.model}</span>
                                <small className="text-muted">{new Date(r.created_at).toLocaleString()}</small>
                              </div>
                            </li>
                          ))}
                          {userDetails.reports.length === 0 && (
                            <li className="list-group-item" style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)' }}>No reports</li>
                          )}
                        </ul>
                      </div>

                      {/* Recent Activity */}
                      <div className="modern-card p-3">
                        <h6 className="fw-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Activity</h6>
                        <ul className="list-group">
                          {userDetails.recent_activity.map((a: any, i: number) => (
                            <li key={i} className="list-group-item d-flex justify-content-between" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
                              <span>{a.action}</span>
                              <small className="text-muted">{new Date(a.created_at).toLocaleString()}</small>
                            </li>
                          ))}
                          {userDetails.recent_activity.length === 0 && (
                            <li className="list-group-item" style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)' }}>No recent activity</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p>No details found.</p>
                  )}
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-outline-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Reset Password Modal */}
        {showConfirmReset && (
          <div className="modal show d-block admin-modal-overlay" style={{ zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content modern-card">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title" style={{ color: 'var(--text-primary)' }}>
                    Confirm Password Reset
                  </h5>
                  <button onClick={() => { setShowConfirmReset(false); setResetUserId(null) }} className="btn-close"></button>
                </div>
                <div className="modal-body">
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Are you sure you want to reset the password for
                    {' '}<span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{users.find(u => u.id === resetUserId)?.name || 'this user'}</span>?
                    This will set their password to the default and require a change on next login.
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    onClick={() => { setShowConfirmReset(false); setResetUserId(null) }}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { if (resetUserId) handleResetPassword(resetUserId); setShowConfirmReset(false); setResetUserId(null) }}
                    className="btn btn-danger"
                    disabled={actionLoading === resetUserId}
                  >
                    {actionLoading === resetUserId ? 'Resetting...' : 'Confirm Reset'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Save Changes Modal */}
        {showConfirmSave && showUserModal && selectedUser && editForm && (
          <div className="modal show d-block admin-modal-overlay" style={{ zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content modern-card">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title" style={{ color: 'var(--text-primary)' }}>
                    Confirm Save Changes
                  </h5>
                  <button onClick={() => setShowConfirmSave(false)} className="btn-close"></button>
                </div>
                <div className="modal-body">
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Save updates for <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{selectedUser.name}</span>?
                  </p>
                  <ul className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                    {editForm.name !== selectedUser.name && (
                      <li>Name: {selectedUser.name} → {editForm.name}</li>
                    )}
                    {editForm.email !== selectedUser.email && (
                      <li>Email: {selectedUser.email} → {editForm.email}</li>
                    )}
                    {(editForm.phone || '') !== (selectedUser.phone || '') && (
                      <li>Phone: {selectedUser.phone || '—'} → {editForm.phone || '—'}</li>
                    )}
                    {(editForm.region || '') !== (selectedUser.region || '') && (
                      <li>Region: {selectedUser.region || '—'} → {editForm.region || '—'}</li>
                    )}
                    {editForm.role !== selectedUser.role && (
                      <li>Role: {selectedUser.role} → {editForm.role}</li>
                    )}
                  </ul>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    onClick={() => setShowConfirmSave(false)}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => { setShowConfirmSave(false); await saveUserEdits() }}
                    className="btn btn-primary"
                    disabled={savingEdits}
                  >
                    {savingEdits ? 'Saving...' : 'Confirm Save'}
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