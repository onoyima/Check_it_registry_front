import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { useNavigate } from 'react-router-dom'
import { Upload, Smartphone, CheckCircle } from 'lucide-react'

type DeviceOption = { id: string; label: string }

export default function CreateListing() {
  const [deviceId, setDeviceId] = useState('')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [condition, setCondition] = useState<'new'|'used'|'refurbished'>('used')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()
  const { toasts, removeToast, showSuccess, showError } = useToast()

  const devices: DeviceOption[] = [
    { id: 'dev_1', label: 'iPhone 13 128GB (IMEI ••3567)' },
    { id: 'dev_2', label: 'Samsung S22 256GB (IMEI ••8920)' },
    { id: 'dev_3', label: 'Tecno Spark 8 64GB (IMEI ••5531)' },
  ]

  const valid = deviceId && title && price !== '' && location

  const onSubmit = async () => {
    if (!valid) return showError('Please fill all required fields')
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      showSuccess('Listing created successfully')
    }, 800)
  }

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container py-4" style={{ maxWidth: 900 }}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        {!submitted ? (
          <div className="modern-card p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="fw-bold m-0">Create Listing</h2>
                <p className="text-secondary m-0">Publish a device to the marketplace</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Device</label>
                <div className="input-group">
                  <span className="input-group-text"><Smartphone size={16} /></span>
                  <select value={deviceId} onChange={e => setDeviceId(e.target.value)} className="form-select">
                    <option value="">Select a registered device</option>
                    {devices.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Title</label>
                <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., iPhone 13 128GB" />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Price (₦)</label>
                <input type="number" className="form-control" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g., 750000" />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Condition</label>
                <select className="form-select" value={condition} onChange={e => setCondition(e.target.value as any)}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Location</label>
                <input className="form-control" value={location} onChange={e => setLocation(e.target.value)} placeholder="City" />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Condition, accessories, meet-up details" />
              </div>
              <div className="col-12">
                <label className="form-label">Image</label>
                <div className="input-group">
                  <span className="input-group-text"><Upload size={16} /></span>
                  <input type="file" accept="image/*" className="form-control" onChange={e => setImage(e.target.files?.[0] || null)} />
                </div>
                {image && <small className="text-secondary">Selected: {image.name}</small>}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={() => navigate('/business')}>Cancel</button>
              <button className="btn btn-gradient-primary" disabled={!valid || submitting} onClick={onSubmit}>{submitting ? 'Publishing...' : 'Publish Listing'}</button>
            </div>
          </div>
        ) : (
          <div className="modern-card p-4 text-center">
            <div className="d-flex flex-column align-items-center gap-2">
              <CheckCircle size={28} style={{ color: 'var(--primary-600)' }} />
              <h5 className="m-0">Listing Published</h5>
              <p className="text-secondary">Your listing is now live on the marketplace.</p>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary" onClick={() => navigate('/marketplace/browse')}>View Marketplace</button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/business/my-listings')}>Go to My Listings</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}