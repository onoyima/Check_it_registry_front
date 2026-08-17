import React, { useEffect, useState, useMemo } from 'react'
import { Layout } from '../components/Layout'
import { VerificationBadge } from '../components/VerificationBadge'
import { apiClient } from '../lib/apiClient'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast, ToastContainer } from '../components/Toast'
import {
  ShieldCheck, AlertTriangle, Package, DollarSign, ShoppingCart, Plus, Upload,
  Wallet, Eye, ChevronRight, Activity, BarChart3, Smartphone
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

interface Order {
  id: string; listing_id: string; buyer_name?: string; brand?: string; model?: string;
  amount: number; status: string; created_at: string
}
interface ListingPerformance {
  id: string; title: string; views: number; inquiries: number; status: string; price: number
}
interface VerificationQueueItem {
  id: string; brand: string; model: string; imei?: string; serial?: string; vin?: string;
  created_at: string; status: string
}

export default function BusinessDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, removeToast, showError } = useToast()

  const [statsData, setStatsData] = useState({
    activeListings: 0, totalSales: 0, pendingOrders: 0, payoutBalance: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [listingPerformance, setListingPerformance] = useState<ListingPerformance[]>([])
  const [verificationQueue, setVerificationQueue] = useState<VerificationQueueItem[]>([])
  const [verificationStatus, setVerificationStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [stats, orders, devices, listings, verStatus] = await Promise.all([
        (apiClient.marketplace as any).getSellerStats().catch(() => ({})),
        (apiClient.marketplace as any).getSellerOrders().then((r: any) => r.data || r).catch(() => []),
        apiClient.devices.list().catch(() => []),
        (apiClient.marketplace as any).list?.({ seller_id: user?.id }).catch(() => []),
        apiClient.security.getVerificationStatus().catch(() => ({ verificationStatus: 'pending' })),
      ])

      if (verStatus?.verificationStatus) setVerificationStatus(verStatus.verificationStatus)

      setStatsData({
        activeListings: stats?.active_listings ?? stats?.activeListings ?? 0,
        totalSales: stats?.total_sales ?? stats?.soldListings ?? 0,
        pendingOrders: Array.isArray(orders)
          ? orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length
          : stats?.pending_orders ?? 0,
        payoutBalance: stats?.payout_balance ?? stats?.revenue ?? 0,
      })

      if (Array.isArray(orders)) {
        setRecentOrders(orders.slice(0, 5).map((o: any) => ({
          id: o.id, listing_id: o.listing_id,
          buyer_name: o.buyer_name || o.buyer?.first_name || 'Unknown',
          brand: o.brand || o.listing?.brand, model: o.model || o.listing?.model,
          amount: o.amount || o.total || 0, status: o.status,
          created_at: o.created_at || o.sold_at
        })))
      }

      if (Array.isArray(listings)) {
        setListingPerformance(listings.slice(0, 4).map((l: any) => ({
          id: l.id, title: l.title || `${l.brand || ''} ${l.model || ''}`.trim(),
          views: l.views || l.view_count || 0,
          inquiries: l.inquiries || l.inquiry_count || 0,
          status: l.status, price: l.price || 0
        })))
      }

      if (Array.isArray(devices)) {
        const queue: VerificationQueueItem[] = devices
          .filter((d: any) => d.status === 'unverified')
          .slice(0, 5)
          .map((d: any) => ({
            id: d.id, brand: d.brand, model: d.model,
            imei: d.imei, serial: d.serial, vin: d.vin,
            created_at: d.created_at, status: d.status
          }))
        setVerificationQueue(queue)
      }
    } catch (err) {
      console.error('Error loading business dashboard:', err)
      showError('Loading Error', 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const isVerified = verificationStatus === 'verified'

  const stats = useMemo(() => [
    { label: 'Active Listings', value: statsData.activeListings, icon: Package, color: 'var(--primary-600)', bg: 'rgba(14,165,233,0.1)' },
    { label: 'Total Sales', value: statsData.totalSales, icon: DollarSign, color: 'var(--success-500)', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Pending Orders', value: statsData.pendingOrders, icon: ShoppingCart, color: 'var(--warning-500)', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Payout Balance', value: `₦${statsData.payoutBalance.toLocaleString()}`, icon: Wallet, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  ], [statsData])

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['business']}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading business dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requireAuth allowedRoles={['business']}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container-fluid px-0">
        {/* Page Header */}
        <motion.div variants={itemVariants} className="page-header">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h1>Business Dashboard</h1>
              <p>Overview of listings, sales, and revenue</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <VerificationBadge verified={isVerified} size="md" />
              <Link to="/marketplace/browse" className="btn btn-outline-primary d-flex align-items-center gap-2">
                <Eye size={16} /> Marketplace
              </Link>
              <Link to="/business/my-listings" className="btn-gradient-primary d-flex align-items-center gap-2">
                <Package size={16} /> My Listings
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Verification CTA */}
        {!isVerified && (
          <motion.div variants={itemVariants} className="mb-4" style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
            border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div className="d-flex align-items-center gap-3">
              <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0 }} />
              <div>
                <p className="m-0 fw-semibold" style={{ color: 'var(--text-primary)', fontSize: 14 }}>Complete Business Verification</p>
                <p className="m-0" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Verify your CAC registration to unlock a trusted badge and full marketplace features.</p>
              </div>
            </div>
            <button onClick={() => navigate('/business-verification')} className="btn btn-sm btn-warning text-nowrap">
              Verify Now
            </button>
          </motion.div>
        )}

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="row g-4 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="col-6 col-lg-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                    <s.icon size={22} />
                  </div>
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="row g-4 mb-4">
          {/* Left Column: Orders + Quick Actions */}
          <div className="col-lg-7">
            <motion.div variants={itemVariants}>
              <div className="modern-card mb-4">
                <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1 d-flex align-items-center gap-2">
                        <ShoppingCart size={18} style={{ color: 'var(--primary-600)' }} />
                        Recent Orders
                      </h5>
                      <p className="mb-0" style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Latest customer orders</p>
                    </div>
                    <Link to="/seller/orders" className="btn btn-sm btn-ghost d-flex align-items-center gap-1">
                      View All <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className="empty-state" style={{ padding: 24 }}>
                              <div className="empty-state-icon" style={{ width: 56, height: 56 }}>
                                <ShoppingCart size={24} />
                              </div>
                              <h3>No orders yet</h3>
                              <p>Your orders will appear here once customers start purchasing.</p>
                            </div>
                          </td>
                        </tr>
                      ) : recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="fw-medium" style={{ fontSize: 13 }}>
                            {order.brand && order.model ? `${order.brand} ${order.model}` : order.listing_id?.slice(0, 8) || 'N/A'}
                          </td>
                          <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{order.buyer_name || 'Unknown'}</td>
                          <td className="fw-semibold" style={{ fontSize: 13 }}>₦{order.amount.toLocaleString()}</td>
                          <td>
                            <span className={`status-badge ${order.status === 'completed' || order.status === 'delivered' ? 'status-verified' : order.status === 'pending' || order.status === 'processing' ? 'status-pending' : 'status-stolen'}`}>
                              {order.status?.replace('_', ' ') || 'N/A'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{timeAgo(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="modern-card">
                <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <Activity size={18} style={{ color: 'var(--primary-600)' }} />
                    <h5 className="mb-0">Quick Actions</h5>
                  </div>
                </div>
                <div className="p-4">
                  <div className="row g-3">
                    {[
                      { to: '/marketplace/create-listing', label: 'Create Listing', sub: 'Sell a device', icon: Plus, bg: 'rgba(14,165,233,0.1)', color: 'var(--primary-600)' },
                      { to: '/bulk-register', label: 'Bulk Register', sub: 'Upload devices', icon: Upload, bg: 'rgba(34,197,94,0.1)', color: 'var(--success-500)' },
                      { to: '/business-verification', label: 'Verify CAC', sub: 'Trusted badge', icon: ShieldCheck, bg: 'rgba(245,158,11,0.1)', color: 'var(--warning-500)' },
                    ].map((a) => (
                      <div key={a.to} className="col-md-4">
                        <Link to={a.to} className="d-flex flex-column align-items-center justify-content-center p-4 rounded-3 text-decoration-none text-center"
                          style={{ background: `${a.bg}`.replace('0.1', '0.04'), border: `1px solid ${a.bg}`.replace('0.1', '0.12'), transition: 'all 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = `${a.bg}`.replace('0.1', '0.08'); e.currentTarget.style.borderColor = `${a.bg}`.replace('0.1', '0.25') }}
                          onMouseOut={e => { e.currentTarget.style.background = `${a.bg}`.replace('0.1', '0.04'); e.currentTarget.style.borderColor = `${a.bg}`.replace('0.1', '0.12') }}
                        >
                          <div className="stat-icon mb-2" style={{ background: a.bg, color: a.color, width: 44, height: 44 }}>
                            <a.icon size={20} />
                          </div>
                          <span className="fw-semibold" style={{ color: 'var(--text-primary)', fontSize: 13 }}>{a.label}</span>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{a.sub}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="col-lg-5">
            <motion.div variants={itemVariants}>
              <div className="modern-card mb-4">
                <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <BarChart3 size={18} style={{ color: 'var(--primary-600)' }} />
                    <div>
                      <h5 className="mb-0">Listing Performance</h5>
                      <p className="mb-0" style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Views and inquiries</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {listingPerformance.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <div className="empty-state-icon" style={{ width: 56, height: 56 }}>
                        <BarChart3 size={24} />
                      </div>
                      <p className="mb-0" style={{ fontSize: 13 }}>No listings yet</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {listingPerformance.map((listing) => (
                        <div key={listing.id} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--bg-tertiary)' }}>
                          <div className="flex-grow-1 min-w-0 me-3">
                            <p className="mb-0 fw-medium text-truncate" style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                              {listing.title || 'Untitled Listing'}
                            </p>
                            <div className="d-flex align-items-center gap-3 mt-1">
                              <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}><Eye size={12} className="me-1" />{listing.views} views</span>
                              <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}><Activity size={12} className="me-1" />{listing.inquiries} inquiries</span>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-semibold" style={{ color: 'var(--text-primary)', fontSize: 14 }}>₦{listing.price.toLocaleString()}</div>
                            <span className={`status-badge ${listing.status === 'active' ? 'status-verified' : 'status-inactive'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                              {listing.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="modern-card">
                <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <DollarSign size={18} style={{ color: 'var(--primary-600)' }} />
                    <div>
                      <h5 className="mb-0">Revenue Summary</h5>
                      <p className="mb-0" style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Sales performance</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="d-flex align-items-center justify-content-center mb-4">
                    <div className="text-center">
                      <div className="display-4 fw-bold" style={{ color: 'var(--text-primary)' }}>₦{statsData.payoutBalance.toLocaleString()}</div>
                      <div className="stat-label">Total Revenue</div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-around text-center">
                    <div>
                      <div className="fw-bold h4 mb-0" style={{ color: 'var(--success-500)' }}>{statsData.totalSales}</div>
                      <div className="stat-label">Sales</div>
                    </div>
                    <div>
                      <div className="fw-bold h4 mb-0" style={{ color: 'var(--primary-600)' }}>{statsData.activeListings}</div>
                      <div className="stat-label">Active</div>
                    </div>
                    <div>
                      <div className="fw-bold h4 mb-0" style={{ color: statsData.pendingOrders > 0 ? 'var(--warning-500)' : 'var(--text-tertiary)' }}>{statsData.pendingOrders}</div>
                      <div className="stat-label">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Verification Queue */}
        {verificationQueue.length > 0 && (
          <motion.div variants={itemVariants} className="row g-3 mb-4">
            <div className="col-12">
              <div className="modern-card p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="m-0 d-flex align-items-center gap-2">
                    <Smartphone size={18} style={{ color: 'var(--warning-500)' }} />
                    Verification Queue
                  </h5>
                  <Link to="/my-devices" className="btn btn-sm btn-ghost d-flex align-items-center gap-1">View All <ChevronRight size={14} /></Link>
                </div>
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Brand/Model</th>
                        <th>Added</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationQueue.map((d) => (
                        <tr key={d.id}>
                          <td>{d.imei || d.serial || d.vin || 'N/A'}</td>
                          <td>{d.brand} {d.model}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/verify-device?deviceId=${d.id}`)}>Verify</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </motion.div>
    </Layout>
  )
}
