import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '../../components/Layout'
import { useToast, ToastContainer } from '../../components/Toast'
import { apiClient } from '../../lib/apiClient'
import { Link } from 'react-router-dom'
import { DollarSign, RefreshCw, TrendingUp, CreditCard, Building2, Smartphone, Search, Shield, IdCard, Percent, Edit3, X, Check, Users } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const PROVIDER_OPTIONS = ['prembly', 'dojah', 'verifyng', 'smileid']

export default function RevenueSettings() {
  const { showSuccess, showError, toasts, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [currentProvider, setCurrentProvider] = useState('prembly')
  const [summary, setSummary] = useState<{ total_revenue: number; total_transactions: number; period?: string } | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [txPage, setTxPage] = useState(1)
  const [txLoading, setTxLoading] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [provData, summData, txData] = await Promise.all([
        apiClient.revenue.getProvider(),
        apiClient.revenue.summary(),
        apiClient.revenue.transactions({ page: 1, limit: 10 }),
      ])
      setCurrentProvider(provData?.provider || 'prembly')
      setSummary(summData)
      setTransactions(Array.isArray(txData) ? txData : txData.data || txData.transactions || [])
    } catch {
      showError('Failed to load revenue settings')
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = async (provider: string) => {
    try {
      await apiClient.revenue.setProvider({ provider })
      setCurrentProvider(provider)
      showSuccess('Verification provider updated')
    } catch (e: any) {
      showError(e.message || 'Failed to update provider')
    }
  }

  const loadMoreTx = async () => {
    setTxLoading(true)
    try {
      const next = txPage + 1
      const data = await apiClient.revenue.transactions({ page: next, limit: 10 })
      const txList = Array.isArray(data) ? data : data.data || data.transactions || []
      setTransactions(prev => [...prev, ...txList])
      setTxPage(next)
    } catch { /* pagination fetch failed */ } finally { setTxLoading(false) }
  }

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['admin', 'super_admin']}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 500 }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)', width: '3rem', height: '3rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading revenue settings...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requireAuth allowedRoles={['admin', 'super_admin']}>
      <div className="container-fluid px-0">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="page-header">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', width: 52, height: 52 }}>
                  <DollarSign size={26} />
                </div>
                <div>
                  <h1>Revenue Settings</h1>
                  <p>Manage fees, providers, and view revenue</p>
                </div>
              </div>
              <button onClick={loadAll} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </motion.div>

          <div className="row g-4">
            <motion.div variants={itemVariants} className="col-lg-8">
              <div className="modern-card p-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                  <h3 className="h5 mb-0">Prices</h3>
                </div>
                <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>Every fee, the free checks of other people's items, and the marketplace commission are set on one page.</p>
                <Link to="/admin/prices" className="po-btn po-btn-primary">Open Prices</Link>
              </div>

              <motion.div variants={itemVariants} className="modern-card mt-4">
                <div className="p-4 border-bottom d-flex align-items-center gap-3">
                  <Building2 size={20} style={{ color: 'var(--primary)' }} />
                  <h3 className="h5 mb-0">Verification Provider</h3>
                </div>
                <div className="p-4">
                  <div className="d-flex flex-wrap gap-2">
                    {PROVIDER_OPTIONS.map(p => (
                      <button
                        key={p}
                        onClick={() => handleProviderChange(p)}
                        className={`btn ${currentProvider === p ? 'btn-gradient-primary' : 'btn-outline-primary'}`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="col-lg-4">
              {summary && (
                <div className="modern-card mb-4">
                  <div className="p-4 border-bottom d-flex align-items-center gap-3">
                    <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                    <h3 className="h5 mb-0">Revenue Summary</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <small style={{ color: 'var(--text-tertiary)' }}>Total Revenue</small>
                      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                        NGN {Number(summary.total_revenue || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-tertiary)' }}>Transactions</small>
                      <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {summary.total_transactions || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {transactions.length > 0 && (
                <div className="modern-card">
                  <div className="p-4 border-bottom d-flex align-items-center gap-3">
                    <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                    <h3 className="h5 mb-0">Recent Transactions</h3>
                  </div>
                  <div className="p-3">
                    {transactions.map((tx: any) => (
                      <div key={tx.id} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                            {tx.fee_type || tx.type || 'Transaction'}
                          </div>
                          <small style={{ color: 'var(--text-tertiary)' }}>
                            {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''}
                          </small>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                          NGN {Number(tx.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <button onClick={loadMoreTx} disabled={txLoading} className="btn-ghost w-100 mt-2" style={{ fontSize: 13 }}>
                      {txLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  )
}
