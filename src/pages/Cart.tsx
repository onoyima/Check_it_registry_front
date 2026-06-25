import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Shield, CreditCard, Package, MapPin, BadgeCheck } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, itemCount, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const formatCurrency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-fluid" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="modern-card p-5 text-center" style={{ marginTop: 40 }}>
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShoppingCart size={48} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Browse the marketplace to find devices you'd like to purchase.</p>
              <Link to="/marketplace/browse" className="btn-gradient-primary mt-3">
                <Package size={16} /> Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-fluid" style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <Link to="/marketplace/browse" className="btn btn-ghost" style={{ padding: '6px 12px', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </motion.div>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>Shopping Cart</h4>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
          <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2" onClick={clearCart}>
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="modern-card p-0 overflow-hidden"
                >
                  <div className="d-flex" style={{ minHeight: 140 }}>
                    <div
                      style={{
                        width: 140, flexShrink: 0, backgroundSize: 'cover', backgroundPosition: 'center',
                        backgroundImage: `url(${item.image})`, cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/marketplace/listing/${item.id}`)}
                    />
                    <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div>
                            <div
                              style={{ fontWeight: 600, cursor: 'pointer', marginBottom: 4 }}
                              onClick={() => navigate(`/marketplace/listing/${item.id}`)}
                            >
                              {item.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)' }}>
                              <MapPin size={12} /> {item.location}
                              <BadgeCheck size={12} style={{ color: 'var(--success-500)' }} />
                              {item.seller_name}
                            </div>
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger-500)', flexShrink: 0, padding: 4 }}
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 8, padding: 4 }}>
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{item.quantity}</span>
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-600)' }}>
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="modern-card" style={{ padding: 24, position: 'sticky', top: 88 }}>
              <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Order Summary</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity, item.currency)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Platform fee</span>
                <span style={{ color: 'var(--success-600)', fontSize: 13 }}>Included</span>
              </div>
              <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                <div className="d-flex align-items-start gap-2">
                  <Shield size={16} style={{ color: '#6366f1', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p className="mb-0" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Your payment is held in escrow until delivery is confirmed.
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="btn-gradient-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  if (!user) { navigate('/login'); return }
                  navigate(`/checkout?cart=true`)
                }}
              >
                <CreditCard size={18} /> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
