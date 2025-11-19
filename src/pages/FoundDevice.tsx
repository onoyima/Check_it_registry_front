import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { ButtonLoading } from '../components/Loading'

export default function FoundDevice() {
  const [imei, setImei] = useState('')
  const [serial, setSerial] = useState('')
  const [checkResult, setCheckResult] = useState<any>(null)
  const [reportData, setReportData] = useState({
    location: '',
    description: '',
    finder_contact: ''
  })
  const [checking, setChecking] = useState(false)
  const [reporting, setReporting] = useState(false)
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast()

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imei.trim() && !serial.trim()) {
      showError('Validation Error', 'Please enter either IMEI or serial number')
      return
    }

    try {
      setChecking(true)
      setCheckResult(null)
      
      const params = imei.trim() ? { imei: imei.trim() } : { serial: serial.trim() }
      const result = await supabase.foundDevice.check(params)
      
      setCheckResult(result)
      
      if (result.status === 'stolen' || result.status === 'lost') {
        showInfo('Device Found!', 'This device has been reported missing. You can help reunite it with the owner.')
      } else {
        showInfo('Device Check', 'You can report finding this device to help if the owner is looking for it.')
      }
    } catch (err) {
      console.error('Error checking device:', err)
      showError('Check Failed', err instanceof Error ? err.message : 'Failed to check device')
    } finally {
      setChecking(false)
    }
  }

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reportData.location.trim() || !reportData.finder_contact.trim()) {
      showError('Validation Error', 'Please fill in location and contact information')
      return
    }

    try {
      setReporting(true)
      
      const reportPayload = {
        imei: imei.trim() || null,
        serial: serial.trim() || null,
        location: reportData.location.trim(),
        description: reportData.description.trim(),
        finder_contact: reportData.finder_contact.trim()
      }
      
      await supabase.foundDevice.report(reportPayload)
      
      showSuccess('Report Submitted', 'Thank you for reporting the found device. The owner will be notified.')
      
      // Reset form
      setImei('')
      setSerial('')
      setCheckResult(null)
      setReportData({ location: '', description: '', finder_contact: '' })
    } catch (err) {
      console.error('Error reporting found device:', err)
      showError('Report Failed', err instanceof Error ? err.message : 'Failed to report found device')
    } finally {
      setReporting(false)
    }
  }

  return (
    <Layout>
      <div className="found-device-page">
        <div className="page-header">
          <h1>Found a Device?</h1>
          <p>Help reunite lost or stolen devices with their owners by reporting your find</p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Step 1: Check Device */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>Step 1: Check Device Status</h2>
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
              First, let's check if this device has been reported as lost or stolen.
            </p>

            <form onSubmit={handleCheck}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="imei">IMEI Number</label>
                  <input
                    id="imei"
                    type="text"
                    placeholder="e.g., 123456789012345"
                    value={imei}
                    onChange={(e) => {
                      setImei(e.target.value)
                      if (e.target.value) setSerial('')
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="serial">Serial Number</label>
                  <input
                    id="serial"
                    type="text"
                    placeholder="e.g., ABC123456789"
                    value={serial}
                    onChange={(e) => {
                      setSerial(e.target.value)
                      if (e.target.value) setImei('')
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={checking || (!imei && !serial)}
              >
                {checking ? <ButtonLoading /> : '🔍 Check Device Status'}
              </button>
            </form>
          </div> 
         {/* Check Result */}
          {checkResult && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3>Device Status Result</h3>
              
              {checkResult.status === 'stolen' && (
                <div className="alert alert-error">
                  <strong>⚠️ STOLEN DEVICE ALERT</strong>
                  <p>This device has been reported as stolen.</p>
                  {checkResult.case_id && <p><strong>Case ID:</strong> {checkResult.case_id}</p>}
                </div>
              )}

              {checkResult.status === 'lost' && (
                <div className="alert alert-warning">
                  <strong>📱 LOST DEVICE</strong>
                  <p>This device has been reported as lost.</p>
                  {checkResult.case_id && <p><strong>Case ID:</strong> {checkResult.case_id}</p>}
                </div>
              )}

              {checkResult.status === 'clean' && (
                <div className="alert alert-success">
                  <strong>✅ Clean Device</strong>
                  <p>This device has no active reports.</p>
                </div>
              )}

              {checkResult.status === 'not_found' && (
                <div className="alert alert-info">
                  <strong>📋 Device Not Registered</strong>
                  <p>This device is not in our system.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Report Found Device */}
          <div className="card">
            <h2>Step 2: Report Found Device</h2>
            <form onSubmit={handleReport}>
              <div className="form-group">
                <label htmlFor="location">Location Found *</label>
                <input
                  id="location"
                  type="text"
                  required
                  placeholder="e.g., Central Park, NYC"
                  value={reportData.location}
                  onChange={(e) => setReportData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Describe where you found it..."
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="finder-contact">Your Contact Information *</label>
                <input
                  id="finder-contact"
                  type="text"
                  required
                  placeholder="Email or phone number"
                  value={reportData.finder_contact}
                  onChange={(e) => setReportData(prev => ({ ...prev, finder_contact: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={reporting || !reportData.location || !reportData.finder_contact}
              >
                {reporting ? <ButtonLoading /> : '📝 Report Found Device'}
              </button>
            </form>
          </div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}