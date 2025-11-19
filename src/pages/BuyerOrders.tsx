import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion } from 'framer-motion'
import { Receipt, Filter, Smartphone, BadgeCheck } from 'lucide-react'

type Order = {
  id: string
  title: string
  seller: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  date: string
  verifiedSeller?: boolean
}

export default function BuyerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<'all'|'pending'|'paid'|'shipped'|'completed'|'cancelled'>('all')
  const { toasts, removeToast } = useToast()

  useEffect(() => {
    const sample: Order[] = [
      { id: 'o1', title: 'iPhone 13 128GB', seller: 'TechStore Ltd', amount: 750000, currency: '₦', status: 'paid', date: '2025-10-01', verifiedSeller: true },
      { id: 'o2', title: 'Samsung S22 256GB', seller: 'Galaxy Hub', amount: 680000, currency: '₦', status: 'pending', date: '2025-10-10' },
      { id: 'o3', title: 'Tecno Spark 8', seller: 'Mobile Mart', amount: 120000, currency: '₦', status: 'shipped', date: '2025-10-15', verifiedSeller: true },
    ]
    setOrders(sample)
  }, [])

  const filtered = useMemo(() => orders.filter(o => status === 'all' || o.status === status), [orders, status])
  const currency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Receipt size={20} />
            <h1 className="h4 m-0">My Orders</h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Filter size={16} />
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="form-select form-select-sm" style={{ width: 180 }}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="row g-3">
          {filtered.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="col-12">
              <div className="modern-card p-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <Smartphone size={20} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <strong>{o.title}</strong>
                      {o.verifiedSeller && <span className="badge bg-success d-flex align-items-center gap-1"><BadgeCheck size={14} /> Verified Seller</span>}
                    </div>
                    <small className="text-secondary">Seller: {o.seller} • Placed {o.date}</small>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold">{currency(o.amount, o.currency)}</div>
                  <small className="text-secondary text-capitalize">{o.status}</small>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-12"><div className="modern-card p-4 text-center text-secondary">No orders</div></div>
          )}
        </div>
      </div>
    </Layout>
  )
}