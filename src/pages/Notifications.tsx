import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  ShieldAlert, 
  FolderOpen, 
  AlertTriangle, 
  Verified, 
  Filter, 
  RefreshCw, 
  Eye,
  Trash2,
  CheckCheck,
  Clock,
  MessageSquare,
  Settings,
  User,
  Shield
} from 'lucide-react'
import { SegmentedControl } from '../components/mobile/SegmentedControl'

interface NotificationItem {
  id: string
  subject: string
  message: string
  status: 'unread' | 'read'
  created_at: string
}

interface GroupedNotifications {
  [key: string]: NotificationItem[]
}

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all')
  const { toasts, removeToast, showError, showInfo, showSuccess } = useToast()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/user-portal/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const json = await res.json()
      const list: NotificationItem[] = json?.data || []
      setItems(list)
      if (list.length === 0) showInfo('No Notifications', 'You have no notifications yet')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading notifications'
      setError(msg)
      showError('Loading Error', msg)
    } finally {
      setLoading(false)
    }
  }

  const getVisualKind = (subject: string) => {
    const s = subject.toLowerCase()
    if (/(critical|login|secure|security|breach|unauthorized)/.test(s)) return 'critical'
    if (/(case|recovery|updated|investigation|report)/.test(s)) return 'case'
    if (/(pending|warning|suspicious|alert)/.test(s)) return 'warning'
    if (/(verified|success|completed|approved|registered)/.test(s)) return 'success'
    if (/(message|chat|communication|contact)/.test(s)) return 'message'
    if (/(system|maintenance|update|announcement)/.test(s)) return 'system'
    return 'general'
  }

  const getTimeGroup = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    if (date >= today) return 'Today'
    if (date >= yesterday) return 'Yesterday'
    if (date >= weekAgo) return 'This Week'
    return 'Earlier'
  }

  const filtered = useMemo(() => {
    let result = items
    if (filter === 'unread') {
      result = items.filter(i => i.status === 'unread')
    } else if (filter === 'alerts') {
      result = items.filter(i => ['critical', 'case', 'warning'].includes(getVisualKind(i.subject)))
    }
    return result
  }, [items, filter])

  const groupedNotifications = useMemo(() => {
    const groups: GroupedNotifications = {}
    filtered.forEach(notification => {
      const group = getTimeGroup(notification.created_at)
      if (!groups[group]) groups[group] = []
      groups[group].push(notification)
    })
    
    // Sort groups by time relevance
    const sortedGroups: GroupedNotifications = {}
    const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier']
    groupOrder.forEach(group => {
      if (groups[group]) {
        sortedGroups[group] = groups[group].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
    })
    
    return sortedGroups
  }, [filtered])

  const handleClearAll = async () => {
    try {
      // In a real app, this would make an API call to mark all as read or delete
      setItems(prev => prev.map(item => ({ ...item, status: 'read' as const })))
      showSuccess('Notifications Cleared', 'All notifications have been marked as read')
    } catch (err) {
      showError('Error', 'Failed to clear notifications')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setItems(prev => prev.map(item => ({ ...item, status: 'read' as const })))
      showSuccess('Marked as Read', 'All notifications marked as read')
    } catch (err) {
      showError('Error', 'Failed to mark notifications as read')
    }
  }

  const getNotificationIcon = (kind: string) => {
    switch (kind) {
      case 'critical': return ShieldAlert
      case 'case': return FolderOpen
      case 'warning': return AlertTriangle
      case 'success': return Verified
      case 'message': return MessageSquare
      case 'system': return Settings
      default: return Bell
    }
  }

  const getNotificationColor = (kind: string) => {
    switch (kind) {
      case 'critical': return 'var(--danger-500)'
      case 'case': return 'var(--primary-600)'
      case 'warning': return 'var(--warning-500)'
      case 'success': return 'var(--success-500)'
      case 'message': return 'var(--info-500)'
      case 'system': return 'var(--secondary-500)'
      default: return 'var(--text-secondary)'
    }
  }

  const unreadCount = items.filter(item => item.status === 'unread').length

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row mb-4"
        >
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="h2 mb-2" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span 
                      className="badge rounded-pill ms-2"
                      style={{ 
                        backgroundColor: 'var(--danger-500)',
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Stay updated with alerts and case updates
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                {items.length > 0 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAllRead}
                      className="btn btn-outline-primary d-flex align-items-center gap-2"
                    >
                      <CheckCheck size={16} />
                      Mark All Read
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearAll}
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Clear
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadNotifications}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="modern-card p-3 mb-4"
        >
          <div className="d-flex align-items-center justify-content-center">
            <SegmentedControl
              options={[
                { key: 'all', label: `All (${items.length})` },
                { key: 'unread', label: `Unread (${unreadCount})` },
                { key: 'alerts', label: `Alerts (${items.filter(i => ['critical', 'case', 'warning'].includes(getVisualKind(i.subject))).length})` },
              ]}
              value={filter}
              onChange={(key) => setFilter(key as any)}
            />
          </div>
        </motion.div>

        {/* Notifications List */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-5"
          >
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading notifications…</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modern-card p-4 text-center"
          >
            <AlertTriangle size={48} className="mb-3" style={{ color: 'var(--danger-500)' }} />
            <h4 style={{ color: 'var(--danger-500)' }}>Error Loading Notifications</h4>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={loadNotifications} className="btn btn-primary">
              Try Again
            </button>
          </motion.div>
        ) : Object.keys(groupedNotifications).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modern-card p-5 text-center"
          >
            <Bell size={64} className="mb-3" style={{ color: 'var(--text-secondary)' }} />
            <h4 style={{ color: 'var(--text-primary)' }}>No Notifications</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'alerts' ? 'No alert notifications' : 
               'You have no notifications yet'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedNotifications).map(([timeGroup, notifications], groupIndex) => (
              <motion.div
                key={timeGroup}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (groupIndex + 1) }}
                className="mb-4"
              >
                {/* Time Group Header */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                  <h5 className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    {timeGroup}
                  </h5>
                  <div className="flex-grow-1" style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                  <span className="badge bg-light text-dark">
                    {notifications.length}
                  </span>
                </div>

                {/* Notifications in this time group */}
                <div className="modern-card p-0">
                  <AnimatePresence>
                    {notifications.map((notification, index) => {
                      const kind = getVisualKind(notification.subject)
                      const Icon = getNotificationIcon(kind)
                      const color = getNotificationColor(kind)
                      
                      return (
                        <motion.div 
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: 0.05 * index }}
                          className="p-4 d-flex align-items-start gap-3 position-relative"
                          style={{ 
                            borderBottom: index < notifications.length - 1 ? '1px solid var(--border-color)' : 'none',
                            backgroundColor: notification.status === 'unread' ? 'rgba(14, 165, 233, 0.02)' : 'transparent'
                          }}
                        >
                          {/* Status Indicator */}
                          {notification.status === 'unread' && (
                            <div 
                              className="position-absolute"
                              style={{ 
                                left: '0',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '4px',
                                height: '60%',
                                backgroundColor: 'var(--primary-500)',
                                borderTopRightRadius: '2px',
                                borderBottomRightRadius: '2px'
                              }}
                            />
                          )}

                          {/* Icon */}
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ 
                              width: '48px', 
                              height: '48px',
                              backgroundColor: `${color}15`,
                              border: `2px solid ${color}30`
                            }}
                          >
                            <Icon size={20} style={{ color }} />
                          </div>

                          {/* Content */}
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex align-items-start justify-content-between mb-2">
                              <h6 
                                className="mb-0 fw-semibold"
                                style={{ 
                                  color: 'var(--text-primary)',
                                  fontSize: '15px'
                                }}
                              >
                                {notification.subject}
                              </h6>
                              {notification.status === 'unread' && (
                                <span 
                                  className="badge rounded-pill flex-shrink-0 ms-2"
                                  style={{ 
                                    backgroundColor: 'var(--primary-500)',
                                    color: 'white',
                                    fontSize: '10px'
                                  }}
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                            <p 
                              className="mb-2 text-truncate"
                              style={{ 
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                lineHeight: '1.4'
                              }}
                            >
                              {notification.message}
                            </p>
                            <div className="d-flex align-items-center justify-content-between">
                              <small style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                                {new Date(notification.created_at).toLocaleString()}
                              </small>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                              >
                                <Eye size={14} />
                                View
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}