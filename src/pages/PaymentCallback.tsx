import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'

// Only allow same-origin relative paths, never a scheme or //host.
function safePath(value: unknown): string {
  if (typeof value !== 'string') return ''
  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return ''
  for (const ch of path) { if (ch.charCodeAt(0) < 32) return '' }
  return path.slice(0, 500)
}

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('')

  const reference = searchParams.get('reference') || ''
  const trxref = searchParams.get('trxref') || ''
  const ref = reference || trxref
  // Fee payments (report, device check, business, release ...) are marked by the
  // callback URL or by their FEE-/CHK- reference. Everything else is a purchase.
  const isFee = searchParams.get('kind') === 'fee' || ref.startsWith('FEE-') || ref.startsWith('CHK-')
  // Where the fee payment was started from. Prefer the value the server stored
  // on the invoice (survives providers that drop query params); fall back to the
  // callback URL.
  const urlReturnTo = safePath(searchParams.get('return_to'))
  const returnToRef = useRef(urlReturnTo)
  const [returnTo, setReturnTo] = useState(urlReturnTo)

  useEffect(() => {
    if (!ref) {
      setStatus('failed')
      setMessage('No payment reference found.')
      return
    }

    const complete = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const api = import.meta.env.VITE_API_URL || '/api'
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

        // Fee payments: just confirm the payment; the original tab continues the action.
        if (isFee) {
          const res = await fetch(`${api}/revenue-admin/invoices/verify`, {
            method: 'POST', headers, body: JSON.stringify({ reference: ref }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error?.message || data.error || 'Verification failed')
          if (!data.paid) throw new Error('Payment not confirmed yet. If you were charged, wait a minute and refresh this page.')
          const serverReturnTo = safePath(data.return_to)
          if (serverReturnTo) {
            const previous = returnToRef.current
            returnToRef.current = serverReturnTo
            if (serverReturnTo !== previous) setReturnTo(serverReturnTo)
          }
          const destination = serverReturnTo || returnToRef.current
          setStatus('success')
          setMessage(destination
            ? 'Payment confirmed. Returning you to the page you were on…'
            : 'Payment confirmed. You can close this tab and go back to the page you were on.')
          return
        }

        // Marketplace: single item or whole cart
        const endpoint = ref.startsWith('BUL') ? 'bulk-complete-purchase' : 'complete-purchase'
        const res = await fetch(`${api}/marketplace/${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ reference: ref }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error?.message || data.error || 'Verification failed')
        setStatus('success')
        setMessage(data.message || 'Purchase completed!')
      } catch (err: any) {
        setStatus('failed')
        setMessage(err.message || 'Could not verify payment')
      }
    }
    complete()
  }, [ref, isFee, returnTo])

  // Marketplace purchases belong in "My Orders", not on a payment screen.
  useEffect(() => {
    if (status !== 'success' || isFee) return
    const timer = window.setTimeout(() => {
      navigate('/orders', { replace: true, state: { justPurchased: true } })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [status, isFee, navigate])

  // Fee payments that were started from a page return the user there, so they
  // can finish what they were doing (e.g. enter their NIN and submit a report).
  // The fee flow opens Paystack in a separate tab, so closing it puts the user
  // straight back on the original page with its form/state intact.
  useEffect(() => {
    if (status !== 'success' || !isFee || !returnTo) return
    const timer = window.setTimeout(() => {
      // This tab was opened by the app, so close it: the browser then puts the
      // user back on the page that started the payment (form state intact).
      try { window.opener?.focus() } catch { /* ignore */ }
      window.close()
      // If the browser refused to close it, navigate back instead.
      window.setTimeout(() => {
        if (!window.closed) navigate(returnTo, { replace: true })
      }, 400)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [status, isFee, returnTo, navigate])

  const feeSuccess = isFee && status === 'success'
  const purchaseSuccess = !isFee && status === 'success'

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <div className="row justify-content-center py-5">
          <div className="col-lg-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="modern-card p-5 text-center">
                {status === 'verifying' && (
                  <>
                    <Loader2 size={48} className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} />
                    <h4>Verifying Payment...</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Please wait while we confirm your payment with Paystack.</p>
                  </>
                )}

                {feeSuccess && (
                  <>
                    <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ width: 64, height: 64, background: 'var(--success-50)' }}>
                      <CheckCircle size={32} style={{ color: 'var(--success-500)' }} />
                    </div>
                    <h4>Payment Successful!</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Reference: <strong>{ref}</strong>
                    </p>
                    {!returnTo && (
                      <div className="d-flex gap-3 justify-content-center mt-3">
                        <Link to="/dashboard" className="btn-gradient-primary">Go to Dashboard</Link>
                        <button type="button" className="btn-outline-primary" onClick={() => window.close()}>Close this tab</button>
                      </div>
                    )}
                  </>
                )}

                {purchaseSuccess && (
                  <>
                    <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ width: 64, height: 64, background: 'var(--success-50)' }}>
                      <CheckCircle size={32} style={{ color: 'var(--success-500)' }} />
                    </div>
                    <h4>Payment Successful!</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Taking you to your orders…</p>
                    <Link to="/orders" className="btn-gradient-primary mt-3">View My Orders</Link>
                  </>
                )}

                {status === 'failed' && (
                  <>
                    <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ width: 64, height: 64, background: 'var(--danger-50)' }}>
                      <XCircle size={32} style={{ color: 'var(--danger-500)' }} />
                    </div>
                    <h4>Payment Verification Failed</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      If your card was charged, please contact support with reference: <strong>{ref}</strong>
                    </p>
                    <div className="d-flex gap-3 justify-content-center mt-3">
                      {isFee ? (
                        <>
                          <Link to="/dashboard" className="btn-gradient-primary">Go to Dashboard</Link>
                          <button type="button" className="btn-outline-primary" onClick={() => window.history.back()}>Go Back</button>
                        </>
                      ) : (
                        <>
                          <Link to="/marketplace" className="btn-gradient-primary">Back to Marketplace</Link>
                          <Link to="/orders" className="btn-outline-primary">View My Orders</Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
