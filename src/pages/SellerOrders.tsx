import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion } from 'framer-motion'
import { Receipt, Filter, Smartphone } from 'lucide-react'
import { supabase } from '../lib/supabase'

type SellerOrder = {
  id: string
  product: string
  buyer: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'sold'
  date: string
  buyer_email?: string
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [status, setStatus] = useState<'all'|'pending'|'paid'|'shipped'|'completed'|'cancelled'|'sold'>('all')
  const [loading, setLoading] = useState(true)
  const { toasts, removeToast, showSuccess, showError } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
        setLoading(true)
        // @ts-ignore
        const data = await supabase.marketplace.getSellerOrders()
        const mapped = data.map((o: any) => ({
            id: o.id,
            product: `${o.brand} ${o.model}`,
            buyer: o.buyer_name || 'Unknown',
            buyer_email: o.buyer_email,
            amount: Number(o.price),
            currency: o.currency,
            status: o.status, // might be 'sold' initially
            date: new Date(o.sold_at || o.updated_at).toLocaleDateString()
        }))
        setOrders(mapped)
    } catch (err: any) {
        console.error(err)
        showError('Error', 'Failed to load orders')
    } finally {
        setLoading(false)
    }
  }

  const filtered = useMemo(() => orders.filter(o => status === 'all' || o.status === status), [orders, status])
  const currency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`

  const updateStatus = async (id: string, newStatus: string) => {
      try {
          if (!window.confirm(`Mark this order as ${newStatus}?`)) return
          // @ts-ignore
          await supabase.marketplace.update(id, { status: newStatus })
          showSuccess(`Order updated to ${newStatus}`)
          fetchOrders()
      } catch (err: any) {
          showError('Failed', err.message)
      }
  }

  return (
    <Layout requireAuth allowedRoles={["business"]}>
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
              <option value="sold">Sold (New)</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="row g-3">
          {loading ? <div className="text-center p-5">Loading orders...</div> : filtered.length === 0 ? (
             <div className="col-12"><div className="modern-card p-4 text-center text-secondary">No seller orders found</div></div>
          ) : filtered.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="col-12">
              <div className="modern-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <Smartphone size={20} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <strong>{o.product}</strong>
                    <div className="text-secondary"><small>Buyer: {o.buyer} ({o.buyer_email || 'No email'}) • Sold on {o.date}</small></div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="text-end me-3">
                    <div className="fw-bold">{currency(o.amount, o.currency)}</div>
                    <span className={`badge bg-${o.status === 'completed' ? 'success' : o.status === 'sold' ? 'primary' : 'secondary'}`}>{o.status}</span>
                  </div>
                  {o.status === 'sold' && (
                      <>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => updateStatus(o.id, 'shipped')}>Mark Shipped</button>
                      </>
                  )}
                  {o.status === 'shipped' && (
                      <button className="btn btn-sm btn-outline-success" onClick={() => updateStatus(o.id, 'completed')}>Complete</button>
                  )}
                  {/* Cancel logic is tricky - requires refund. Skip for MVP unless requested specifically.*/}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  )
}