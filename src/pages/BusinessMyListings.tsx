import { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useNavigate } from 'react-router-dom'
import { Pencil, PauseCircle, PlayCircle, Plus, Trash2, Smartphone, BadgeCheck } from 'lucide-react'

type SellerListing = {
  id: string
  title: string
  price: number
  currency: string
  status: 'active' | 'paused'
  verified: boolean
}

export default function BusinessMyListings() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'paused'>('all')

  const items = useMemo<SellerListing[]>(() => ([
    { id: 'l1', title: 'iPhone 13 128GB', price: 750000, currency: '₦', status: 'active', verified: true },
    { id: 'l2', title: 'Samsung S22 256GB', price: 680000, currency: '₦', status: 'paused', verified: false },
    { id: 'l3', title: 'Tecno Spark 8 64GB', price: 120000, currency: '₦', status: 'active', verified: true },
  ]), [])

  const filtered = items.filter(i => statusFilter === 'all' ? true : i.status === statusFilter)

  const currency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">My Listings</h2>
            <p className="text-secondary m-0">Manage marketplace listings</p>
          </div>
          <button className="btn btn-gradient-primary d-flex align-items-center gap-2" onClick={() => navigate('/marketplace/create-listing')}><Plus size={18} /> Create Listing</button>
        </div>

        <div className="modern-card p-3 mb-3">
          <div className="d-flex gap-2 align-items-center">
            <label className="text-secondary">Status:</label>
            <select className="form-select" style={{ maxWidth: 240 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {filtered.map(i => (
            <div key={i.id} className="modern-card p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <Smartphone size={20} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <strong>{i.title}</strong>
                      {i.verified && <span className="badge bg-success d-flex align-items-center gap-1"><BadgeCheck size={14} /> Verified</span>}
                    </div>
                    <small className="text-secondary">{currency(i.price, i.currency)} • {i.status}</small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => navigate(`/marketplace/listing/${i.id}`)}><Pencil size={14} /> Edit</button>
                  {i.status === 'active' ? (
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"><PauseCircle size={14} /> Pause</button>
                  ) : (
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"><PlayCircle size={14} /> Resume</button>
                  )}
                  <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}