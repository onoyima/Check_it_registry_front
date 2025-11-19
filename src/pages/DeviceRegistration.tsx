import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast } from '../components/Toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
// Category selection now uses a dropdown instead of segmented control

// Unified API base: prefer VITE_API_BASE_URL, fallback to VITE_API_URL or dev proxy '/api'
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

type CategoryOption = {
  key: string
  label: string
  description?: string
}

type FormState = {
  imei: string
  serial: string // used for direct DB column mapping
  serialNumber: string // used for category validation where serialNumber is primary
  brand: string
  model: string
  purchaseDate: string
  proof?: File | null
  deviceImage?: File | null
  notes: string
  // Category-specific fields
  imei2?: string
  networkCarrier?: string
  operatingSystem?: string
  storageCapacity?: string
  macAddress?: string
  processorType?: string
  ramSize?: string
  bluetoothMac?: string
  vin?: string
  licensePlate?: string
  year?: string
  engineNumber?: string
  registrationState?: string
  color?: string
  description?: string
}

export default function DeviceRegistration() {
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [form, setForm] = useState<FormState>({
    imei: '', serial: '', serialNumber: '', brand: '', model: '', purchaseDate: '', proof: null, deviceImage: null, notes: ''
  })
  const [category, setCategory] = useState<string>('')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [deviceImagePreview, setDeviceImagePreview] = useState<string | null>(null)
  const [imeiError, setImeiError] = useState<string | null>(null)
  const [imei2Error, setImei2Error] = useState<string | null>(null)

  const update = (patch: Partial<FormState>) => setForm(prev => ({ ...prev, ...patch }))

  // Client-side IMEI validation (matches backend Luhn check)
  const validateIMEI = (value: string): { valid: boolean; error?: string } => {
    const imei = value.replace(/\D/g, '')
    if (imei.length === 0) return { valid: true }
    if (imei.length !== 15) return { valid: false, error: 'IMEI must be exactly 15 digits' }
    const digits = imei.split('').map(Number)
    let sum = 0
    for (let i = 0; i < 14; i++) {
      let digit = digits[i]
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    const checkDigit = (10 - (sum % 10)) % 10
    if (checkDigit !== digits[14]) return { valid: false, error: 'Invalid IMEI checksum' }
    return { valid: true }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return
        const res = await fetch(`${API_URL}/device-management/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load categories')
        const json: CategoryOption[] = await res.json()
        setCategories(json)
        // Keep placeholder until user selects a category
      } catch (err) {
        console.warn('Categories load error:', err)
      }
    }
    fetchCategories()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Ensure category selected
    if (!category) {
      showError('Select a device category')
      return
    }

    // Basic validation by category
    if (!form.brand || !form.model) {
      showError('Provide brand and model')
      return
    }

    const needs = (key: string) => {
      switch (key) {
        case 'mobile_phone':
          return !!form.imei
        case 'computer':
          return !!form.serialNumber || !!form.serial
        case 'smart_watch':
          return !!form.serialNumber || !!form.imei
        case 'vehicle':
          return !!form.vin
        case 'others':
          return !!form.description
        default:
          return !!form.serialNumber || !!form.imei || !!form.vin
      }
    }

    if (!needs(category)) {
      showError('Please provide required identifier(s) for the selected category')
      return
    }

      try {
        setSubmitting(true)
        const token = localStorage.getItem('auth_token')
        if (!token) throw new Error('No authentication token found')

      // If serialNumber provided (for categories using it), mirror to serial for DB convenience
      const serialToSend = form.serial || form.serialNumber || ''

      // Minimal payload: only prioritized identifiers + brand/model
      const payload: Record<string, any> = {
        category,
        brand: form.brand,
        model: form.model,
        imei: form.imei || undefined,
        serial: serialToSend || undefined,
        serialNumber: form.serialNumber || undefined,
        vin: form.vin || undefined,
        description: form.description || undefined,
      }

      const res = await fetch(`${API_URL}/device-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errText = await res.text()
        let serverMsg: string | undefined
        try {
          const errJson = JSON.parse(errText)
          serverMsg = errJson.error || errJson.message || errJson.details || errJson.reason
        } catch {}

        // For auth-related errors, verify token before forcing logout
        if (res.status === 401 || res.status === 403) {
          try {
            const me = await fetch(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (!me.ok) {
              // Token is invalid/expired across the board; sign out
              const msg = serverMsg || 'Session expired. Please log in again.'
              logout()
              navigate('/login')
              throw new Error(msg)
            } else {
              // Token is valid, but this action was denied or unauthorized
              const msg = serverMsg || (res.status === 403
                ? 'Access denied. You do not have permission to register devices.'
                : 'Not authorized for this action. Please retry or contact support.')
              throw new Error(msg)
            }
          } catch (verifyErr) {
            // Network error while verifying token: surface original message if any
            const msg = serverMsg || (res.status === 403
              ? 'Access denied. You do not have permission to register devices.'
              : 'Session check failed. Please try logging in again.')
            throw new Error(msg)
          }
        }

        let msg = ''
        switch (res.status) {
          case 409:
            msg = serverMsg || 'You have already registered this device'
            break
          case 400:
            msg = serverMsg || 'Invalid input. Please check your details.'
            break
          case 404:
            msg = serverMsg || 'Service not found. Check API base URL.'
            break
          case 500:
            msg = serverMsg || 'Internal server error. Please try again later.'
            break
          default:
            msg = serverMsg || `Registration failed (status ${res.status})`
        }
        throw new Error(msg)
      }
      const device = await res.json()

      // Skip optional uploads to keep registration fast and minimal

      showSuccess('Device submitted', 'Check your email to verify ownership.')
      navigate('/my-devices')
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Registration failed'
      // Network/CORS errors show as TypeError in fetch in browsers
      if (err instanceof TypeError) {
        msg = `Cannot reach API at ${API_URL}. Please ensure the server is running.`
      }
      showError('Registration Failed', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout requireAuth>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">Register Device</h2>
            <p className="text-secondary m-0">Add a new device and submit for verification</p>
          </div>
          <a className="btn btn-outline-secondary" href="#/my-devices">Back to My Devices</a>
        </div>

        <form onSubmit={onSubmit} className="modern-card p-3">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Device Category</option>
                {(categories.length > 0 ? categories : [
                  { key: 'mobile_phone', label: 'Mobile Phone' },
                  { key: 'vehicle', label: 'Vehicle' },
                  { key: 'computer', label: 'Computer' },
                  { key: 'smart_watch', label: 'Smart Watch' },
                  { key: 'others', label: 'Others' },
                ]).map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">IMEI</label>
              <input
                className="modern-input"
                value={form.imei}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                onChange={(e) => {
                  const raw = e.target.value
                  const digits = raw.replace(/\D/g, '').slice(0, 15)
                  update({ imei: digits })
                  const res = validateIMEI(digits)
                  setImeiError(res.valid ? null : res.error || 'Invalid IMEI')
                }}
                placeholder="e.g., 356789012345678"
                style={imeiError ? { borderColor: '#dc3545' } : undefined}
              />
              {imeiError && (
                <small className="text-danger">{imeiError}</small>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Serial Number</label>
              <input className="modern-input" value={form.serialNumber} onChange={(e) => update({ serialNumber: e.target.value })} placeholder="e.g., SN-ABCD1234" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Brand</label>
              <input className="modern-input" value={form.brand} onChange={(e) => update({ brand: e.target.value })} placeholder="e.g., Apple, Samsung" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Model</label>
              <input className="modern-input" value={form.model} onChange={(e) => update({ model: e.target.value })} placeholder="e.g., iPhone 13" />
            </div>
            {/* Purchase Date removed to minimize required inputs */}
            {/* Category-specific inputs */}
            {/* Mobile phone extras removed to keep form minimal */}

            {/* Computer extras removed */}

            {/* Smart watch extras removed */}

            {category === 'vehicle' && (
              <div className="col-12 col-md-6">
                <label className="form-label">VIN</label>
                <input className="modern-input" value={form.vin || ''} onChange={(e) => update({ vin: e.target.value })} placeholder="17-character VIN" />
              </div>
            )}

            {category === 'others' && (
              <div className="col-12">
                <label className="form-label">Description</label>
                <input className="modern-input" value={form.description || ''} onChange={(e) => update({ description: e.target.value })} placeholder="Brief description of the item" />
              </div>
            )}

            {/* Optional uploads and notes removed to streamline registration */}
            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/my-devices')}>Cancel</button>
              <button
                type="submit"
                className="btn-gradient-primary"
                disabled={
                  submitting || (
                    category === 'mobile_phone' && !!form.imei && !!imeiError
                  )
                }
              >
                {submitting ? 'Submitting…' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}