import { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { supabase } from '../lib/supabase'

export default function VerifyDevice() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toasts, removeToast, showError, showSuccess } = useToast()
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [otp, setOtp] = useState('')
  const [deviceId, setDeviceId] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    let token = params.get('token') || ''
    const did = params.get('deviceId') || ''

    if (did) {
        setDeviceId(did)
    }

    if (!token && window.location.hash.includes('token=')) {
      const hashQuery = window.location.hash.split('?')[1]
      if (hashQuery) {
        const hp = new URLSearchParams(hashQuery)
        token = hp.get('token') || ''
      }
    }

    if (token) {
        verifyToken(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const verifyToken = async (token: string) => {
      try {
        setVerifying(true)
        // Manual fetch since it's a public endpoint usually, but let's use supabase wrapper if available or fetch
        // The existing code used fetch, let's stick to fetch for the link implementation
        const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
        const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')
        
        const res = await fetch(`${API_URL}/device-management/verify-device-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Verification failed')
        
        setResult({ success: true, message: data.message || 'Device verified successfully!' })
        showSuccess('Verified', data.message)
      } catch (err: any) {
        setResult({ success: false, message: err.message })
        showError('Verification Error', err.message)
      } finally {
        setVerifying(false)
      }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!otp || !deviceId) return

      try {
          setVerifying(true)
          // @ts-ignore
          const res = await supabase.request('/device-management/verify-device', {
              method: 'POST',
              body: JSON.stringify({ device_id: deviceId, otp_code: otp })
          })
          setResult({ success: true, message: 'Device verified successfully!' })
          showSuccess('Verified', 'Device verified successfully!')
          setTimeout(() => navigate('/dashboard'), 2000)
      } catch (err: any) {
          showError('Error', err.message || 'Invalid OTP')
      } finally {
          setVerifying(false)
      }
  }

  const resendCode = async () => {
      if (!deviceId) return
      try {
          setVerifying(true)
          // @ts-ignore
          await supabase.request('/device-management/resend-verification', {
              method: 'POST',
              body: JSON.stringify({ device_id: deviceId })
          })
          showSuccess('Sent', 'Verification code resent to your email')
      } catch (err: any) {
          showError('Error', err.message)
      } finally {
          setVerifying(false)
      }
  }

  return (
    <Layout>
      <div className="container-fluid" style={{ maxWidth: 640 }}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="modern-card p-4">
          <h3 className="h5 mb-2" style={{ color: 'var(--text-primary)' }}>Verify Device</h3>
          
          {verifying && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Processing...</p>
            </div>
          )}

          {!verifying && result && (
             <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                {result.message}
                {result.success && <div className="mt-2"><Link to="/dashboard" className="btn btn-sm btn-success">Go via Dashboard</Link></div>}
             </div>
          )}

          {!verifying && !result && deviceId && (
              <div>
                  <p className="text-secondary mb-3">Enter the verification code sent to your email.</p>
                  <form onSubmit={handleOtpSubmit}>
                      <div className="mb-3">
                          <label className="form-label">Verification Code (OTP)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value)} 
                            placeholder="Enter 6-digit code"
                          />
                      </div>
                      <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary" disabled={!otp}>Verify Device</button>
                          <button type="button" className="btn btn-outline-secondary" onClick={resendCode}>Resend Code</button>
                      </div>
                  </form>
              </div>
          )}

          {!verifying && !result && !deviceId && (
               <div className="text-center py-4 text-secondary">
                   <p>Invalid verification link or missing device information.</p>
                   <Link to="/dashboard" className="btn btn-outline-primary mt-2">Return to Dashboard</Link>
               </div>
          )}
        </div>
      </div>
    </Layout>
  )
}