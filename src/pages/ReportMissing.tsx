import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { useNavigate } from 'react-router-dom'

interface Device {
  id: string
  brand: string
  model: string
  color?: string
  imei?: string
  serial?: string
  status: string
}

export default function ReportMissing() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [reportType, setReportType] = useState<'stolen' | 'lost' | 'misplaced'>('stolen')
  const [reportData, setReportData] = useState({
    occurred_at: '',
    location: '',
    description: '',
    police_report_number: '',
    evidence_url: '',
    circumstances: '',
    witness_info: '',
    recovery_instructions: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toasts, removeToast, showSuccess, showError } = useToast()

  // Unified API base
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api')

  useEffect(() => {
    loadDevices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const res = await fetch(`${API_URL}/user-portal/devices?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to load your devices')
      const json = await res.json()
      const devicesData: Device[] = json?.data?.devices || []
      // Show verified or unverified devices only
      const availableDevices = devicesData.filter((device: Device) => 
        device.status === 'verified' || device.status === 'unverified'
      )
      setDevices(availableDevices || [])
    } catch (err) {
      console.error('Error loading devices:', err)
      const msg = err instanceof Error ? err.message : 'Failed to load your devices'
      showError('Loading Error', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDevice) {
      showError('Validation Error', 'Please select a device to report')
      return
    }

    if (!reportData.occurred_at || !reportData.location || !reportData.description) {
      showError('Validation Error', 'Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No authentication token found')

      const normalizedType = reportType === 'misplaced' ? 'lost' : reportType

      const reportPayload = {
        device_id: selectedDevice,
        report_type: normalizedType,
        occurred_at: new Date(reportData.occurred_at).toISOString(),
        location: reportData.location,
        description: reportData.description,
        police_report_number: reportData.police_report_number || null,
        evidence_url: reportData.evidence_url || null,
        circumstances: reportData.circumstances || null,
        witness_info: reportData.witness_info || null,
        recovery_instructions: reportData.recovery_instructions || null
      }

      const res = await fetch(`${API_URL}/report-management`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(reportPayload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to file report')
      }
      const caseId = data?.case_id || data?.data?.case_id || 'N/A'
      
      showSuccess(
        'Report Filed Successfully!', 
        `Your ${normalizedType} report has been filed. Case ID: ${caseId}`
      )
      
      // Reset form
      setSelectedDevice('')
      setReportData({
        occurred_at: '',
        location: '',
        description: '',
        police_report_number: '',
        evidence_url: '',
        circumstances: '',
        witness_info: '',
        recovery_instructions: ''
      })
      
      // Redirect to reports page after 3 seconds
      setTimeout(() => {
        navigate('/reports')
      }, 3000)

    } catch (err) {
      console.error('Error filing report:', err)
      showError('Report Failed', err instanceof Error ? err.message : 'Failed to file report')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading your devices...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
              <div className="mb-3 mb-sm-0">
                <h1 className="display-6 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Report Missing Device
                </h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Report your device as stolen, lost, or misplaced to help with recovery
                </p>
              </div>
            </div>
          </div>
        </div>

        {devices.length === 0 ? (
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="modern-card text-center p-5">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: 'rgba(14, 165, 233, 0.1)' 
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>📱</span>
                </div>
                <h2 className="h4 mb-3" style={{ color: 'var(--text-primary)' }}>No Devices Available</h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  You need to register and verify devices before you can report them as missing.
                </p>
                <a href="/register-device" className="btn-gradient-primary">
                  Register Your First Device
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <form onSubmit={handleSubmit}>
                <div className="modern-card p-4 mb-4">
                  <h2 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>Device Selection</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="device-select" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Select Device *
                    </label>
                    <select
                      id="device-select"
                      className="modern-input"
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                      required
                    >
                      <option value="">Choose the missing device...</option>
                      {devices.map(device => (
                        <option key={device.id} value={device.id}>
                          {device.brand} {device.model} - {device.imei || device.serial} ({device.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-0">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Report Type *
                    </label>
                    <div className="d-flex flex-column flex-sm-row gap-3 mt-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          value="stolen"
                          id="stolen"
                          checked={reportType === 'stolen'}
                          onChange={(e) => setReportType(e.target.value as 'stolen')}
                        />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor="stolen">
                          🚨 Stolen (taken by someone else)
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          value="lost"
                          id="lost"
                          checked={reportType === 'lost'}
                          onChange={(e) => setReportType(e.target.value as 'lost')}
                        />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor="lost">
                          ❓ Lost
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          value="misplaced"
                          id="misplaced"
                          checked={reportType === 'misplaced'}
                          onChange={(e) => setReportType(e.target.value as 'misplaced')}
                        />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor="misplaced">
                          🔎 Misplaced (temporarily missing)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modern-card p-4 mb-4">
                  <h2 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>Incident Details</h2>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label htmlFor="occurred-at" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        When did this happen? *
                      </label>
                      <input
                        id="occurred-at"
                        type="datetime-local"
                        className="modern-input"
                        value={reportData.occurred_at}
                        onChange={(e) => setReportData(prev => ({ ...prev, occurred_at: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="location" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Where did this happen? *
                      </label>
                      <input
                        id="location"
                        type="text"
                        className="modern-input"
                        placeholder="e.g., Lagos Island, Victoria Island, Abuja CBD"
                        value={reportData.location}
                        onChange={(e) => setReportData(prev => ({ ...prev, location: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Description of Incident *
                    </label>
                    <textarea
                      id="description"
                      className="modern-input"
                      placeholder="Describe what happened in detail..."
                      value={reportData.description}
                      onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="mb-0">
                    <label htmlFor="circumstances" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Circumstances
                    </label>
                    <textarea
                      id="circumstances"
                      className="modern-input"
                      placeholder="Additional details about the circumstances..."
                      value={reportData.circumstances}
                      onChange={(e) => setReportData(prev => ({ ...prev, circumstances: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="modern-card p-4 mb-4">
                  <h2 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>Additional Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="police-report" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Police Report Number
                    </label>
                    <input
                      id="police-report"
                      type="text"
                      className="modern-input"
                      placeholder="If you've filed a police report, enter the number here"
                      value={reportData.police_report_number}
                      onChange={(e) => setReportData(prev => ({ ...prev, police_report_number: e.target.value }))}
                    />
                    <small className="form-text" style={{ color: 'var(--text-secondary)' }}>
                      Recommended for theft cases
                    </small>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="witness-info" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Witness Information
                    </label>
                    <textarea
                      id="witness-info"
                      className="modern-input"
                      placeholder="Names and contact details of any witnesses..."
                      value={reportData.witness_info}
                      onChange={(e) => setReportData(prev => ({ ...prev, witness_info: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="evidence-url" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Evidence URL
                    </label>
                    <input
                      id="evidence-url"
                      type="url"
                      className="modern-input"
                      placeholder="Link to photos, videos, or documents"
                      value={reportData.evidence_url}
                      onChange={(e) => setReportData(prev => ({ ...prev, evidence_url: e.target.value }))}
                    />
                  </div>

                  <div className="mb-0">
                    <label htmlFor="recovery-instructions" className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                      Recovery Instructions
                    </label>
                    <textarea
                      id="recovery-instructions"
                      className="modern-input"
                      placeholder="Instructions for anyone who finds this device..."
                      value={reportData.recovery_instructions}
                      onChange={(e) => setReportData(prev => ({ ...prev, recovery_instructions: e.target.value }))}
                      rows={3}
                    />
                    <small className="form-text" style={{ color: 'var(--text-secondary)' }}>
                      This will be shown to people who check this device
                    </small>
                  </div>
                </div>

                <div className="modern-card p-4 mb-4">
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-end">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="btn btn-outline-secondary"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-gradient-primary d-flex align-items-center gap-2"
                      disabled={submitting || !selectedDevice}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Filing Report...
                        </>
                      ) : (
                        <>
                          🚨 File {reportType === 'theft' ? 'Theft' : 'Loss'} Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <div className="alert alert-info d-flex align-items-start gap-3">
                <div className="flex-shrink-0">
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                </div>
                <div>
                  <strong>Important:</strong> Filing a false report is illegal. Only report devices that are genuinely stolen or lost.
                  For theft cases, we recommend filing a police report first.
                </div>
              </div>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}