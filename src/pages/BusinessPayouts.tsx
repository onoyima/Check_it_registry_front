import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion } from 'framer-motion'
import { CreditCard, DollarSign, Wallet, Filter } from 'lucide-react'

type Payout = {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'paid'
  requestedAt: string
}

export default function BusinessPayouts() {
  const [balance, setBalance] = useState(1250000)
  const [method, setMethod] = useState('Bank Transfer')
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [status, setStatus] = useState<'all'|'pending'|'processing'|'paid'>('all')
  const { toasts, removeToast, showSuccess } = useToast()

  useEffect(() => {
    setPayouts([
      { id: 'p1', amount: 500000, currency: '₦', status: 'paid', requestedAt: '2025-09-12' },
      { id: 'p2', amount: 300000, currency: '₦', status: 'processing', requestedAt: '2025-10-18' },
      { id: 'p3', amount: 150000, currency: '₦', status: 'pending', requestedAt: '2025-10-22' },
    ])
  }, [])

  const requestPayout = () => {
    const id = `p${payouts.length + 1}`
    setPayouts([{ id, amount: 200000, currency: '₦', status: 'pending', requestedAt: new Date().toISOString().slice(0,10) }, ...payouts])
    showSuccess('Payout requested')
  }

  const currency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`
  const filtered = payouts.filter(p => status === 'all' || p.status === status)

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Wallet size={20} />
            <h1 className="h4 m-0">Business Payouts</h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Filter size={16} />
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="form-select form-select-sm" style={{ width: 180 }}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <div className="modern-card p-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2"><DollarSign size={20} /><strong>Available Balance</strong></div>
              <div className="fw-bold">{currency(balance)}</div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="modern-card p-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2"><CreditCard size={20} /><strong>Payout Method</strong></div>
              <div className="d-flex align-items-center gap-2">
                <select value={method} onChange={e => setMethod(e.target.value)} className="form-select form-select-sm" style={{ width: 180 }}>
                  <option>Bank Transfer</option>
                  <option>Mobile Money</option>
                  <option>Wallet</option>
                </select>
                <button className="btn btn-sm btn-outline-primary" onClick={requestPayout}>Request Payout</button>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="col-12">
              <div className="modern-card p-3 d-flex align-items-center justify-content-between">
                <div>
                  <strong>Payout {p.id.toUpperCase()}</strong>
                  <div className="text-secondary"><small>Requested {p.requestedAt}</small></div>
                </div>
                <div className="text-end">
                  <div className="fw-bold">{currency(p.amount, p.currency)}</div>
                  <small className="text-secondary text-capitalize">{p.status}</small>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-12"><div className="modern-card p-4 text-center text-secondary">No payouts</div></div>
          )}
        </div>
      </div>
    </Layout>
  )
}