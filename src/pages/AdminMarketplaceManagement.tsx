import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabase'
import { Search, Filter, AlertTriangle, CheckCircle, Ban, Star, StarOff, Flag } from 'lucide-react'
import { useToast, ToastContainer } from '../components/Toast'

export default function AdminMarketplaceManagement() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { toasts, removeToast, showSuccess, showError } = useToast()

  useEffect(() => {
    fetchListings()
  }, [statusFilter, search])

  const fetchListings = async () => {
    try {
      setLoading(true)
      // @ts-ignore
      const data = await supabase.marketplace.adminGetAll({ 
        status: statusFilter,
        search: search || undefined
      })
      if (Array.isArray(data)) {
        setListings(data)
      }
    } catch (err) {
      console.error(err)
      showError('Error', 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
      try {
          if (!window.confirm(`Are you sure you want to mark this listing as ${newStatus}?`)) return
          // @ts-ignore
          await supabase.marketplace.adminUpdateStatus(id, newStatus)
          showSuccess(`Listing marked as ${newStatus}`)
          fetchListings()
      } catch (err: any) {
          showError('Failed', err.message)
      }
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
      try {
          // @ts-ignore
          await supabase.marketplace.adminToggleFeatured(id, !current)
          showSuccess(`Listing ${!current ? 'featured' : 'unfeatured'}`)
          fetchListings()
      } catch (err: any) {
          showError('Failed', err.message)
      }
  }

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'active': return <span className="badge bg-success">Active</span>
          case 'sold': return <span className="badge bg-secondary">Sold</span>
          case 'deleted': return <span className="badge bg-danger">Deleted</span>
          case 'blocked': return <span className="badge bg-dark">Blocked</span>
          default: return <span className="badge bg-light text-dark">{status}</span>
      }
  }

  return (
    <Layout requireAuth allowedRoles={['admin', 'super_admin']}>
      <div className="container-fluid py-4">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="h4 m-0">Marketplace Administration</h1>
          <div className="d-flex gap-3">
             <div className="position-relative">
                <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="text" 
                  className="form-control ps-5" 
                  placeholder="Search listings..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <select 
               className="form-select" 
               value={statusFilter} 
               onChange={e => setStatusFilter(e.target.value)}
               style={{ width: 150 }}
             >
               <option value="all">All Status</option>
               <option value="active">Active</option>
               <option value="sold">Sold</option>
               <option value="blocked">Blocked</option>
               <option value="deleted">Deleted</option>
             </select>
          </div>
        </div>

        <div className="modern-card p-0">
          <div className="table-responsive">
            <table className="table align-middle m-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Item</th>
                  <th>Price</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Date</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan={7} className="text-center py-5">Loading...</td></tr>
                ) : listings.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-5 text-secondary">No listings found</td></tr>
                ) : (
                    listings.map(l => (
                        <tr key={l.id}>
                            <td className="ps-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img 
                                      src={Array.isArray(l.images) && l.images[0] ? l.images[0] : 'https://via.placeholder.com/40'} 
                                      className="rounded" 
                                      style={{ width: 40, height: 40, objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div className="fw-medium">{l.title}</div>
                                        <div className="text-secondary small">{l.brand} {l.model}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{l.currency} {l.price.toLocaleString()}</td>
                            <td>
                                <div>{l.seller.name}</div>
                                <div className="text-secondary small">{l.seller.email}</div>
                            </td>
                            <td>{getStatusBadge(l.status)}</td>
                            <td>
                                <button 
                                  className={`btn btn-sm btn-link text-decoration-none ${l.featured ? 'text-warning' : 'text-secondary'}`}
                                  onClick={() => handleToggleFeatured(l.id, l.featured)}
                                  title={l.featured ? 'Unfeature' : 'Feature'}
                                >
                                    {l.featured ? <Star fill="currentColor" size={18} /> : <StarOff size={18} />}
                                </button>
                            </td>
                            <td className="text-secondary small">
                                {new Date(l.created_at).toLocaleDateString()}
                            </td>
                            <td className="text-end pe-4">
                                {l.status !== 'blocked' && (
                                    <button 
                                      className="btn btn-sm btn-outline-danger me-2"
                                      onClick={() => handleStatusUpdate(l.id, 'blocked')}
                                      title="Block Listing"
                                    >
                                        <Ban size={16} /> Block
                                    </button>
                                )}
                                {l.status === 'blocked' && (
                                    <button 
                                      className="btn btn-sm btn-outline-success me-2"
                                      onClick={() => handleStatusUpdate(l.id, 'active')}
                                      title="Unblock"
                                    >
                                        <CheckCircle size={16} /> Unblock
                                    </button>
                                )}
                                
                                {l.status !== 'deleted' && (
                                    <button 
                                      className="btn btn-sm btn-light text-danger"
                                      onClick={() => handleStatusUpdate(l.id, 'deleted')}
                                      title="Delete"
                                    >
                                        Remove
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
