import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  BadgeCheck, 
  MapPin, 
  MessageSquare, 
  Star, 
  ShoppingCart, 
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Shield
} from 'lucide-react'

type Review = {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

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
  description: string
  images: string[]
  category: string
  seller: {
    name: string
    rating: number
    verified: boolean
    joinDate: string
    totalSales: number
  }
  specifications: Record<string, string>
  rating: number
  reviewCount: number
  reviews: Review[]
  inStock: boolean
  quantity?: number
}

export default function MarketplaceListing() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toasts, removeToast, showSuccess, showError } = useToast()
  
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [cartQuantity, setCartQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    if (!id) return
    try {
        setLoading(true)
        // @ts-ignore
        const data = await supabase.marketplace.get(id)
        if (data) {
            // Map backend data to frontend model
            // Backend returns: { id, title, price, currency, device_condition, location, description, images, brand, model, seller_name, seller_verified, status }
             const mapped: Listing = {
                id: data.id,
                title: data.title,
                brand: data.brand,
                model: data.model,
                storage: data.storage_capacity,
                color: data.color,
                condition: data.device_condition,
                price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
                currency: data.currency === 'NGN' ? '₦' : data.currency,
                location: data.location,
                verified: data.seller_verified === 'verified',
                description: data.description,
                images: (typeof data.images === 'string' ? JSON.parse(data.images) : data.images) || [],
                category: 'Electronics',
                seller: {
                    name: data.seller_name || 'Unknown',
                    rating: 5.0, // Mocked rating
                    verified: data.seller_verified === 'verified',
                    joinDate: new Date().toISOString(), // Mocked join date
                    totalSales: 0 // Mocked stats
                },
                specifications: {
                    'Brand': data.brand,
                    'Model': data.model,
                    'Condition': data.device_condition,
                    'Storage': data.storage_capacity || 'N/A',
                    'Color': data.color || 'N/A'
                },
                rating: 0,
                reviewCount: 0,
                reviews: [],
                inStock: data.status === 'active',
                quantity: 1
            }
            // Ensure at least one image url
            if (mapped.images.length === 0) {
                mapped.images = ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop']
            }
            setListing(mapped)
        }
    } catch (err) {
        console.error('Failed to fetch listing', err)
        showError('Error', 'Failed to load listing details')
    } finally {
        setLoading(false)
    }
  }

  const handleAddToCart = () => {
    showSuccess(`Added ${cartQuantity} item(s) to cart`)
  }

  const handleBuyNow = () => {
    navigate('/checkout', { state: { listing, quantity: cartQuantity } })
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    showSuccess(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    showSuccess('Link copied to clipboard')
  }

  const nextImage = () => {
    if (listing) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  const formatCurrency = (amount: number, currency = '₦') => {
    return `${currency}${amount.toLocaleString()}`
  }

  const renderStars = (rating: number, size = 16) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < Math.floor(rating) ? '#ffc107' : 'none'}
        color={i < Math.floor(rating) ? '#ffc107' : '#dee2e6'}
      />
    ))
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--primary-600)' }} />
          </div>
        </div>
      </Layout>
    )
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container-fluid">
          <div className="alert alert-danger">Listing not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-fluid">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="row mb-4"
        >
          <div className="col-12 d-flex align-items-center gap-3">
            <button 
              onClick={() => navigate('/marketplace/browse')} 
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Browse
            </button>
            <div>
              <h1 className="display-6 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                {listing.title}
              </h1>
              <div className="d-flex align-items-center gap-2 mt-1">
                <div className="d-flex align-items-center gap-1">
                  {renderStars(listing.rating)}
                  <span className="text-secondary ms-1">
                    {listing.rating} ({listing.reviewCount} reviews)
                  </span>
                </div>
                {listing.verified && (
                  <span className="badge bg-success d-flex align-items-center gap-1">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row g-4">
          {/* Images Gallery */}
          <div className="col-lg-6">
            <div className="modern-card p-0 overflow-hidden">
              <div className="position-relative">
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-100"
                  style={{ height: '400px', objectFit: 'cover' }}
                />
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2"
                      style={{ opacity: 0.8 }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2"
                      style={{ opacity: 0.8 }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <div className="position-absolute bottom-0 end-0 bg-dark text-white px-2 py-1 m-2 rounded">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              {listing.images.length > 1 && (
                <div className="p-3">
                  <div className="d-flex gap-2 overflow-auto">
                    {listing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        className={`flex-shrink-0 rounded cursor-pointer ${
                          index === currentImageIndex ? 'border border-primary border-3' : ''
                        }`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="col-lg-6">
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="fw-bold text-primary mb-1">
                    {formatCurrency(listing.price, listing.currency)}
                  </h2>
                  <div className="d-flex align-items-center gap-2 text-secondary">
                    <MapPin size={16} />
                    <span>{listing.location}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={handleWishlist}
                    className={`btn ${isWishlisted ? 'btn-danger' : 'btn-outline-secondary'}`}
                  >
                    <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={handleShare} className="btn btn-outline-secondary">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-secondary">Brand</small>
                    <div className="fw-semibold">{listing.brand}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-secondary">Model</small>
                    <div className="fw-semibold">{listing.model}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-secondary">Condition</small>
                    <div className="fw-semibold text-capitalize">{listing.condition}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-secondary">Category</small>
                    <div className="fw-semibold">{listing.category}</div>
                  </div>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <label className="form-label mb-0">Quantity:</label>
                  <div className="d-flex align-items-center">
                    <button
                      onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      -
                    </button>
                    <span className="px-3 fw-semibold">{cartQuantity}</span>
                    <button
                      onClick={() => setCartQuantity(cartQuantity + 1)}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      +
                    </button>
                  </div>
                  {listing.inStock ? (
                    <span className="badge bg-success">In Stock</span>
                  ) : (
                    <span className="badge bg-danger">Out of Stock</span>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!listing.inStock}
                    className="btn btn-outline-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!listing.inStock}
                    className="btn btn-primary flex-fill"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border-top pt-3">
                <h6 className="fw-bold mb-2">Seller Information</h6>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <User size={20} className="text-secondary" />
                    <div>
                      <div className="fw-semibold">
                        {listing.seller.name}
                        {listing.seller.verified && (
                          <BadgeCheck size={14} className="ms-1 text-success" />
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        {renderStars(listing.seller.rating, 14)}
                        <small className="text-secondary ms-1">
                          {listing.seller.rating} • {listing.seller.totalSales} sales
                        </small>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/marketplace-inbox/${listing.id}`)}
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                  >
                    <MessageSquare size={16} /> Message
                  </button>
                </div>
                <div className="d-flex align-items-center gap-2 text-secondary small">
                  <Calendar size={14} />
                  <span>Joined {new Date(listing.seller.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Specifications */}
        <div className="row g-4 mt-2">
          <div className="col-lg-8">
            <div className="modern-card p-4">
              <h5 className="fw-bold mb-3">Description</h5>
              <p className="text-secondary lh-lg">{listing.description}</p>
            </div>

            <div className="modern-card p-4 mt-4">
              <h5 className="fw-bold mb-3">Specifications</h5>
              <div className="row g-3">
                {Object.entries(listing.specifications).map(([key, value]) => (
                  <div key={key} className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="text-secondary">{key}</span>
                      <span className="fw-semibold">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="col-lg-4">
            <div className="modern-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Reviews ({listing.reviewCount})</h5>
                <div className="d-flex align-items-center gap-1">
                  {renderStars(listing.rating)}
                  <span className="fw-semibold ms-1">{listing.rating}</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                        {(showAllReviews ? listing.reviews : listing.reviews.slice(0, 3)).map((review) => (
                          <div key={review.id} className="border-bottom pb-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div className="fw-semibold">{review.userName}</div>
                                {review.verified && (
                                  <Shield size={12} className="text-success" aria-label="Verified Purchase" />
                                )}
                              </div>
                              <small className="text-secondary">
                                {new Date(review.date).toLocaleDateString()}
                              </small>
                            </div>
                    <div className="d-flex align-items-center gap-1 mb-2">
                      {renderStars(review.rating, 14)}
                    </div>
                    <p className="text-secondary small mb-0">{review.comment}</p>
                  </div>
                ))}
              </div>

              {listing.reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="btn btn-outline-secondary btn-sm mt-3 w-100"
                >
                  {showAllReviews ? 'Show Less' : `Show All ${listing.reviewCount} Reviews`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}