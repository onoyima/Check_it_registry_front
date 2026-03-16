import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useToast, ToastContainer } from '../components/Toast'
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react'

export default function Checkout() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { toasts, removeToast, showSuccess, showError } = useToast()
    
    // Using explicit 'any' to bypass strict Listing type check for now since we're passing it via state
    const [listing, setListing] = useState<any>(null)
    const [methods, setMethods] = useState<any[]>([])
    const [selectedMethod, setSelectedMethod] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!state?.listing) {
            navigate('/marketplace/browse')
            return
        }
        setListing(state.listing)
        fetchPaymentMethods()
    }, [state])

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true)
            const data = await supabase.payments.getMethods()
            // Assume method object shape matches backend PaymentService response
            setMethods(Array.isArray(data) ? data : [])
            if (Array.isArray(data) && data.length > 0) setSelectedMethod(data[0].id)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handlePlaceOrder = async () => {
        if (!selectedMethod) return showError('Error', 'Please select a payment method')
        
        try {
            setSubmitting(true)
            await supabase.marketplace.purchase(listing.id, selectedMethod)
            setSuccess(true)
            showSuccess('Transaction successful!', 'Transfer complete')
        } catch (err: any) {
            showError('Payment Failed', err.message || 'Transaction could not be completed')
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <Layout requireAuth>
                <div className="container py-5 text-center">
                    <div className="d-flex justify-content-center mb-3">
                        <CheckCircle size={64} className="text-success" />
                    </div>
                    <h2 className="mb-3">Purchase Successful!</h2>
                    <p className="lead text-secondary mb-4">Device ownership has been transferred to you immediately.</p>
                    <div className="d-flex gap-3 justify-content-center">
                        <button className="btn btn-outline-primary" onClick={() => navigate('/marketplace/browse')}>Keep Browsing</button>
                        <button className="btn btn-primary" onClick={() => navigate('/my-devices')}>View My Devices</button>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!listing) return null

    // Determine the image to show
    const displayImage = (listing.images && listing.images.length > 0) ? listing.images[0] : (listing.thumbnail || 'https://via.placeholder.com/80')

    return (
        <Layout requireAuth>
            <div className="container py-4">
                <ToastContainer toasts={toasts} onRemove={removeToast} />
                <h2 className="mb-4">Checkout</h2>
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="modern-card p-4 h-100">
                             <h4 className="mb-3">Review Item</h4>
                             <div className="d-flex gap-3 border-bottom pb-3 mb-3">
                                <img src={displayImage} className="rounded" style={{width: 80, height: 80, objectFit: 'cover'}} alt="Device" />
                                <div>
                                    <h5>{listing.title}</h5>
                                    <p className="text-secondary mb-0 text-capitalize">{listing.condition} • {listing.seller?.name || 'Seller'}</p>
                                    <h5 className="text-primary mt-2">{listing.currency || '₦'}{listing.price?.toLocaleString()}</h5>
                                </div>
                             </div>

                             <h4 className="mb-3 mt-4">Payment Method</h4>
                             {loading ? <div className="spinner-border text-primary" /> : methods.length === 0 ? (
                                <div className="alert alert-warning">
                                    No payment methods found. <button className="btn btn-link p-0 align-baseline" onClick={() => navigate('/payments/add-method')}>Add Card</button>
                                </div>
                             ) : (
                                <div className="d-flex flex-column gap-2">
                                    {methods.map(m => (
                                        <div key={m.id} className={`p-3 border rounded cursor-pointer ${selectedMethod === m.id ? 'border-primary bg-light' : ''}`} onClick={() => setSelectedMethod(m.id)}>
                                            <div className="d-flex align-items-center gap-3">
                                                <input type="radio" checked={selectedMethod === m.id} readOnly className="form-check-input" />
                                                <div className="d-flex align-items-center gap-2">
                                                    <CreditCard size={20} className="text-secondary" />
                                                    <span>{m.type === 'card' ? `Card ending in ${m.last4}` : m.provider}</span>
                                                    {m.is_default && <span className="badge bg-secondary">Default</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn btn-link text-start ps-0 mt-2" onClick={() => navigate('/payments/add-method')}>+ Add another method</button>
                                </div>
                             )}
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="modern-card p-4">
                            <h4>Order Summary</h4>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>{listing.currency || '₦'}{listing.price?.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-success">
                                <span>Platform Fee</span>
                                <span>Waived</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                                <span>Total</span>
                                <span>{listing.currency || '₦'}{listing.price?.toLocaleString()}</span>
                            </div>
                            
                            <div className="alert alert-info d-flex align-items-start gap-2 mb-3">
                                <ShieldCheck size={20} className="mt-1 flex-shrink-0" />
                                <small>Protected by CheckIt Secure Transfer. Ownership is transferred instantly upon payment.</small>
                            </div>

                            <button className="btn btn-primary w-100 py-3 fw-bold" disabled={submitting || !selectedMethod} onClick={handlePlaceOrder}>
                                {submitting ? 'Processing...' : `Pay ${listing.currency || '₦'}{listing.price?.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
