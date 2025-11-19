import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'

type SavedMethod = {
  id: string
  label: string
  brand?: string
  last4?: string
}

export default function PaymentMethodSelection() {
  const navigate = useNavigate()
  const { showSuccess } = useToast()
  const [amount] = useState(15.99)
  const [savedMethods] = useState<SavedMethod[]>([
    { id: 'card_4242', label: 'Visa ending in 4242', brand: 'Visa', last4: '4242' },
    { id: 'apple_pay', label: 'Apple Pay' },
  ])
  const [selectedId, setSelectedId] = useState<string>(savedMethods[0]?.id || '')

  const handlePay = () => {
    if (!selectedId) return
    showSuccess('Proceed to Confirmation', `Using ${savedMethods.find(m => m.id === selectedId)?.label}`)
    navigate('/payments/confirm', { state: { amount, methodId: selectedId } })
  }

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-lg-8 mx-auto">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Select Payment</h2>
            </div>

            {/* Order Summary */}
            <div className="modern-card p-4 mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>Total Due</p>
                  <p className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    ${amount.toFixed(2)}
                  </p>
                  <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Check It - Device Registry</p>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                  <span className="fw-bold">$</span>
                </div>
              </div>
            </div>

            {/* Saved Methods */}
            <div className="mb-3">
              <h5 className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Saved Methods</h5>
              <div className="modern-card">
                {savedMethods.map((m, idx) => (
                  <label key={m.id} className="d-flex align-items-center justify-content-between p-3" style={{ borderBottom: idx !== savedMethods.length - 1 ? '1px solid var(--border-color)' : 'none', cursor: 'pointer' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded" style={{ width: 40, height: 28, background: 'var(--bg-secondary)' }} />
                      <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      className="form-check-input"
                      checked={selectedId === m.id}
                      onChange={() => setSelectedId(m.id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Add New Method */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Add New Method</h5>
              <div className="modern-card">
                <button className="w-100 d-flex align-items-center justify-content-between p-3 btn btn-link text-decoration-none" onClick={() => navigate('/payments/add-method')}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      <span className="material-symbols-outlined">credit_card</span>
                    </div>
                    <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Add Credit/Debit Card</p>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>›</span>
                </button>
                <div style={{ borderTop: '1px solid var(--border-color)' }} />
                <button className="w-100 d-flex align-items-center justify-content-between p-3 btn btn-link text-decoration-none" disabled>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Link Bank Account (coming soon)</p>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>›</span>
                </button>
              </div>
            </div>

            {/* Footer actions */}
            <div className="modern-card p-3">
              <div className="d-flex flex-column gap-3">
                <button className="btn-gradient-primary w-100 py-3" onClick={handlePay}>
                  Pay ${amount.toFixed(2)}
                </button>
                <div className="d-flex align-items-center justify-content-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <small>Secure payment via Stripe</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}