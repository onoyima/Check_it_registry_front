import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion } from 'framer-motion'
import { Receipt, Filter, Smartphone } from 'lucide-react'

type SellerOrder = {
  id: string
  product: string
  buyer: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  date: string
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [status, setStatus] = useState<'all'|'pending'|'paid'|'shipped'|'completed'|'cancelled'>('all')
  const { toasts, removeToast, showSuccess } = useToast()

  useEffect(() => {
    const sample: SellerOrder[] = [
      { id: 's1', product: 'iPhone 13 128GB', buyer: 'John Doe', amount: 750000, currency: '₦', status: 'paid', date: '2025-10-01' },
      { id: 's2', product: 'Samsung S22 256GB', buyer: 'Ada Lovelace', amount: 680000, currency: '₦', status: 'pending', date: '2025-10-10' },
      { id: 's3', product: 'Tecno Spark 8', buyer: 'Kwame N', amount: 120000, currency: '₦', status: 'shipped', date: '2025-10-15' },
    ]
    setOrders(sample)
  }, [])

  const filtered = useMemo(() => orders.filter(o => status === 'all' || o.status === status), [orders, status])
  const currency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`

  const markShipped = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped' } : o))
    showSuccess('Order marked as shipped')
  }
  const confirmPayment = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'paid' } : o))
    showSuccess('Payment confirmed')
  }
  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o))
    showSuccess('Order cancelled')
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Receipt size={20} />
            <h1 className="h4 m-0">Seller Orders</h1>
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
                    <strong>{o.product}</strong>
                    <div className="text-secondary"><small>Buyer: {o.buyer} • Placed {o.date}</small></div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="text-end me-3">
                    <div className="fw-bold">{currency(o.amount, o.currency)}</div>
                    <small className="text-secondary text-capitalize">{o.status}</small>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => confirmPayment(o.id)}>Confirm Payment</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => markShipped(o.id)}>Mark Shipped</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => cancelOrder(o.id)}>Cancel</button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-12"><div className="modern-card p-4 text-center text-secondary">No seller orders</div></div>
          )}
        </div>
      </div>
    </Layout>
  )
}