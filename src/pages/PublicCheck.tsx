import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Smartphone, 
  Barcode, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  UserPlus,
  FileText,
  Calendar,
  Info,
  Lightbulb,
  Eye,
  Handshake
} from 'lucide-react'
import { CheckResult } from '../types/database'
import { supabase } from '../lib/supabase'
import { buildCheckHeaders } from '../lib/clientContext'
import { useToast, ToastContainer } from '../components/Toast'
import Navbar from '../components/Navbar'

interface PublicCheckProps {
  user?: any
  onLogout?: () => void
}

export default function PublicCheck({ user, onLogout }: PublicCheckProps = {}) {
  const [imei, setImei] = useState('')
  const [serial, setSerial] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast()

  const validateInput = () => {
    if (!imei.trim() && !serial.trim()) {
      setError('Please enter either an IMEI or serial number')
      return false
    }

    if (imei && imei.length < 10) {
      setError('IMEI must be at least 10 digits')
      return false
    }

    if (serial && serial.length < 3) {
      setError('Serial number must be at least 3 characters')
      return false
    }

    return true
  }

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    if (!validateInput()) {
      setLoading(false)
      return
    }

    try {
      const headers = await buildCheckHeaders()
      const query = imei.trim() ? { imei: imei.trim() } : { serial: serial.trim() }
      const data = await supabase.publicCheck(query, headers)
      
      setResult(data)

      // Show appropriate toast based on result
      if (data.status === 'clean') {
        showSuccess('Device is Clean', 'This device has no active reports')
      } else if (data.status === 'not_found') {
        showWarning('Device Not Found', 'This device is not registered in our system')
      } else if (data.status === 'stolen' || data.status === 'lost') {
        showError('Device Alert!', `This device has been reported as ${data.status}`)
      }
    } catch (err) {
      console.error('Check error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to check device status'
      setError(errorMessage)
      showError('Check Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean': return { icon: CheckCircle, color: 'text-success' }
      case 'not_found': return { icon: HelpCircle, color: 'text-warning' }
      case 'stolen': return { icon: AlertTriangle, color: 'text-danger' }
      case 'lost': return { icon: Search, color: 'text-warning' }
      default: return { icon: Info, color: 'text-info' }
    }
  }

  const getStatusAlert = (status: string) => {
    switch (status) {
      case 'clean': return 'alert-success'
      case 'not_found': return 'alert-warning'
      case 'stolen': return 'alert-danger'
      case 'lost': return 'alert-warning'
      default: return 'alert-info'
    }
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navbar user={user} onLogout={onLogout || (() => {})} />

      {/* Animated Hero Section */}
      <div className="container-fluid py-5">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white mb-5"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="d-inline-flex align-items-center justify-content-center mb-4 float"
            style={{ 
              width: '120px', 
              height: '120px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '30px',
              backdropFilter: 'blur(20px)'
            }}
          >
            <Search size={60} className="text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="display-3 fw-bold mb-4"
          >
            Check Device Status
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lead text-white text-opacity-90 mx-auto"
            style={{ maxWidth: '600px' }}
          >
            Verify if a device has been reported as stolen or lost before making a purchase. 
            Protect yourself from buying stolen goods.
          </motion.p>
        </motion.div>

        {/* Modern Check Form */}
        <div className="row justify-content-center">
          <div className="col-11 col-md-10 col-lg-8 col-xl-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="glass-card p-4 p-md-5 mb-5"
            >
              <form onSubmit={handleCheck}>
                <div className="row g-4">
                  {/* IMEI Field */}
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="col-md-6"
                  >
                    <label htmlFor="imei" className="form-label text-white fw-semibold">
                      <Smartphone size={16} className="me-2" />
                      IMEI Number
                    </label>
                    <div className="position-relative">
                      <input
                        id="imei"
                        type="text"
                        className="modern-input"
                        placeholder="e.g., 123456789012345"
                        value={imei}
                        onChange={(e) => {
                          setImei(e.target.value)
                          if (e.target.value) setSerial('')
                        }}
                      />
                      <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                        <Smartphone size={18} className="text-muted" />
                      </div>
                    </div>
                    <small className="text-white text-opacity-75">
                      Usually found in Settings → About Phone
                    </small>
                  </motion.div>

                  {/* Serial Field */}
                  <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="col-md-6"
                  >
                    <label htmlFor="serial" className="form-label text-white fw-semibold">
                      <Barcode size={16} className="me-2" />
                      Serial Number
                    </label>
                    <div className="position-relative">
                      <input
                        id="serial"
                        type="text"
                        className="modern-input"
                        placeholder="e.g., ABC123456789"
                        value={serial}
                        onChange={(e) => {
                          setSerial(e.target.value)
                          if (e.target.value) setImei('')
                        }}
                      />
                      <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                        <Barcode size={18} className="text-muted" />
                      </div>
                    </div>
                    <small className="text-white text-opacity-75">
                      Alternative identifier for the device
                    </small>
                  </motion.div>
                </div>

                {/* Info Badge */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-center my-4"
                >
                  <span className="badge bg-white bg-opacity-20 text-white px-3 py-2">
                    <Info size={14} className="me-2" />
                    Enter either IMEI or Serial Number (not both)
                  </span>
                </motion.div>

                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="alert alert-danger d-flex align-items-center mb-4"
                    >
                      <AlertTriangle size={18} className="me-2" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Check Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="d-grid"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || (!imei && !serial)}
                    className="btn btn-light btn-lg fw-semibold"
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Checking device...
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <Search size={18} className="me-2" />
                        Check Device Status
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Animated Results */}
        <AnimatePresence>
          {result && (
            <div className="row justify-content-center">
              <div className="col-11 col-md-10 col-lg-8 col-xl-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className={`alert ${getStatusAlert(result.status)} border-0 shadow-lg mb-5`}
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0 me-3">
                      {(() => {
                        const { icon: StatusIcon, color } = getStatusIcon(result.status);
                        return <StatusIcon size={32} className={color} />;
                      })()}
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="alert-heading fw-bold mb-3">
                        {result.status === 'clean' && (
                          <span className="d-flex align-items-center">
                            <CheckCircle size={24} className="me-2" />
                            Device Status: Clean
                          </span>
                        )}
                        {result.status === 'not_found' && (
                          <span className="d-flex align-items-center">
                            <HelpCircle size={24} className="me-2" />
                            Device Not Found
                          </span>
                        )}
                        {result.status === 'stolen' && (
                          <span className="d-flex align-items-center">
                            <AlertTriangle size={24} className="me-2" />
                            WARNING: Device Reported Stolen
                          </span>
                        )}
                        {result.status === 'lost' && (
                          <span className="d-flex align-items-center">
                            <Search size={24} className="me-2" />
                            WARNING: Device Reported Lost
                          </span>
                        )}
                      </h4>
                      <p className="mb-4">{result.message}</p>

                      {/* Case Details */}
                      <div className="row g-3 mb-3">
                        {result.case_id && (
                          <div className="col-md-6">
                            <div className="bg-white bg-opacity-50 rounded-3 p-3">
                              <div className="d-flex align-items-center">
                                <FileText size={18} className="me-2" />
                                <div>
                                  <small className="text-muted d-block">Case ID</small>
                                  <strong>{result.case_id}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {result.occurred_at && (
                          <div className="col-md-6">
                            <div className="bg-white bg-opacity-50 rounded-3 p-3">
                              <div className="d-flex align-items-center">
                                <Calendar size={18} className="me-2" />
                                <div>
                                  <small className="text-muted d-block">Reported</small>
                                  <strong>{new Date(result.occurred_at).toLocaleDateString()}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recovery Instructions */}
                      {result.recovery_instructions && (
                        <div className="bg-dark text-white rounded-3 p-4 mb-3">
                          <h6 className="fw-bold mb-2 d-flex align-items-center">
                            <Info size={18} className="me-2" />
                            Recovery Instructions
                          </h6>
                          <p className="mb-0 small">{result.recovery_instructions}</p>
                        </div>
                      )}

                      {/* Risk Warning for non-owners when stolen/lost */}
                      {(result.status === 'stolen' || result.status === 'lost') && (
                        <div className="rounded-3 p-4 mb-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                          <div className="d-flex align-items-start gap-2">
                            <AlertTriangle size={18} className="me-1" style={{ color: 'var(--danger-600)' }} />
                            <div>
                              <p className="mb-2 fw-semibold" style={{ color: 'var(--danger-700)' }}>Risk Warning</p>
                              <p className="mb-0" style={{ color: 'var(--danger-700)', fontSize: 14 }}>
                                If you are not the device owner, checking or attempting to purchase a device reported as {result.status} may put you at legal risk. 
                                Do not proceed with purchase. Consider contacting local authorities.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {result.status === 'not_found' && (
                        <div className="d-flex gap-2 flex-wrap">
                          <Link to="/register" className="btn btn-primary">
                            <Shield size={16} className="me-2" />
                            Register Your Device
                          </Link>
                          <Link to="/help" className="btn btn-outline-primary">
                            <HelpCircle size={16} className="me-2" />
                            Learn More
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* How It Works Section */}
        <div className="row justify-content-center">
          <div className="col-11 col-lg-10">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="glass-card p-4 p-md-5"
            >
              <div className="text-center mb-5">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring" }}
                  className="d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: '60px', 
                    height: '60px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '15px'
                  }}
                >
                  <Lightbulb size={30} className="text-white" />
                </motion.div>
                <h2 className="h3 fw-bold text-white mb-3">How It Works</h2>
                <p className="text-white text-opacity-75">
                  Our simple 4-step process to protect your devices
                </p>
              </div>

              <div className="row g-4">
                {[
                  {
                    icon: UserPlus,
                    title: "1. Register",
                    description: "Device owners register their devices with proof of ownership",
                    color: "bg-primary",
                    delay: 1.5
                  },
                  {
                    icon: AlertTriangle,
                    title: "2. Report",
                    description: "If stolen or lost, owners report it immediately to our system",
                    color: "bg-danger",
                    delay: 1.6
                  },
                  {
                    icon: Eye,
                    title: "3. Check",
                    description: "Anyone can check a device's status before purchasing",
                    color: "bg-info",
                    delay: 1.7
                  },
                  {
                    icon: Handshake,
                    title: "4. Recover",
                    description: "Found devices can be reported to help reunite with owners",
                    color: "bg-success",
                    delay: 1.8
                  }
                ].map((step, index) => (
                  <div key={index} className="col-md-6 col-lg-3">
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: step.delay }}
                      className="text-center h-100"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`${step.color} bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                        style={{ width: '80px', height: '80px' }}
                      >
                        <step.icon size={32} className="text-white" />
                      </motion.div>
                      <h5 className="fw-bold text-white mb-3">{step.title}</h5>
                      <p className="text-white text-opacity-75 small">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9 }}
                className="text-center mt-5"
              >
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Link to="/register" className="btn btn-light btn-lg">
                    <Shield size={18} className="me-2" />
                    Register Your Device
                  </Link>
                  <Link to="/help" className="btn btn-outline-light btn-lg">
                    <HelpCircle size={18} className="me-2" />
                    Learn More
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
