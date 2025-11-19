import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast } from '../components/Toast'

export default function ReportDeviceIncident() {
  const { showSuccess, showError } = useToast()
  const [form, setForm] = useState({
    type: 'lost' as 'lost' | 'stolen' | 'found',
    imei: '',
    serial: '',
    occurred_at: '',
    location: '',
    description: '',
    police_report_number: '',
    evidence_url: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const update = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const validate = () => {
    if (!form.imei && !form.serial) return 'Provide IMEI or Serial'
    if (!form.occurred_at) return 'Incident date is required'
    if (!form.location) return 'Location is required'
    if (!form.description) return 'Description is required'
    return ''
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      showError('Validation Error', err)
      return
    }
    try {
      setSubmitting(true)
      // Mock API call
      await new Promise(res => setTimeout(res, 500))
      showSuccess('Report Filed Successfully!', `Your ${form.type} report has been filed.`)
      setForm({ type: 'lost', imei: '', serial: '', occurred_at: '', location: '', description: '', police_report_number: '', evidence_url: '' })
    } catch (e) {
      showError('Submission Failed', e instanceof Error ? e.message : 'Could not submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout requireAuth>
      <div className="container py-4">
        <h2 className="fw-bold mb-3">Report Device Incident</h2>
        <form onSubmit={onSubmit} className="modern-card p-3">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Incident Type</label>
              <select className="form-select" value={form.type} onChange={e => update('type', e.target.value as any)}>
                <option value="lost">Lost</option>
                <option value="stolen">Stolen</option>
                <option value="found">Found</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">IMEI</label>
              <input className="modern-input" placeholder="Optional" value={form.imei} onChange={e => update('imei', e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Serial Number</label>
              <input className="modern-input" placeholder="Optional" value={form.serial} onChange={e => update('serial', e.target.value)} />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Occurred On</label>
              <input type="date" className="modern-input" value={form.occurred_at} onChange={e => update('occurred_at', e.target.value)} />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label">Location</label>
              <input className="modern-input" placeholder="City, area" value={form.location} onChange={e => update('location', e.target.value)} />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={4} placeholder="Describe the incident and circumstances" value={form.description} onChange={e => update('description', e.target.value)} />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Police Report Number (optional)</label>
              <input className="modern-input" value={form.police_report_number} onChange={e => update('police_report_number', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Evidence URL (optional)</label>
              <input className="modern-input" value={form.evidence_url} onChange={e => update('evidence_url', e.target.value)} />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button className="btn-gradient-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Report'}</button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}