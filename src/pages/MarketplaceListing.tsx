import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
    // Mock data for demonstration
    const mockListing: Listing = {
      id: id || 'l1',
      title: 'iPhone 13 128GB',
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128GB',
      color: 'Midnight',
      condition: 'used',
      price: 750000,
      currency: '₦',
      location: 'Lagos, Nigeria',
      verified: true,
      description: 'Excellent condition iPhone 13 with original accessories. Battery health at 95%. No scratches or dents. Comes with original box, charger, and unused EarPods. Perfect for anyone looking for a premium smartphone experience.',
      images: [
        'https://images.unsplash.com/photo-1616348436168-23e257d9cbfd?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1605236453806-b25e5d5cce04?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=800&auto=format&fit=crop'
      ],
      category: 'Smartphones',
      seller: {
        name: 'TechStore Lagos',
        rating: 4.9,
        verified: true,
        joinDate: '2022-03-15',
        totalSales: 156
      },
      specifications: {
        'Display': '6.1-inch Super Retina XDR',
        'Processor': 'A15 Bionic chip',
        'Storage': '128GB',
        'Camera': '12MP Dual-camera system',
        'Battery': '95% health',
        'OS': 'iOS 17',
        'Warranty': '6 months seller warranty'
      },
      rating: 4.8,
      reviewCount: 24,
      reviews: [
        {
          id: 'r1',
          userId: 'u1',
          userName: 'John Doe',
          rating: 5,
          comment: 'Excellent phone! Exactly as described. Fast shipping and great communication from seller.',
          date: '2024-01-15',
          verified: true
        },
        {
          id: 'r2',
          userId: 'u2',
          userName: 'Sarah Johnson',
          rating: 4,
          comment: 'Good condition phone. Battery life is great. Minor wear but nothing major.',
          date: '2024-01-10',
          verified: true
        },
        {
          id: 'r3',
          userId: 'u3',
          userName: 'Mike Chen',
          rating: 5,
          comment: 'Perfect transaction. Phone works flawlessly. Highly recommend this seller!',
          date: '2024-01-08',
          verified: false
        }
      ],
      inStock: true,
      quantity: 1
    }
    
    setListing(mockListing)
    setLoading(false)
  }, [id])

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