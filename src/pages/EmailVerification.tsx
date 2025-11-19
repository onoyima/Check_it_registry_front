import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast } from '../components/Toast'
import { useNavigate } from 'react-router-dom'

export default function EmailVerification() {
  const { showSuccess, showError, showInfo } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showError('Validation Error', 'Enter a valid email')
      return
    }
    if (!code || code.replace(/\s/g, '').length < 6) {
      showError('Validation Error', 'Enter the 6-digit code')
      return
    }
    try {
      setSubmitting(true)
      // Mock verification
      await new Promise(res => setTimeout(res, 500))
      showSuccess('Email Verified', 'Your account is now active')
      navigate('/dashboard')
    } catch (e) {
      showError('Verification Failed', e instanceof Error ? e.message : 'Please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const onResend = async () => {
    if (!email) {
      showError('Email Required', 'Enter your email to resend')
      return
    }
    await new Promise(res => setTimeout(res, 300))
    showInfo('Code Resent', 'Check your inbox for a new code')
  }

  return (
    <Layout>
      <div className="container py-4">
        <div className="row g-3">
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            <div className="modern-card p-4">
              <h2 className="fw-bold mb-2">Verify Your Email</h2>
              <p className="text-secondary mb-3">Enter the 6-digit code sent to your email address to activate your account.</p>
              <form onSubmit={onVerify}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="modern-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Verification Code</label>
                  <input className="modern-input" placeholder="123 456" value={code} onChange={e => setCode(e.target.value)} />
                  <small className="text-secondary">Tip: You can paste the full code.</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button className="btn btn-link" type="button" onClick={onResend}>Resend Code</button>
                  <button className="btn-gradient-primary" type="submit" disabled={submitting}>{submitting ? 'Verifying...' : 'Verify Email'}</button>
                </div>
              </form>
              <div className="d-flex justify-content-between">
                <a href="#/login" className="btn btn-outline-secondary">Back to Login</a>
                <a href="#/register" className="btn btn-outline-primary">Create Account</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}