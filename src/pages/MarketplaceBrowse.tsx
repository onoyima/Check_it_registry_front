import { useEffect, useMemo, useState } from 'react'
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
    try {
      const mockListings: Listing[] = [
        {
          id: 'l1',
          title: 'iPhone 13 128GB',
          brand: 'Apple',
          model: 'iPhone 13',
          storage: '128GB',
          color: 'Midnight',
          condition: 'used',
          price: 750000,
          currency: '₦',
          location: 'Lagos',
          verified: true,
          category: 'Smartphones',
          featured: true,
          rating: 4.8,
          reviewCount: 24,
          description: 'Excellent condition iPhone 13 with original accessories. Battery health at 95%.',
          seller: {
            name: 'TechStore Lagos',
            rating: 4.9,
            verified: true
          },
          thumbnail: 'https://images.unsplash.com/photo-1616348436168-23e257d9cbfd?q=80&w=800&auto=format&fit=crop'
        },
        {
          id: 'l2',
          title: 'Samsung Galaxy S22',
          brand: 'Samsung',
          model: 'Galaxy S22',
          storage: '256GB',
          color: 'Phantom Black',
          condition: 'new',
          price: 850000,
          currency: '₦',
          location: 'Abuja',
          verified: true,
          category: 'Smartphones',
          rating: 4.6,
          reviewCount: 18,
          description: 'Brand new Samsung Galaxy S22 with warranty. Unopened box.',
          seller: {
            name: 'Mobile Hub',
            rating: 4.7,
            verified: true
          },
          thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop'
        },
        {
          id: 'l3',
          title: 'MacBook Air M2',
          brand: 'Apple',
          model: 'MacBook Air',
          storage: '512GB',
          color: 'Space Gray',
          condition: 'used',
          price: 1200000,
          currency: '₦',
          location: 'Port Harcourt',
          verified: false,
          category: 'Laptops',
          rating: 4.5,
          reviewCount: 12,
          description: 'Lightly used MacBook Air M2. Perfect for students and professionals.',
          seller: {
            name: 'GadgetWorld',
            rating: 4.3,
            verified: false
          },
          thumbnail: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop'
        },
        {
          id: 'l4',
          title: 'iPad Pro 11"',
          brand: 'Apple',
          model: 'iPad Pro',
          storage: '128GB',
          color: 'Silver',
          condition: 'refurbished',
          price: 650000,
          currency: '₦',
          location: 'Kano',
          verified: true,
          category: 'Tablets',
          featured: true,
          rating: 4.7,
          reviewCount: 31,
          description: 'Professionally refurbished iPad Pro with Apple Pencil included.',
          seller: {
            name: 'Apple Certified',
            rating: 4.8,
            verified: true
          },
          thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop'
        },
        {
          id: 'l5',
          title: 'AirPods Pro 2nd Gen',
          brand: 'Apple',
          model: 'AirPods Pro',
          condition: 'new',
          price: 280000,
          currency: '₦',
          location: 'Lagos',
          verified: true,
          category: 'Accessories',
          rating: 4.9,
          reviewCount: 67,
          description: 'Latest AirPods Pro with active noise cancellation and spatial audio.',
          seller: {
            name: 'AudioTech',
            rating: 4.9,
            verified: true
          },
          thumbnail: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=800&auto=format&fit=crop'
        }
      ]
      setListings(mockListings)
    } catch (e: any) {
      setError('Failed to load marketplace')
      showError('Failed to load marketplace listings')
    } finally {
      setLoading(false)
    }
  }, [])

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