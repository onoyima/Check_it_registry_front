import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast, ToastContainer } from '../components/Toast'
import { ButtonLoading } from '../components/Loading'

export default function PasswordReset() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const { toasts, removeToast, showSuccess, showError } = useToast()

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      showError('Validation Error', 'Please enter your email address')
      return
    }

    try {
      setRequesting(true)

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request password reset')
      }

      showSuccess('Reset Code Sent!', 'If an account with this email exists, a password reset code has been sent.')
      setStep('reset')

    } catch (err) {
      console.error('Password reset request error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to request password reset'
      showError('Request Failed', errorMessage)
    } finally {
      setRequesting(false)
    }
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpCode.trim() || !newPassword || !confirmPassword) {
      showError('Validation Error', 'Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      showError('Validation Error', 'Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('Validation Error', 'Passwords do not match')
      return
    }

    try {
      setResetting(true)

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          otp_code: otpCode.trim(),
          new_password: newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      showSuccess('Password Reset!', 'Your password has been reset successfully. You can now login with your new password.')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      console.error('Password reset error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password'
      showError('Reset Failed', errorMessage)
    } finally {
      setResetting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Password Reset</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {step === 'request' 
                ? 'Enter your email to receive a password reset code'
                : 'Enter the code sent to your email and your new password'
              }
            </p>
          </div>

          {step === 'request' ? (
            <form onSubmit={requestReset}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={requesting || !email.trim()}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {requesting ? <ButtonLoading /> : 'Send Reset Code'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn-secondary"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={resetPassword}>
              <div className="form-group">
                <label htmlFor="email-display">Email Address</label>
                <input
                  id="email-display"
                  type="email"
                  value={email}
                  disabled
                  style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="otp-code">Reset Code</label>
                <input
                  id="otp-code"
                  type="text"
                  required
                  placeholder="Enter the 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }}
                />
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                  Check your email for the 6-digit reset code
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={resetting || !otpCode || !newPassword || !confirmPassword}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {resetting ? <ButtonLoading /> : 'Reset Password'}
              </button>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setStep('request')}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
          <p>
            Need help? Contact support at{' '}
            <a href="mailto:onoyimab@veritas.edu.ng" style={{ color: 'var(--accent-primary)' }}>
              onoyimab@veritas.edu.ng
            </a>
          </p>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  )
}