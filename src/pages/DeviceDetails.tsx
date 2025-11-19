import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { Device } from '../types/database'
import { motion } from 'framer-motion'
import { Smartphone, Shield, AlertTriangle, Clock, Search, CheckCircle, Copy } from 'lucide-react'

interface DeviceDetail extends Device {
  verified_by_name?: string
  verified_by_email?: string
  days_registered?: number
  report_count?: number
  last_report_date?: string
}

export default function DeviceDetails() {
  const { id } = useParams()
  const [device, setDevice] = useState<DeviceDetail | null>(null)
  const [reports, setReports] = useState<any[]>([])
  const [checkHistory, setCheckHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toasts, removeToast, showError, showSuccess } = useToast()

  // Unified API base usage
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

  // Owner edit states
  const [editBrand, setEditBrand] = useState('')
  const [editModel, setEditModel] = useState('')
  const [editColor, setEditColor] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ brand?: string; model?: string; color?: string }>({})
  // Device image upload states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null)
  const [uploadSaving, setUploadSaving] = useState(false)
  // Proof preview states
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null)
  const [proofPreviewType, setProofPreviewType] = useState<'image' | 'pdf' | 'file' | null>(null)
  const [proofPreviewError, setProofPreviewError] = useState<string | null>(null)
  // Device image preview states (read-only display)
  const [deviceImagePreviewUrl, setDeviceImagePreviewUrl] = useState<string | null>(null)

  const validateFields = () => {
    const e: { brand?: string; model?: string; color?: string } = {}
    // Only validate fields the user is allowed to edit in current status
    if (canEditField('brand')) {
      if (editBrand.length > 50) e.brand = 'Brand must be 50 characters or less'
    }
    if (canEditField('model')) {
      if (editModel.length > 60) e.model = 'Model must be 60 characters or less'
    }
    if (canEditField('color')) {
      if (editColor.length > 30) e.color = 'Color must be 30 characters or less'
    }
    return e
  }

  const hasBlockingErrors = (e: { [k: string]: string | undefined }) => {
    return Object.entries(e).some(([k, v]) => {
      if (!v) return false
      return canEditField(k as 'brand' | 'model' | 'color' | 'device_image_url')
    })
  }

  useEffect(() => {
    loadDevice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadDevice = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')
      if (!id) throw new Error('Missing device ID')

      const res = await fetch(`${API_URL}/user-portal/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch device details')
      const json = await res.json()
      const detailsWrapper = json?.data
      const details: DeviceDetail | null = detailsWrapper?.device || null
      setDevice(details)
      setReports(Array.isArray(detailsWrapper?.reports) ? detailsWrapper.reports : [])
      setCheckHistory(Array.isArray(detailsWrapper?.check_history) ? detailsWrapper.check_history : [])
      if (details) {
        setEditBrand(details.brand || '')
        setEditModel(details.model || '')
        setEditColor((details as any).color || '')
        // Initialize validation state
        setErrors({})
        // Setup device image preview (public route or external URL)
        const url = details.device_image_url || ''
        if (url) {
          setDeviceImagePreviewUrl(url)
        } else {
          setDeviceImagePreviewUrl(null)
        }
        // Trigger proof preview fetch
        setupProofPreview(details.proof_url)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading device details'
      setError(msg)
      showError('Loading Error', msg)
    } finally {
      setLoading(false)
    }
  }

  // Normalize relative API URLs to absolute for the current base
  const toAbsoluteUrl = (u?: string) => {
    if (!u) return ''
    if (u.startsWith('http://') || u.startsWith('https://')) return u
    if (u.startsWith('/api')) return API_BASE ? `${API_BASE}${u}` : u
    return u
  }

  // Fetch proof blob with Authorization and prepare preview
  const setupProofPreview = async (proofUrl?: string) => {
    try {
      setProofPreviewError(null)
      setProofPreviewUrl(null)
      setProofPreviewType(null)
      const url = toAbsoluteUrl(proofUrl)
      if (!url) return
      const token = localStorage.getItem('auth_token')
      if (!token) return
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to load proof document')
      const contentType = res.headers.get('content-type') || ''
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      if (contentType.startsWith('image/')) {
        setProofPreviewType('image')
        setProofPreviewUrl(objectUrl)
      } else if (contentType === 'application/pdf') {
        setProofPreviewType('pdf')
        setProofPreviewUrl(objectUrl)
      } else {
        setProofPreviewType('file')
        setProofPreviewUrl(objectUrl)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error loading proof preview'
      setProofPreviewError(msg)
      setProofPreviewUrl(null)
      setProofPreviewType(null)
    }
  }

  // Update proof preview when device changes
  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl)
    }
  }, [proofPreviewUrl])

  const canEditField = (field: 'brand' | 'model' | 'color' | 'device_image_url') => {
    const status = device?.status || 'unverified'
    if (status === 'verified') {
      return field === 'color' || field === 'device_image_url'
    }
    // For unverified and other statuses, allow optional fields only
    return field === 'brand' || field === 'model' || field === 'color' || field === 'device_image_url'
  }

  const handleSave = async () => {
    if (!device || !id) return
    try {
      setSaving(true)
      const currentErrors = validateFields()
      setErrors(currentErrors)
      if (hasBlockingErrors(currentErrors)) {
        showError('Invalid Input', 'Please fix the highlighted fields before saving')
        return
      }
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const payload: Record<string, any> = {}
      if (canEditField('brand') && editBrand !== (device.brand || '')) payload.brand = editBrand
      if (canEditField('model') && editModel !== (device.model || '')) payload.model = editModel
      if (canEditField('color') && editColor !== ((device as any).color || '')) payload.color = editColor

      if (Object.keys(payload).length === 0) {
        showSuccess('No Changes', 'Nothing to update')
        return
      }

      const res = await fetch(`${API_URL}/user-portal/devices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        // Try JSON error first; fall back to text
        let msg = 'Failed to update device'
        try {
          const errJson = await res.json()
          msg = errJson?.error || errJson?.message || msg
        } catch {
          const txt = await res.text()
          msg = txt || msg
        }
        throw new Error(msg)
      }
      const updated = await res.json()
      const newData: DeviceDetail = updated?.data || device
      setDevice(newData)
      showSuccess('Device Updated', 'Your changes have been saved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes'
      showError('Update Error', msg)
    } finally {
      setSaving(false)
    }
  }

  // Handle local image file selection and preview
  const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedImageFile(file)
    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl)
      setSelectedImagePreviewUrl(null)
    }
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setSelectedImagePreviewUrl(objectUrl)
    }
  }

  // Upload new device image to backend (stores LONGBLOB)
  const uploadDeviceImage = async () => {
    if (!id || !selectedImageFile) return
    try {
      setUploadSaving(true)
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const allowed = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowed.includes(selectedImageFile.type)) {
        throw new Error('Only JPG/PNG/GIF images are allowed')
      }

      const form = new FormData()
      form.append('device_image', selectedImageFile)
      form.append('device_id', id)

      const res = await fetch(`${API_URL}/files/upload/device-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      })
      if (!res.ok) {
        let msg = 'Failed to upload device image'
        try {
          const errJson = await res.json()
          msg = errJson?.error || msg
        } catch {}
        throw new Error(msg)
      }
      const json = await res.json()
      const publicUrl: string | null = json?.file?.public_url || null
      if (publicUrl) {
        setDeviceImagePreviewUrl(publicUrl)
        // Also update device state reference to reflect latest image url
        setDevice(prev => prev ? { ...prev, device_image_url: publicUrl } : prev)
      }
      // Clear local selection
      if (selectedImagePreviewUrl) URL.revokeObjectURL(selectedImagePreviewUrl)
      setSelectedImagePreviewUrl(null)
      setSelectedImageFile(null)
      showSuccess('Image Updated', 'Your device image has been updated')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image'
      showError('Upload Error', msg)
    } finally {
      setUploadSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return { icon: CheckCircle, color: 'var(--success-500)' }
      case 'unverified': return { icon: Clock, color: 'var(--warning-500)' }
      case 'stolen': return { icon: AlertTriangle, color: 'var(--danger-500)' }
      case 'lost': return { icon: Search, color: 'var(--warning-500)' }
      case 'found': return { icon: Shield, color: 'var(--primary-500)' }
      default: return { icon: Smartphone, color: 'var(--gray-500)' }
    }
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <Link to="/my-devices" className="btn btn-outline-secondary mb-3">Back to My Devices</Link>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--primary-600)' }} />
            <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Loading device…</p>
          </div>
        ) : error ? (
          <div className="modern-card p-4 text-center" style={{ color: 'var(--danger-500)' }}>{error}</div>
        ) : device ? (
          <div className="row g-4">
            {/* Summary */}
            <div className="col-lg-8">
              <div className="modern-card p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 56, height: 56, backgroundColor: 'var(--bg-tertiary)' }}>
                    {(() => {
                      const { icon: Icon, color } = getStatusIcon(device.status)
                      return <Icon size={28} style={{ color }} />
                    })()}
                  </div>
                  <div>
                    <h3 className="h5 mb-1" style={{ color: 'var(--text-primary)' }}>{device.brand} {device.model}</h3>
                    <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>IMEI: {device.imei || '—'} | Serial: {device.serial || '—'}</p>
                  </div>
                  <span className={`ms-auto badge ${device.status === 'verified' ? 'status-verified' : device.status === 'unverified' ? 'status-unverified' : ['stolen','lost'].includes(device.status) ? 'status-stolen' : 'status-found'}`}>{device.status}</span>
                </div>

                {/* Device Details inspired by mobile_app/device_details_page */}
                <div className="row g-3">
                  {/* Images section */}
                  <div className="col-12">
                    <div className="modern-subcard p-3">
                      <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Images</p>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="border rounded p-2" style={{ borderColor: 'var(--border-color)' }}>
                            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Device Image</p>
                            {deviceImagePreviewUrl ? (
                              <img
                                src={toAbsoluteUrl(deviceImagePreviewUrl)}
                                alt="Device"
                                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 6 }}
                                onError={() => setDeviceImagePreviewUrl(null)}
                              />
                            ) : (
                              <small style={{ color: 'var(--text-secondary)' }}>No device image available</small>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="border rounded p-2" style={{ borderColor: 'var(--border-color)' }}>
                            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Proof of Ownership</p>
                            {proofPreviewError && (
                              <small style={{ color: 'var(--danger-500)' }}>{proofPreviewError}</small>
                            )}
                            {!proofPreviewUrl && !proofPreviewError && (
                              <small style={{ color: 'var(--text-secondary)' }}>No proof document available</small>
                            )}
                            {proofPreviewUrl && proofPreviewType === 'image' && (
                              <img
                                src={proofPreviewUrl}
                                alt="Proof of ownership"
                                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 6 }}
                                onError={() => setProofPreviewError('Failed to render proof image')}
                              />
                            )}
                            {proofPreviewUrl && proofPreviewType === 'pdf' && (
                              <object data={proofPreviewUrl} type="application/pdf" style={{ width: '100%', height: 220 }}>
                                <a href={proofPreviewUrl} download>Download proof (PDF)</a>
                              </object>
                            )}
                            {proofPreviewUrl && proofPreviewType === 'file' && (
                              <a href={proofPreviewUrl} download className="btn btn-outline-secondary btn-sm">
                                Download proof document
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="modern-subcard p-3">
                      <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>Owner</p>
                      <p className="mb-0" style={{ color: 'var(--text-primary)' }}>{/* owner is current user */}You</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="modern-subcard p-3">
                      <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>Verified By</p>
                      <p className="mb-0" style={{ color: 'var(--text-primary)' }}>{device.verified_by_name || '—'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="modern-subcard p-3">
                      <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>Registered</p>
                      <p className="mb-0" style={{ color: 'var(--text-primary)' }}>{device.days_registered ? `${device.days_registered} days ago` : device.created_at}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="modern-subcard p-3">
                      <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>Reports</p>
                      <p className="mb-0" style={{ color: 'var(--text-primary)' }}>{device.report_count || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Grid details for brand/model/ids with copy actions */}
                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <div className="modern-subcard p-3 d-grid" style={{ gridTemplateColumns: '30% 1fr' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Brand</span>
                      <span style={{ color: 'var(--text-primary)' }}>{device.brand || '—'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="modern-subcard p-3 d-grid" style={{ gridTemplateColumns: '30% 1fr' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Model</span>
                      <span style={{ color: 'var(--text-primary)' }}>{device.model || '—'}</span>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="modern-subcard p-3 d-grid align-items-center" style={{ gridTemplateColumns: '30% 1fr' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>IMEI/Serial</span>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ color: 'var(--text-primary)' }}>{device.imei || device.serial || '—'}</span>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => navigator.clipboard?.writeText(String(device.imei || device.serial || ''))}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="col-lg-4">
              <div className="modern-card p-4">
                <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>Actions</h5>
                <div className="d-grid gap-2">
                  <Link to="/report-missing" className="btn-gradient-danger d-flex align-items-center gap-2">
                    <AlertTriangle size={18} /> Report Lost/Stolen
                  </Link>
                  <Link to="/transfer" className="btn btn-outline-primary d-flex align-items-center gap-2">
                    <Shield size={18} /> Transfer Ownership
                  </Link>
                  <Link to="/device-check" className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <Search size={18} /> Check Status
                  </Link>
                </div>
              </div>

              {/* Owner Edit (optional fields only) */}
              <div className="modern-card p-4 mt-4">
                <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>Edit Device</h5>
                <p className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {device?.status === 'verified'
                    ? 'Verified devices: you can edit color and device image.'
                    : 'You can edit brand, model, color, and upload a device image. IMEI/Serial are not editable.'}
                </p>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Brand</label>
                    <input className="form-control" value={editBrand} onChange={e => setEditBrand(e.target.value)} disabled={!canEditField('brand')} />
                    {errors.brand && canEditField('brand') && (
                      <small style={{ color: 'var(--danger-500)' }}>{errors.brand}</small>
                    )}
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Model</label>
                    <input className="form-control" value={editModel} onChange={e => setEditModel(e.target.value)} disabled={!canEditField('model')} />
                    {errors.model && canEditField('model') && (
                      <small style={{ color: 'var(--danger-500)' }}>{errors.model}</small>
                    )}
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Color</label>
                    <input className="form-control" value={editColor} onChange={e => setEditColor(e.target.value)} disabled={!canEditField('color')} />
                    {errors.color && canEditField('color') && (
                      <small style={{ color: 'var(--danger-500)' }}>{errors.color}</small>
                    )}
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Device Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={onImageFileChange}
                      disabled={!canEditField('device_image_url')}
                    />
                    {selectedImagePreviewUrl && (
                      <div className="mt-2">
                        <img
                          src={selectedImagePreviewUrl}
                          alt="Selected device image preview"
                          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }}
                        />
                      </div>
                    )}
                    <button
                      className="btn btn-outline-primary mt-2"
                      onClick={uploadDeviceImage}
                      disabled={!selectedImageFile || !canEditField('device_image_url') || uploadSaving}
                    >
                      {uploadSaving ? 'Uploading…' : 'Upload New Image'}
                    </button>
                  </div>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving || hasBlockingErrors(errors)}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Status History (simple timeline) */}
              <div className="modern-card p-4 mt-4">
                <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>Status History</h5>
                <div className="ps-3" style={{ borderLeft: '2px solid var(--border-color)' }}>
                  <div className="mb-3">
                    <p className="mb-0" style={{ color: 'var(--text-primary)' }}>Device Registered</p>
                    <small style={{ color: 'var(--text-secondary)' }}>{new Date(device.created_at || Date.now()).toLocaleDateString()}</small>
                  </div>
                  {device.status === 'verified' && (
                    <div className="mb-3">
                      <p className="mb-0" style={{ color: 'var(--text-primary)' }}>Ownership Verified</p>
                      <small style={{ color: 'var(--text-secondary)' }}>By {device.verified_by_name || 'System'}</small>
                    </div>
                  )}
                  {['stolen','lost'].includes(device.status) && (
                    <div className="mb-1">
                      <p className="mb-0" style={{ color: 'var(--text-primary)' }}>Reported {device.status}</p>
                      <small style={{ color: 'var(--text-secondary)' }}>{device.last_report_date || '—'}</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Reports History */}
              <div className="modern-card p-4 mt-4">
                <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>Reports History</h5>
                {(() => {
                  if (!reports || reports.length === 0) {
                    return <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>No reports for this device.</p>
                  }
                  return (
                    <div className="d-flex flex-column gap-3">
                      {reports.map((r: any) => (
                        <div key={r.id} className="border rounded p-3" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`badge ${r.status === 'open' ? 'status-stolen' : r.status === 'resolved' ? 'status-verified' : 'status-unverified'}`}>{r.status}</span>
                            <small style={{ color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleString()}</small>
                          </div>
                          <p className="mb-1" style={{ color: 'var(--text-primary)' }}>Case #{r.case_id} — {r.report_type}</p>
                          <small style={{ color: 'var(--text-secondary)' }}>{r.description}</small>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Device Checks History */}
              <div className="modern-card p-4 mt-4">
                <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>Device Checks History</h5>
                {(() => {
                  if (!checkHistory || checkHistory.length === 0) {
                    return <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>No checks recorded for this device.</p>
                  }
                  return (
                    <div className="d-flex flex-column gap-3">
                      {checkHistory.map((c: any) => (
                        <div key={c.id} className="border rounded p-3" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge status-unverified">{c.check_result.replace('_',' ')}</span>
                            <small style={{ color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleString()}</small>
                          </div>
                          <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                            <small>IP: {c.ip_address || '—'} | MAC: {c.mac_address || '—'}</small>
                          </div>
                          {c.checker_name && (
                            <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                              <small>Checked by: {c.checker_name} ({c.checker_email || '—'})</small>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="modern-card p-4 text-center" style={{ color: 'var(--text-secondary)' }}>Device not found</div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}