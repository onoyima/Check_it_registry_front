import { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'

export default function VerifyDevice() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toasts, removeToast, showError, showSuccess } = useToast()
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    let token = params.get('token') || ''
    // Handle hash-style links like #/verify-device?token=...
    if (!token && window.location.hash.includes('token=')) {
      const hashQuery = window.location.hash.split('?')[1]
      if (hashQuery) {
        const hp = new URLSearchParams(hashQuery)
        token = hp.get('token') || ''
      }
    }

    const run = async () => {
      if (!token) {
        setResult({ success: false, message: 'Missing verification token' })
        return
      }
      try {
        setVerifying(true)
        const res = await fetch(`${API_URL}/device-management/verify-device-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = data.error || `Verification failed (status ${res.status})`
          throw new Error(msg)
        }
        const msg = data?.message || 'Device verified successfully!'
        setResult({ success: true, message: msg })
        showSuccess('Verified', msg)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Verification failed'
        setResult({ success: false, message: msg })
        showError('Verification Error', msg)
      } finally {
        setVerifying(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  return (
    <Layout>
      <div className="container-fluid" style={{ maxWidth: 640 }}>
        <div className="modern-card p-4">
          <h3 className="h5 mb-2" style={{ color: 'var(--text-primary)' }}>Verify Device</h3>
          <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>Confirm your ownership via email link.</p>

          {verifying ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: 'var(--primary-600)' }} />
              <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Verifying…</p>
            </div>
          ) : result ? (
            <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
              {result.message}
            </div>
          ) : (
            <div className="text-muted">Preparing verification…</div>
          )}

          <div className="d-flex gap-2 mt-3">
            <Link to="/login" className="btn btn-outline-secondary">Go to Login</Link>
            {result?.success && (
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Continue</button>
            )}
          </div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}