import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Smartphone, MapPin, FileText, Send, Loader2, CheckCircle, ArrowLeft, Info } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useToast, ToastContainer } from '../components/Toast'
import { useNavigate } from 'react-router-dom'

type IncidentType = 'stolen' | 'lost' | 'misplaced' | 'fraud' | 'other'

const INCIDENT_TYPES: { value: IncidentType; label: string; description: string }[] = [
  { value: 'stolen', label: 'Stolen', description: 'Device was taken without your consent' },
  { value: 'lost', label: 'Lost', description: 'Device is missing and you cannot locate it' },
  { value: 'misplaced', label: 'Misplaced', description: 'You temporarily cannot find your device' },
  { value: 'fraud', label: 'Fraud', description: 'Suspicious activity or unauthorized use' },
  { value: 'other', label: 'Other', description: 'Another type of incident' },
]

export default function ReportDeviceIncident() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toasts, removeToast, showSuccess, showError } = useToast()
  const [step, setStep] = useState<'type' | 'details' | 'submit'>('type')
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null)
  const [form, setForm] = useState({ deviceModel: '', imei: '', serial: '', location: '', description: '', policeReport: '', contactEmail: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, type: incidentType, userId: user?.id }),
      })
      if (!res.ok) throw new Error('Failed to submit report')
      setStep('submit')
      showSuccess('Incident report submitted')
    } catch (err: any) { showError(err.message) }
    finally { setSubmitting(false) }
  }

  const resetForm = () => {
    setIncidentType(null); setForm({ deviceModel: '', imei: '', serial: '', location: '', description: '', policeReport: '', contactEmail: '' }); setStep('type')
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <div className="page-header">
              <div className="d-flex align-items-center gap-3">
                <button className="btn-ghost d-inline-flex align-items-center gap-2" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--danger-500), var(--danger-700))' }}>
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h1>Report an Incident</h1>
                  <p>Report a stolen, lost, or compromised device</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            {step === 'submit' ? (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="modern-card p-5 text-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4" style={{ width: 80, height: 80, background: 'var(--success-50)' }}>
                    <CheckCircle size={48} style={{ color: 'var(--success-500)' }} />
                  </div>
                  <h3>Report Submitted</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Your incident report has been filed. We'll investigate and update you.</p>
                  <div className="d-flex gap-3 justify-content-center mt-4">
                    <button className="btn-gradient-primary" onClick={resetForm}>Report Another</button>
                    <button className="btn-outline-primary" onClick={() => navigate('/reports')}>View Reports</button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 'type' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="modern-card p-4 p-md-5">
                      <h4 className="mb-4">What type of incident?</h4>
                      <div className="row g-3">
                        {INCIDENT_TYPES.map(it => (
                          <div className="col-12 col-md-6" key={it.value}>
                            <button type="button" onClick={() => { setIncidentType(it.value); setStep('details') }}
                              className={`w-100 text-start p-4 rounded-3 border ${incidentType === it.value ? 'border-primary' : ''}`}
                              style={{ background: incidentType === it.value ? 'var(--primary-50)' : 'var(--gray-50)', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <p className="fw-semibold mb-1">{it.label}</p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>{it.description}</p>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'details' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="modern-card p-4 p-md-5 mb-4">
                      <h5 className="mb-4 d-flex align-items-center gap-2"><Smartphone size={20} style={{ color: 'var(--primary-600)' }} /> Device Details</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Device Model *</label>
                          <input className="modern-input" placeholder="e.g. iPhone 14 Pro Max" value={form.deviceModel} onChange={e => setForm(p => ({ ...p, deviceModel: e.target.value }))} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">IMEI</label>
                          <input className="modern-input" placeholder="15-digit IMEI" value={form.imei} onChange={e => setForm(p => ({ ...p, imei: e.target.value.replace(/\D/g, '').slice(0, 15) }))} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Serial Number</label>
                          <input className="modern-input" placeholder="Serial number" value={form.serial} onChange={e => setForm(p => ({ ...p, serial: e.target.value }))} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Police Report #</label>
                          <input className="modern-input" placeholder="If available" value={form.policeReport} onChange={e => setForm(p => ({ ...p, policeReport: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    <div className="modern-card p-4 p-md-5 mb-4">
                      <h5 className="mb-4 d-flex align-items-center gap-2"><MapPin size={20} style={{ color: 'var(--danger-500)' }} /> Incident Details</h5>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Location *</label>
                          <textarea className="modern-textarea" rows={2} placeholder="Where did this happen?" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Description *</label>
                          <textarea className="modern-textarea" rows={4} placeholder="Provide a detailed description of what happened" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Contact Email</label>
                          <input type="email" className="modern-input" placeholder="For updates" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    <div className="modern-card p-4">
                      <div className="d-flex align-items-start gap-3 mb-4 p-3 rounded-3" style={{ backgroundColor: 'var(--warning-50)' }}>
                        <Info size={18} style={{ color: 'var(--warning-600)' }} className="flex-shrink-0 mt-0.5" />
                        <p style={{ fontSize: 13, color: 'var(--warning-700)', margin: 0 }}>
                          Filing a false report may result in account suspension. Provide accurate information to help recover your device.
                        </p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <button type="button" className="btn-ghost" onClick={() => setStep('type')}>Back</button>
                        <button type="submit" className="btn-gradient-danger d-flex align-items-center gap-2" disabled={submitting}>
                          {submitting ? <Loader2 size={18} className="spinner-border" /> : <Send size={18} />}
                          {submitting ? 'Submitting...' : `Submit ${incidentType?.charAt(0).toUpperCase()}${incidentType?.slice(1)} Report`}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            )}
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}
