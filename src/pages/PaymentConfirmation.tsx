import React from 'react'
import { Layout } from '../components/Layout'
import { useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'

export default function PaymentConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showSuccess } = useToast()
  const amount = (location.state as any)?.amount ?? 108.5
  const methodId = (location.state as any)?.methodId ?? 'card_1234'

  const onConfirm = () => {
    showSuccess('Payment Successful', `Charged $${amount.toFixed(2)} to ${methodId}`)
    navigate('/payments/transactions')
  }

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-lg-8 mx-auto">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Confirm Payment</h2>
            </div>

            {/* Recipient */}
            <div className="d-flex flex-column align-items-center modern-card p-4 mb-3" style={{ textAlign: 'center' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: 56, height: 56, background: 'var(--gray-200)' }}>
                <span>🏬</span>
              </div>
              <h5 className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Check It Inc.</h5>
              <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>1-Year Premium Subscription</p>
            </div>

            {/* Amount */}
            <h1 className="fw-bold text-center" style={{ color: 'var(--text-primary)', fontSize: 40 }}>${amount.toFixed(2)}</h1>

            {/* Order summary */}
            <div className="modern-card p-3 mb-3">
              <div className="d-flex justify-content-between py-2">
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Subtotal</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>${(amount - 8.5).toFixed(2)}</p>
              </div>
              <div className="d-flex justify-content-between py-2">
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Service Fee</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>$2.50</p>
              </div>
              <div className="d-flex justify-content-between py-2">
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Taxes</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)' }}>$6.00</p>
              </div>
            </div>

            {/* Paying with */}
            <div className="modern-card p-3 mb-3">
              <p className="mb-2 text-uppercase fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Paying With</p>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: 'var(--bg-secondary)' }}>
                    <span>💳</span>
                  </div>
                  <div>
                    <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      {methodId.includes('apple') ? 'Apple Pay' : 'Visa **** 1234'}
                    </p>
                    <small style={{ color: 'var(--text-secondary)' }}>Expires 08/26</small>
                  </div>
                </div>
                <button className="btn btn-link" onClick={() => navigate('/payments/method-selection')}>Change</button>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="modern-card p-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <small>Secure SSL Transaction</small>
              </div>
              <button className="btn-gradient-primary w-100 py-3" onClick={onConfirm}>Confirm &amp; Pay ${amount.toFixed(2)}</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}