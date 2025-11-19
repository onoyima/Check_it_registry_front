import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast, ToastContainer } from '../components/Toast'
import Navbar from '../components/Navbar'
import OTPVerification from '../components/OTPVerification'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpData, setOtpData] = useState<{
    userId: string;
    deviceFingerprint: string;
    userEmail: string;
  } | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toasts, removeToast, showSuccess, showError } = useToast()
  // Unified API base for all auth requests
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Password is required')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Use the new backend API instead of Supabase
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Check if device verification is required
      if (data.requires_device_verification) {
        setOtpData({
          userId: data.user_id,
          deviceFingerprint: data.device_fingerprint,
          userEmail: email.trim()
        })
        setShowOTPModal(true)
        showSuccess('Verification Required', 'Please check your email for a verification code.')
      } else {
        // Normal login success
        console.log('Login successful, user data:', data.user)
        
        // Use auth context to login
        login(data.token, data.user)
        
        showSuccess('Login Successful', `Welcome back, ${data.user.name || 'User'}!`)
        
        // Navigate to dashboard immediately
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(errorMessage)
      showError('Login Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerify = async (otp: string, rememberDevice: boolean) => {
    if (!otpData) return

    setOtpLoading(true)
    setOtpError('')

    try {
      const response = await fetch(`${API_URL}/auth/verify-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: otpData.userId,
          otp_code: otp,
          device_fingerprint: otpData.deviceFingerprint,
          remember_device: rememberDevice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      // Use auth context to login
      login(data.token, data.user)

      setShowOTPModal(false)
      showSuccess('Login Successful', `Welcome back, ${data.user.name || 'User'}!`)
      
      // Navigate to dashboard immediately
      navigate('/dashboard', { replace: true })

    } catch (err) {
      console.error('OTP verification error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.'
      setOtpError(errorMessage)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!otpData) return

    try {
      const response = await fetch(`${API_URL}/auth/resend-device-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: otpData.userId,
          device_fingerprint: otpData.deviceFingerprint,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      showSuccess('Code Sent', 'A new verification code has been sent to your email.')
    } catch (err) {
      console.error('Resend OTP error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code'
      showError('Resend Failed', errorMessage)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)' }}>
      <Navbar user={null} onLogout={() => {}} />

      <div className="container-fluid py-5">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
            {/* Animated Header */}
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-5"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="d-inline-flex align-items-center justify-content-center mb-4 rounded-4 shadow-lg"
                style={{ 
                  width: '80px', 
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px'
                }}
              >
                <img 
                  src="/logo1.png" 
                  alt="Check It Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)' // Makes logo white
                  }}
                />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="display-6 fw-bold text-white mb-2"
              >
                Welcome Back
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white opacity-75"
              >
                Sign in to protect your devices
              </motion.p>
            </motion.div>

            {/* Modern Login Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass-card p-4 p-md-5"
            >
              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-4"
                >
                  <label htmlFor="email" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <div className="position-relative">
                    <input
                      id="email"
                      type="email"
                      className="modern-input"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        color: 'var(--gray-900)'
                      }}
                    />
                    <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                      <Mail size={18} style={{ color: 'var(--gray-500)' }} />
                    </div>
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-4"
                >
                  <label htmlFor="password" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                    <Lock size={16} />
                    Password
                  </label>
                  <div className="position-relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="modern-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        color: 'var(--gray-900)'
                      }}
                    />
                    <button
                      type="button"
                      className="position-absolute top-50 end-0 translate-middle-y pe-3 bg-transparent border-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} style={{ color: 'var(--gray-500)' }} />
                      ) : (
                        <Eye size={18} style={{ color: 'var(--gray-500)' }} />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Remember Me & Forgot Password */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="d-flex justify-content-between align-items-center mb-4"
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label text-white opacity-75" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-white opacity-75 text-decoration-none small"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                {/* Error Alert */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="alert alert-danger d-flex align-items-center mb-4"
                  >
                    <AlertCircle size={18} className="me-2" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Login Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="d-grid mb-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="btn btn-light btn-lg fw-semibold"
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <LogIn size={18} className="me-2" />
                        Sign In
                      </div>
                    )}
                  </motion.button>
                </motion.div>

                {/* Divider */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="position-relative mb-4"
                >
                  <hr style={{ borderColor: 'rgba(255, 255, 255, 0.25)' }} />
                  <span 
                    className="position-absolute top-50 start-50 translate-middle px-3 text-white opacity-75 small"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    New to Check It?
                  </span>
                </motion.div>

                {/* Register Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="d-grid"
                >
                  <Link
                    to="/register"
                    className="btn btn-outline-light btn-lg fw-semibold text-decoration-none d-flex align-items-center justify-content-center"
                  >
                    <UserPlus size={18} className="me-2" />
                    Create New Account
                  </Link>
                </motion.div>
              </form>
            </motion.div>

            {/* Features */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="row g-3 mt-4"
            >
              <div className="col-4">
                <div className="text-center text-white opacity-75">
                  <div className="d-inline-block mb-2" style={{ width: '24px', height: '24px' }}>
                    <img 
                      src="/logo1.png" 
                      alt="Check It Logo" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        filter: 'brightness(0) invert(1)' // Makes logo white
                      }}
                    />
                  </div>
                  <small className="d-block">Secure</small>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center text-white opacity-75">
                  <CheckCircle size={24} className="mb-2" />
                  <small className="d-block">Verified</small>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center text-white opacity-75">
                  <Lock size={24} className="mb-2" />
                  <small className="d-block">Protected</small>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* OTP Verification Modal */}
      <OTPVerification
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false)
          setOtpData(null)
          setOtpError('')
        }}
        onVerify={handleOTPVerify}
        onResendOTP={handleResendOTP}
        userEmail={otpData?.userEmail}
        deviceInfo={{
          browser: 'Chrome', // You can enhance this with actual device detection
          os: 'Windows',
          device: 'Desktop'
        }}
        loading={otpLoading}
        error={otpError}
      />
    </div>
  )
}