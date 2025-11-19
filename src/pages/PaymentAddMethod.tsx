import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast } from '../components/Toast'
import { useNavigate } from 'react-router-dom'

export default function PaymentAddMethod() {
  const { showSuccess } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    number: '',
    exp: '',
    cvc: '',
    country: 'United States',
    address: '',
    city: '',
    postal: '',
    isDefault: true,
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const onSave = () => {
    if (!form.name || !form.number || !form.exp || !form.cvc) return
    showSuccess('Payment Method Saved', `${form.name} •••• ${form.number.slice(-4)}`)
    navigate('/payments/method-selection')
  }

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-lg-8 mx-auto">
            <h2 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Add Payment Method</h2>

            {/* Card Information */}
            <div className="modern-card p-4 mb-3">
              <h6 className="text-uppercase fw-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Card Information</h6>
              <div className="mb-3">
                <label className="form-label">Cardholder Name</label>
                <input name="name" value={form.name} onChange={onChange} className="modern-input" placeholder="John Doe" />
              </div>
              <div className="mb-3">
                <label className="form-label">Card Number</label>
                <div className="d-flex">
                  <input name="number" value={form.number} onChange={onChange} className="modern-input" placeholder="1234 5678 9101 1121" />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Expiration</label>
                  <input name="exp" value={form.exp} onChange={onChange} className="modern-input" placeholder="MM/YY" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">CVC</label>
                  <input name="cvc" value={form.cvc} onChange={onChange} className="modern-input" placeholder="123" />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="modern-card p-4 mb-3">
              <h6 className="text-uppercase fw-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Billing Address</h6>
              <div className="mb-3">
                <label className="form-label">Country</label>
                <select name="country" value={form.country} onChange={onChange} className="modern-input">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input name="address" value={form.address} onChange={onChange} className="modern-input" placeholder="123 Main Street" />
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">City</label>
                  <input name="city" value={form.city} onChange={onChange} className="modern-input" placeholder="Anytown" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Postal Code</label>
                  <input name="postal" value={form.postal} onChange={onChange} className="modern-input" placeholder="12345" />
                </div>
              </div>
            </div>

            {/* Default toggle */}
            <div className="modern-card p-3 mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="mb-0">Set as Default Payment Method</label>
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={onChange} className="form-check-input" />
              </div>
            </div>

            {/* Footer */}
            <div className="modern-card p-3">
              <div className="d-flex align-items-start justify-content-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <small>Your payment information is encrypted and stored securely.</small>
              </div>
              <button className="btn-gradient-primary w-100 py-3" onClick={onSave}>Save Card</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}