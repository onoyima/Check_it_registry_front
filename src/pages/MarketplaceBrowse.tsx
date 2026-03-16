import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, RefreshCw, Smartphone, BadgeCheck, Star, MessageSquare, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Listing = {
  id: string
  title: string
  brand: string
  model: string
  storage?: string
  color?: string
  condition: 'new' | 'used' | 'refurbished'
  price: number
  currency: string
  location: string
  verified: boolean
  thumbnail?: string
  category?: string
  featured?: boolean
  rating?: number
  reviewCount?: number
  description?: string
  seller?: {
    name: string
    rating: number
    verified: boolean
  }
}

export default function MarketplaceBrowse() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('all')
  const [condition, setCondition] = useState<'all'|'new'|'used'|'refurbished'>('all')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const navigate = useNavigate()
  const { toasts, removeToast, showError } = useToast()

    useEffect(() => {
    const fetchListings = async () => {
        try {
            setLoading(true)
            setError(null)
            // @ts-ignore
            const data = await supabase.marketplace.list({ 
                search: search || undefined, 
                brand: brand === 'all' ? undefined : brand,
                condition: condition === 'all' ? undefined : condition,
                max_price: maxPrice || undefined
            })
            
            const mapped: Listing[] = data.map((l: any) => ({
                id: l.id,
                title: l.title,
                brand: l.brand,
                model: l.model,
                condition: l.device_condition as any,
                price: typeof l.price === 'string' ? parseFloat(l.price) : l.price,
                currency: l.currency === 'NGN' ? '₦' : l.currency,
                location: l.location,
                verified: l.seller?.verified,
                thumbnail: (l.images && l.images.length > 0) ? l.images[0] : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
                category: 'Electronics',
                description: l.description,
                seller: {
                    name: l.seller?.name || 'Unknown',
                    verified: l.seller?.verified,
                    rating: 5.0 
                },
                featured: !!l.featured,
                rating: 0,
                reviewCount: 0
            }))
            
            setListings(mapped)
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to load listings. Please check backend connection.')
        } finally {
            setLoading(false)
        }
    }
    
    // Debounce
    const t = setTimeout(fetchListings, 500)
    return () => clearTimeout(t)
  }, [search, brand, condition, maxPrice])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return listings.filter(l => (
      (brand === 'all' || l.brand.toLowerCase() === brand.toLowerCase()) &&
      (condition === 'all' || l.condition === condition) &&
      (maxPrice === '' || l.price <= (maxPrice as number)) &&
      (!q || [l.title, l.brand, l.model, l.location].some(v => v.toLowerCase().includes(q)))
    ))
  }, [listings, search, brand, condition, maxPrice])

  const featuredList = useMemo(() => filtered.filter(l => l.featured), [filtered])
  const categories = useMemo(() => {
    const map = new Map<string, Listing[]>()
    filtered.forEach(l => {
      const key = l.category || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(l)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const refresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  const formatCurrency = (n: number, c = '₦') => `${c}${n.toLocaleString()}`

  return (
    <Layout>
      <div className="container-fluid">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold" style={{ color: 'var(--text-primary)' }}>Marketplace</h1>
              <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Browse verified device listings</p>
            </div>
            <div className="d-flex gap-2">
              <button onClick={refresh} className="btn btn-outline-secondary d-flex align-items-center gap-2"><RefreshCw size={16} /> Refresh</button>
            </div>
          </div>
        </motion.div>

        <div className="modern-card p-3 mb-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Search</label>
              <div className="input-group">
                <span className="input-group-text"><Search size={16} /></span>
                <input value={search} onChange={e => setSearch(e.target.value)} className="form-control" placeholder="Brand, model, location" />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Brand</label>
              <div className="input-group">
                <span className="input-group-text"><Filter size={16} /></span>
                <select value={brand} onChange={e => setBrand(e.target.value)} className="form-select">
                  <option value="all">All</option>
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Tecno">Tecno</option>
                  <option value="Infinix">Infinix</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Condition</label>
              <div className="input-group">
                <span className="input-group-text"><Filter size={16} /></span>
                <select value={condition} onChange={e => setCondition(e.target.value as any)} className="form-select">
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Max Price</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} className="form-control" placeholder="e.g. 500000" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--primary-600)' }} />
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {/* Featured frontlist */}
              <div className="modern-card p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <Star size={18} style={{ color: 'var(--primary-600)' }} />
                    <h5 className="m-0">Featured Listings</h5>
                  </div>
                  <small className="text-secondary">Only featured appear on the front list</small>
                </div>
                {featuredList.length === 0 ? (
                  <div className="text-secondary">No featured listings yet</div>
                ) : (
                  <div className="row g-3">
                    {featuredList.map(l => (
                      <div key={l.id} className="col-12 col-md-6 col-lg-4">
                        <div className="modern-card p-0 h-100 overflow-hidden">
                          <div style={{ height: 140, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${l.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'})` }} />
                          <div className="p-3 d-flex flex-column gap-2">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-2">
                                <Smartphone size={18} style={{ color: 'var(--text-secondary)' }} />
                                <strong>{l.title}</strong>
                              </div>
                              {l.verified && <span className="badge bg-success d-flex align-items-center gap-1"><BadgeCheck size={14} /> Verified</span>}
                            </div>
                            <div className="text-secondary">{l.brand} • {l.model} • {l.storage || '—'} • {l.color || '—'}</div>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="fw-bold">{formatCurrency(l.price, l.currency)}</div>
                              <small className="text-secondary">{l.location}</small>
                            </div>
                            <div className="d-flex gap-2 mt-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/marketplace/listing/${l.id}`)}>View</button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/marketplace-inbox/${l.id}`)}>Message Seller</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories grouping */}
              <div className="modern-card p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <Filter size={18} style={{ color: 'var(--primary-600)' }} />
                    <h5 className="m-0">Browse by Category</h5>
                  </div>
                  <small className="text-secondary">Categories managed by Admin</small>
                </div>
                {categories.length === 0 ? (
                  <div className="text-secondary">No listings match your filters</div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {categories.map(([cat, items]) => (
                      <div key={cat}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <strong>{cat}</strong>
                          <small className="text-secondary">{items.length} item(s)</small>
                        </div>
                        <div className="row g-3">
                          {items.map(l => (
                            <div key={l.id} className="col-12 col-md-6 col-lg-4">
                              <div className="modern-card p-0 h-100 overflow-hidden position-relative">
                                {l.featured && (
                                  <div className="position-absolute top-0 start-0 z-1">
                                    <span className="badge bg-warning text-dark m-2">Featured</span>
                                  </div>
                                )}
                                <div 
                                  style={{ 
                                    height: 200, 
                                    backgroundSize: 'cover', 
                                    backgroundPosition: 'center', 
                                    backgroundImage: `url(${l.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'})`,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => navigate(`/marketplace/listing/${l.id}`)}
                                />
                                <div className="p-3 d-flex flex-column gap-2">
                                  <div className="d-flex align-items-start justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                      <Smartphone size={18} style={{ color: 'var(--text-secondary)' }} />
                                      <strong className="text-truncate">{l.title}</strong>
                                    </div>
                                    {l.verified && <span className="badge bg-success d-flex align-items-center gap-1"><BadgeCheck size={12} /> Verified</span>}
                                  </div>
                                  
                                  {l.description && (
                                    <p className="text-secondary small mb-2 text-truncate" style={{ fontSize: '0.85rem' }}>
                                      {l.description}
                                    </p>
                                  )}
                                  
                                  <div className="text-secondary small">{l.brand} • {l.model} • {l.storage || '—'} • {l.color || '—'}</div>
                                  
                                  {l.rating && (
                                    <div className="d-flex align-items-center gap-1 mb-1">
                                      <div className="d-flex align-items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            size={14} 
                                            fill={i < Math.floor(l.rating!) ? '#ffc107' : 'none'} 
                                            color={i < Math.floor(l.rating!) ? '#ffc107' : '#dee2e6'} 
                                          />
                                        ))}
                                      </div>
                                      <span className="small text-secondary">
                                        {l.rating} ({l.reviewCount} reviews)
                                      </span>
                                    </div>
                                  )}
                                  
                                  {l.seller && (
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                      <small className="text-secondary">
                                        Sold by: <span className="fw-semibold">{l.seller.name}</span>
                                        {l.seller.verified && <BadgeCheck size={12} className="ms-1" style={{ color: 'var(--success)' }} />}
                                      </small>
                                    </div>
                                  )}
                                  
                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="fw-bold fs-5 text-primary">{formatCurrency(l.price, l.currency)}</div>
                                    <small className="text-secondary d-flex align-items-center gap-1">
                                      <MapPin size={12} /> {l.location}
                                    </small>
                                  </div>
                                  
                                  <div className="d-flex gap-2 mt-auto">
                                    <button 
                                      className="btn btn-sm btn-primary flex-fill" 
                                      onClick={() => navigate(`/marketplace/listing/${l.id}`)}
                                    >
                                      View Details
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-secondary" 
                                      onClick={() => navigate(`/marketplace-inbox/${l.id}`)}
                                      title="Message Seller"
                                    >
                                      <MessageSquare size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}