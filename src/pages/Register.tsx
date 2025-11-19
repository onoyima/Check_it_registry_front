import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Building
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast, ToastContainer } from '../components/Toast'
import Navbar from '../components/Navbar'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    region: '',
    accountType: 'user'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const { toasts, removeToast, showSuccess, showError } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        region: formData.region.trim() || undefined,
      })

      if (signUpError) {
        throw signUpError
      }

      if (data?.user) {
        showSuccess('Registration Successful', 'Welcome to Check It! You can now start protecting your devices.')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      }
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(errorMessage)
      showError('Registration Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 2) return 'var(--danger-500)'
    if (strength < 4) return 'var(--warning-500)'
    return 'var(--success-500)'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak'
    if (strength < 4) return 'Medium'
    return 'Strong'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)' }}>
      <Navbar user={null} onLogout={() => {}} />

      <div className="container-fluid py-5">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
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
                  backdropFilter: 'blur(10px)'
                }}
              >
                <UserPlus size={40} className="text-white" />
              </motion.div>
              <h1 className="display-6 fw-bold text-white mb-2">Create Account</h1>
              <p className="text-white opacity-75">Join Check It to protect your devices</p>
              
              {/* Progress Steps */}
              <div className="d-flex justify-content-center gap-2 mt-4">
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: step >= stepNum ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                      color: step >= stepNum ? 'var(--primary-600)' : 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {stepNum}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Registration Form */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 p-md-5"
            >
              <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); handleNextStep(); }}>
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="text-center mb-4">
                      <h3 className="h5 text-white mb-2">Basic Information</h3>
                      <p className="text-white opacity-75 small">Tell us about yourself</p>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="name" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                        <User size={16} />
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="modern-input"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          color: 'var(--gray-900)'
                        }}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                        <Mail size={16} />
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="modern-input"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          color: 'var(--gray-900)'
                        }}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="accountType" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                        <Building size={16} />
                        Account Type
                      </label>
                      <select
                        id="accountType"
                        name="accountType"
                        className="modern-input"
                        value={formData.accountType}
                        onChange={handleInputChange}
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          color: 'var(--gray-900)'
                        }}
                      >
                        <option value="user">Personal Account</option>
                        <option value="business">Business Account</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Security */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="text-center mb-4">
                      <h3 className="h5 text-white mb-2">Security Setup</h3>
                      <p className="text-white opacity-75 small">Create a secure password</p>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                        <Lock size={16} />
                        Password
                      </label>
                      <div className="position-relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          className="modern-input"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleInputChange}
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
                      {formData.password && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-white opacity-75">Password Strength:</small>
                            <small style={{ color: getPasswordStrengthColor(getPasswordStrength(formData.password)) }}>
                              {getPasswordStrengthText(getPasswordStrength(formData.password))}
                            </small>
                          </div>
                          <div className="progress" style={{ height: '4px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${(getPasswordStrength(formData.password) / 5) * 100}%`,
                                backgroundColor: getPasswordStrengthColor(getPasswordStrength(formData.password))
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                        <Lock size={16} />
                        Confirm Password
                      </label>
                      <div className="position-relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="modern-input"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} style={{ color: 'var(--gray-500)' }} />
                          ) : (
                            <Eye size={18} style={{ color: 'var(--gray-500)' }} />
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <small className="text-danger d-block mt-1">Passwords do not match</small>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Additional Information */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="text-center mb-4">
                      <h3 className="h5 text-white mb-2">Additional Information</h3>
                      <p className="text-white opacity-75 small">Help us serve you better (optional)</p>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="phone" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                        <Phone size={16} />
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="modern-input"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          color: 'var(--gray-900)'
                        }}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="region" className="form-label text-white fw-semibold d-flex align-items-center gap-2">
                        <MapPin size={16} />
                        Region/Country
                      </label>
                      <input
                        id="region"
                        name="region"
                        type="text"
                        className="modern-input"
                        placeholder="Enter your region or country"
                        value={formData.region}
                        onChange={handleInputChange}
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          color: 'var(--gray-900)'
                        }}
                      />
                    </div>

                    <div className="alert alert-info d-flex align-items-start gap-2 mb-4">
                      <Shield size={18} className="mt-1" />
                      <div>
                        <small>
                          By creating an account, you agree to our Terms of Service and Privacy Policy. 
                          Your data is encrypted and secure.
                        </small>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error Display */}
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

                {/* Navigation Buttons */}
                <div className="d-flex gap-2">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="btn btn-outline-light flex-fill"
                    >
                      Back
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-light flex-fill fw-semibold"
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Creating Account...
                      </div>
                    ) : step === 3 ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <CheckCircle size={18} className="me-2" />
                        Create Account
                      </div>
                    ) : (
                      'Next Step'
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-white opacity-75 mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white fw-semibold text-decoration-none">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}