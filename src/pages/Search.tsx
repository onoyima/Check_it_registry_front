import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { QRScanner } from '../components/mobile/QRScanner'
import { mobileIntegrationService } from '../services/MobileIntegrationService'
import { 
  Search as SearchIcon, 
  Filter, 
  QrCode, 
  Smartphone, 
  Barcode, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle
} from 'lucide-react'

type PublicCheckStatus = 'clean' | 'stolen' | 'lost' | 'not_found'

interface PublicCheckResult {
  status: PublicCheckStatus
  message: string
  case_id?: string
  report_type?: string
  occurred_at?: string
}

export default function Search() {
  // Global search state (placeholder)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'device'|'user'|'report'|'all'>('all')

  // Device quick check state
  const [imei, setImei] = useState('')
  const [serial, setSerial] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PublicCheckResult | null>(null)
  const [showQR, setShowQR] = useState(false)
  const { toasts, removeToast, showError, showSuccess } = useToast()

  const isIMEI = (value: string) => /^\d{14,16}$/.test(value)

  const handleQuickCheck = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setResult(null)

    const pImei = imei.trim()
    const pSerial = serial.trim()
    if (!pImei && !pSerial) {
      setError('Enter IMEI or serial number to check')
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (pImei) params.set('imei', pImei)
      if (!pImei && pSerial) params.set('serial', pSerial)

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/public-check?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to check device')
      const json: PublicCheckResult = await res.json()
      setResult(json)
      showSuccess('Check Complete', json.message)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Device check failed'
      setError(msg)
      showError('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleScanResult = (data: string) => {
    const value = data.trim()
    if (isIMEI(value)) {
      setImei(value)
      setSerial('')
    } else {
      setSerial(value)
      setImei('')
    }
    setShowQR(false)
  }

  const getStatusIcon = (status: PublicCheckStatus) => {
    switch (status) {
      case 'clean': return CheckCircle
      case 'stolen': return ShieldAlert
      case 'lost': return AlertTriangle
      default: return HelpCircle
    }
  }

  const getStatusColor = (status: PublicCheckStatus) => {
    switch (status) {
      case 'clean': return 'var(--success-500)'
      case 'stolen': return 'var(--danger-500)'
      case 'lost': return 'var(--warning-500)'
      default: return 'var(--text-secondary)'
    }
  }

  const getStatusAdvice = (status: PublicCheckStatus) => {
    switch (status) {
      case 'clean':
        return 'No active reports found. Proceed with purchase or use.'
      case 'stolen':
        return 'Do not proceed. Contact authorities or the rightful owner.'
      case 'lost':
        return 'If found, attempt to contact the owner or report appropriately.'
      default:
        return 'Not found in registry. Verify identifiers and try again.'
    }
  }

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <SearchIcon size={20} />
            <div>
              <h1 className="h4 m-0">Global Search</h1>
              <small className="text-secondary">Find devices, users, and reports</small>
            </div>
          </div>
        </div>
        {/* Global Search (placeholder) */}
        <div className="modern-card p-3 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Search</label>
              <div className="input-group">
                <span className="input-group-text"><SearchIcon size={16} /></span>
                <input value={query} onChange={e => setQuery(e.target.value)} className="form-control" placeholder="IMEI, serial, email, case #" />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Type</label>
              <div className="input-group">
                <span className="input-group-text"><Filter size={16} /></span>
                <select value={type} onChange={e => setType(e.target.value as any)} className="form-select">
                  <option value="all">All</option>
                  <option value="device">Devices</option>
                  <option value="user">Users</option>
                  <option value="report">Reports</option>
                </select>
              </div>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" disabled>
                Search (coming soon)
              </button>
            </div>
          </div>
        </div>

        {/* Device Quick Check - Mobile-inspired */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-4">
          <form onSubmit={handleQuickCheck}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <QrCode size={18} style={{ color: 'var(--primary-600)' }} />
                <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Device Quick Check</h5>
              </div>
              <button 
                type="button"
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={async () => {
                  const caps = await mobileIntegrationService.detectCapabilities()
                  if (!caps.hasCamera) {
                    showError('No Camera', 'Camera not available on this device')
                    return
                  }
                  setShowQR(true)
                }}
              >
                <QrCode size={16} />
                Scan QR
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="imei" className="form-label d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Smartphone size={16} /> IMEI
                </label>
                <div className="position-relative">
                  <input id="imei" className="modern-input pe-5" placeholder="Enter 15-digit IMEI" value={imei} onChange={e => setImei(e.target.value.replace(/\D/g, '').slice(0, 16))} />
                  <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-2" title="Scan QR" onClick={() => setShowQR(true)}>
                    <QrCode size={18} />
                  </button>
                </div>
                <small style={{ color: 'var(--text-tertiary)' }}>Dial *#06# or check device settings</small>
              </div>
              <div className="col-md-6">
                <label htmlFor="serial" className="form-label d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Barcode size={16} /> Serial Number
                </label>
                <div className="position-relative">
                  <input id="serial" className="modern-input pe-5" placeholder="Enter device serial number" value={serial} onChange={e => setSerial(e.target.value.trim())} />
                  <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-2" title="Scan QR" onClick={() => setShowQR(true)}>
                    <QrCode size={18} />
                  </button>
                </div>
                <small style={{ color: 'var(--text-tertiary)' }}>Found on device label, box, or settings</small>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-danger d-flex align-items-center mt-3">
                <AlertTriangle size={16} className="me-2" />
                {error}
              </motion.div>
            )}

            <div className="d-grid mt-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || (!imei && !serial)} className="btn btn-gradient-primary d-flex align-items-center justify-content-center gap-2 py-2">
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div>
                    Checking…
                  </>
                ) : (
                  <>
                    <SearchIcon size={16} />
                    Check Device Status
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="modern-card mt-4 p-4">
                <div className="text-center mb-3">
                  {(() => {
                    const Icon = getStatusIcon(result.status)
                    const color = getStatusColor(result.status)
                    return (
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2" style={{ width: '56px', height: '56px', backgroundColor: `${color}15`, border: `2px solid ${color}30` }}>
                        <Icon size={24} style={{ color }} />
                      </div>
                    )
                  })()}
                  <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>{result.message}</h6>
                  <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{getStatusAdvice(result.status)}</p>
                </div>

                {(result.case_id || result.report_type || result.occurred_at) && (
                  <div className="row g-3">
                    {result.case_id && (
                      <div className="col-md-4">
                        <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Case ID</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{result.case_id}</div>
                        </div>
                      </div>
                    )}
                    {result.report_type && (
                      <div className="col-md-4">
                        <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Report Type</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{result.report_type}</div>
                        </div>
                      </div>
                    )}
                    {result.occurred_at && (
                      <div className="col-md-4">
                        <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Occurred Date</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{new Date(result.occurred_at).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>

      {/* QR Scanner Modal */}
      <QRScanner isOpen={showQR} onScan={handleScanResult} onError={(err) => showError('Scan Error', err)} onClose={() => setShowQR(false)} />
    </Layout>
  )
}