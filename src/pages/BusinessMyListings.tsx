import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { useNavigate } from 'react-router-dom'
import { Pencil, PauseCircle, PlayCircle, Plus, Trash2, Smartphone, BadgeCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast, ToastContainer } from '../components/Toast'

type SellerListing = {
  id: string
  title: string
  price: number
  currency: string
  status: 'active' | 'paused' | 'sold' | 'deleted'
  verified: boolean
  updated_at: string
}

export default function BusinessMyListings() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'paused'|'sold'>('all')
  const [listings, setListings] = useState<SellerListing[]>([])
  const [loading, setLoading] = useState(true)
  const { toasts, removeToast, showSuccess, showError } = useToast()

  const user = JSON.parse(localStorage.getItem('user_data') || '{}')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
        setLoading(true)
        // @ts-ignore
        const data = await supabase.marketplace.list({ seller_id: user.id })
        // Map backend to frontend
        const mapped = data.map((l: any) => ({
            id: l.id,
            title: l.title,
            price: Number(l.price),
            currency: l.currency,
            status: l.status,
            verified: l.seller?.verified,
            updated_at: l.updated_at
        }))
        setListings(mapped)
    } catch (err: any) {
        showError('Error', 'Failed to load listings')
    } finally {
        setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
      try {
          // @ts-ignore
          await supabase.marketplace.update(id, { status: newStatus })
          showSuccess(`Listing ${newStatus === 'active' ? 'resumed' : newStatus}`)
          fetchListings()
      } catch (err: any) {
          showError('Failed', err.message)
      }
  }

  const handleDelete = async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this listing?')) return
      try {
          // @ts-ignore
          await supabase.marketplace.delete(id)
          showSuccess('Listing deleted')
          fetchListings()
      } catch (err: any) {
          showError('Failed', err.message)
      }
  }

  const filtered = listings.filter(i => {
      if (i.status === 'deleted') return false // Don't show deleted in main list
      return statusFilter === 'all' ? true : i.status === statusFilter
  })

  const currency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container py-4">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">My Listings</h2>
            <p className="text-secondary m-0">Manage marketplace listings</p>
          </div>
          <button className="btn btn-gradient-primary d-flex align-items-center gap-2" onClick={() => navigate('/marketplace/create')}><Plus size={18} /> Create Listing</button>
        </div>

        <div className="modern-card p-3 mb-3">
          <div className="d-flex gap-2 align-items-center">
            <label className="text-secondary">Status:</label>
            <select className="form-select" style={{ maxWidth: 240 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {loading ? <div className="text-center p-5">Loading...</div> : filtered.length === 0 ? <div className="text-center p-5 text-secondary">No listings found</div> : filtered.map(i => (
            <div key={i.id} className="modern-card p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <Smartphone size={20} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <strong>{i.title}</strong>
                      {i.verified && <span className="badge bg-success d-flex align-items-center gap-1"><BadgeCheck size={14} /> Verified</span>}
                    </div>
                    <small className="text-secondary">{currency(i.price, i.currency)} • <span className={`badge bg-${i.status === 'active' ? 'success' : i.status === 'paused' ? 'warning' : 'secondary'} bg-opacity-10 text-${i.status === 'active' ? 'success' : i.status === 'paused' ? 'warning' : 'secondary'}`}>{i.status}</span></small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                    {/* Add edit logic later if needed, assuming create listing flow handles updates similarly */}
                   {/* <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => navigate(`/marketplace/listing/${i.id}/edit`)}><Pencil size={14} /> Edit</button> */}
                  
                  {i.status === 'active' && (
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => handleStatusChange(i.id, 'paused')}><PauseCircle size={14} /> Pause</button>
                  )}
                  {i.status === 'paused' && (
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => handleStatusChange(i.id, 'active')}><PlayCircle size={14} /> Resume</button>
                  )}
                  <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => handleDelete(i.id)}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}