import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { Loading } from '../components/Loading'
import { ButtonLoading } from '../components/Loading'

interface TransferRequest {
  id: string
  device_id: string
  from_user_id: string
  to_user_email: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
  transfer_code?: string
  expires_at?: string
  device?: {
    brand: string
    model: string
    imei?: string
    serial?: string
  }
  from_user?: {
    name: string
    email: string
  }
}

export default function DeviceTransfer() {
  // Unified API base for direct calls where needed
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  const [devices, setDevices] = useState<any[]>([])
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([])
  const [sentTransfers, setSentTransfers] = useState<any[]>([])
  const [receivedTransfers, setReceivedTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'initiate' | 'requests' | 'sent' | 'received'>('initiate')
  const [selectedDevice, setSelectedDevice] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [userSuggestions, setUserSuggestions] = useState<Array<{ id: string, name: string, email: string }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  // Seller OTP verification state (for initiated transfers)
  const [verifyingTransferId, setVerifyingTransferId] = useState<string | null>(null)
  const [sellerOtpDigits, setSellerOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const sellerOtpRefs = useRef<Array<HTMLInputElement | null>>([])
  // Popup OTP state shown immediately after initiation
  const [showSellerOtpModal, setShowSellerOtpModal] = useState(false)
  const [initiatedTransferId, setInitiatedTransferId] = useState<string | null>(null)
  const [initiatedTransferCode, setInitiatedTransferCode] = useState<string>('')
  const [transferring, setTransferring] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferCode, setTransferCode] = useState('')
  const [transferAction, setTransferAction] = useState<'accept' | 'reject'>('accept')
  const [awaitingBuyerOtp, setAwaitingBuyerOtp] = useState(false)
  const [buyerOtpCode, setBuyerOtpCode] = useState('')
  const [claimTab, setClaimTab] = useState<'accept' | 'reject'>('accept')
  const [receivedFilter, setReceivedFilter] = useState<'all' | 'active' | 'awaiting_buyer_otp' | 'completed' | 'rejected' | 'cancelled'>('all')
  const [claimInlineTip, setClaimInlineTip] = useState<string>('')
  const [rejectionReason, setRejectionReason] = useState('')
  const { toasts, removeToast, showSuccess, showError } = useToast()

  // Segmented OTP-style inputs for transfer code (A–Z, 0–9)
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '', '', '', '', '', '', ''])
  const codeRefs = useRef<Array<HTMLInputElement | null>>([])
  useEffect(() => {
    setTransferCode(codeDigits.join(''))
  }, [codeDigits])

  const handleCodeDigitChange = (idx: number, value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 1)
    const next = [...codeDigits]
    next[idx] = cleaned
    setCodeDigits(next)
    if (cleaned && idx < codeRefs.current.length - 1) {
      codeRefs.current[idx + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (codeDigits[idx]) {
        const next = [...codeDigits]
        next[idx] = ''
        setCodeDigits(next)
      } else if (idx > 0) {
        codeRefs.current[idx - 1]?.focus()
        const next = [...codeDigits]
        next[idx - 1] = ''
        setCodeDigits(next)
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      codeRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < codeRefs.current.length - 1) {
      codeRefs.current[idx + 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (!text) return
    e.preventDefault()
    const next = [...codeDigits]
    for (let i = 0; i < 12; i++) {
      next[i] = text[i] ? text[i] : ''
    }
    setCodeDigits(next)
    const lastFilled = Math.min(text.length, 12) - 1
    if (lastFilled >= 0) codeRefs.current[lastFilled]?.focus()
  }

  // Segmented inputs for buyer OTP (0–9)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])
  useEffect(() => {
    setBuyerOtpCode(otpDigits.join(''))
  }, [otpDigits])

  const handleOtpDigitChange = (idx: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1)
    const next = [...otpDigits]
    next[idx] = cleaned
    setOtpDigits(next)
    if (cleaned && idx < otpRefs.current.length - 1) {
      otpRefs.current[idx + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpDigits[idx]) {
        const next = [...otpDigits]
        next[idx] = ''
        setOtpDigits(next)
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus()
        const next = [...otpDigits]
        next[idx - 1] = ''
        setOtpDigits(next)
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < otpRefs.current.length - 1) {
      otpRefs.current[idx + 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!text) return
    e.preventDefault()
    const next = [...otpDigits]
    for (let i = 0; i < 6; i++) {
      next[i] = text[i] ? text[i] : ''
    }
    setOtpDigits(next)
    const lastFilled = Math.min(text.length, 6) - 1
    if (lastFilled >= 0) otpRefs.current[lastFilled]?.focus()
  }

  // Map backend error messages to clearer inline guidance for buyers
  const mapClaimInlineTip = (msg: string): string => {
    const m = (msg || '').toLowerCase()
    if (
      m.includes('invalid transfer code or transfer not available') ||
      m.includes('not active') ||
      m.includes('transfer not found')
    ) {
      return 'This transfer isn’t active yet. Ask the seller to verify their 6‑digit OTP to activate the transfer, then retry your code.'
    }
    if (m.includes('transfer has expired')) {
      return 'This transfer code has expired. Ask the seller to initiate a new transfer and share the new code.'
    }
    if (m.includes('buyer verification code is required')) {
      return 'Check your email for the 6‑digit verification code, then enter it above to complete the transfer.'
    }
    if (m.includes('invalid buyer verification code')) {
      return 'The verification code is incorrect. Recheck the email and enter the exact 6 digits.'
    }
    if (m.includes('buyer verification code has expired')) {
      return 'The verification code expired. Click “Send Verification” again to receive a fresh code.'
    }
    if (m.includes('unauthorized to reject')) {
      return 'This transfer code is restricted to a specific buyer. Sign in with the buyer email that received the code, then retry.'
    }
    return ''
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [devicesData, sentData, receivedData] = await Promise.all([
        supabase.devices.list(),
        supabase.deviceTransfer.myTransfers({ type: 'sent' }),
        supabase.deviceTransfer.myTransfers({ type: 'received' })
      ])

      setDevices(devicesData || [])
      // Unified flow does not pre-list incoming requests; use Claim Transfer modal
      setTransferRequests([])
      setSentTransfers(sentData.transfers || [])
      setReceivedTransfers(receivedData.transfers || [])
    } catch (err) {
      console.error('Error loading transfer data:', err)
      showError('Loading Error', 'Failed to load transfer data')
    } finally {
      setLoading(false)
    }
  }

  // Email suggestions debounce
  useEffect(() => {
    const run = async () => {
      const query = recipientEmail.trim()
      if (query.length < 2) {
        setUserSuggestions([])
        setShowSuggestions(false)
        return
      }
      try {
        setSearchLoading(true)
        const res = await supabase.userPortal.searchUsers(query)
        setUserSuggestions(res.users || [])
        setShowSuggestions(true)
      } catch (err) {
        console.error('Search users error:', err)
      } finally {
        setSearchLoading(false)
      }
    }
    const t = setTimeout(run, 300)
    return () => clearTimeout(t)
  }, [recipientEmail])

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDevice || !recipientEmail.trim()) {
      showError('Validation Error', 'Please select a device and enter recipient email')
      return
    }

    try {
      setTransferring(true)
      
      const res = await supabase.deviceTransfer.initiate({
        deviceId: selectedDevice,
        buyerEmail: recipientEmail.trim()
      })

      // Show OTP modal immediately to verify initiation
      if (res) {
        setInitiatedTransferId(res.transferId || res.transfer_id || null)
        setInitiatedTransferCode(res.transferCode || res.transfer_code || '')
        setSellerOtpDigits(['', '', '', '', '', ''])
        setShowSellerOtpModal(true)
        // Focus first OTP input shortly after showing modal
        setTimeout(() => sellerOtpRefs.current[0]?.focus(), 0)
      }
      showSuccess('Transfer Initiated', 'We sent a 6-digit OTP to your email to verify initiation')
      setSelectedDevice('')
      setRecipientEmail('')
      await loadData()
    } catch (err) {
      console.error('Error initiating transfer:', err)
      showError('Transfer Failed', err instanceof Error ? err.message : 'Failed to initiate transfer')
    } finally {
      setTransferring(false)
    }
  }

  const openTransferModal = (action: 'accept' | 'reject') => {
    setTransferAction(action)
    setTransferCode('')
    setCodeDigits(['', '', '', '', '', '', '', '', '', '', '', ''])
    setAwaitingBuyerOtp(false)
    setBuyerOtpCode('')
    setOtpDigits(['', '', '', '', '', ''])
    setClaimInlineTip('')
    setShowTransferModal(true)
  }

  const handleTransferAction = async () => {
    if (!transferCode.trim() || transferCode.trim().length !== 12) {
      showError('Validation Error', 'Please enter the transfer code')
      return
    }

    try {
      setProcessingRequest(transferCode)
      
      if (transferAction === 'accept') {
        // New OTP-based flow: first trigger completion which sends OTP, then verify with OTP
        if (!awaitingBuyerOtp) {
          try {
            const result = await supabase.deviceTransfer.complete({ transferCode: transferCode.trim() })
            if (result.requiresBuyerOtp) {
              setAwaitingBuyerOtp(true)
              showSuccess('Verification Sent', result.message || 'A verification code was sent to your email')
              // In non-production, the backend may return devOtpCode to ease local testing
              if (result.devOtpCode && typeof result.devOtpCode === 'string') {
                const digits = String(result.devOtpCode).replace(/\D/g, '').slice(0, 6).split('')
                const padded = [...digits]
                while (padded.length < 6) padded.push('')
                setOtpDigits(padded)
                setBuyerOtpCode(padded.join(''))
                try {
                  const auto = await supabase.deviceTransfer.complete({ transferCode: transferCode.trim(), otpCode: padded.join('') })
                  if (auto && auto.success) {
                    showSuccess('Transfer Accepted', 'Device ownership has been transferred to you')
                    setProcessingRequest(null)
                    return
                  }
                } catch (autoErr) {
                  console.error('Auto-complete with devOtpCode failed:', autoErr)
                }
              }
              setProcessingRequest(null)
              return
            }
            if (result.success) {
              showSuccess('Transfer Accepted', 'Device ownership has been transferred to you')
            } else {
              const msg = result.error || 'Failed to accept transfer'
              // Attempt legacy fallback for not active/not found (legacy table)
              const m = msg.toLowerCase()
              if (m.includes('not active') || m.includes('not available') || m.includes('transfer not found')) {
                const legacy = await supabase.deviceTransfer.legacyAccept({ transfer_code: transferCode.trim() })
                if (legacy && legacy.success) {
                  showSuccess('Transfer Accepted', legacy.message || 'Device ownership has been transferred to you')
                } else {
                  setClaimInlineTip(mapClaimInlineTip(msg))
                  showError('Transfer Failed', (legacy && legacy.error) || msg)
                  setProcessingRequest(null)
                  return
                }
              } else {
                setClaimInlineTip(mapClaimInlineTip(msg))
                showError('Transfer Failed', msg)
                setProcessingRequest(null)
                return
              }
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to accept transfer'
            const m = msg.toLowerCase()
            if (m.includes('not active') || m.includes('not available') || m.includes('transfer not found')) {
              try {
                const legacy = await supabase.deviceTransfer.legacyAccept({ transfer_code: transferCode.trim() })
                if (legacy && legacy.success) {
                  showSuccess('Transfer Accepted', legacy.message || 'Device ownership has been transferred to you')
                } else {
                  setClaimInlineTip(mapClaimInlineTip(msg))
                  showError('Transfer Failed', (legacy && legacy.error) || msg)
                  setProcessingRequest(null)
                  return
                }
              } catch (err2) {
                const msg2 = err2 instanceof Error ? err2.message : 'Failed to accept transfer'
                setClaimInlineTip(mapClaimInlineTip(msg2))
                showError('Transfer Failed', msg2)
                setProcessingRequest(null)
                return
              }
            } else {
              setClaimInlineTip(mapClaimInlineTip(msg))
              showError('Transfer Failed', msg)
              setProcessingRequest(null)
              return
            }
          }
        } else {
          if (buyerOtpCode.length !== 6) {
            showError('Validation Error', 'Enter the 6-digit verification code sent to your email')
            setProcessingRequest(null)
            return
          }
          const result = await supabase.deviceTransfer.complete({ transferCode: transferCode.trim(), otpCode: buyerOtpCode.trim() })
          if (result.success) {
            showSuccess('Transfer Accepted', 'Device ownership has been transferred to you')
          } else {
            const msg = result.error || 'Failed to accept transfer'
            setClaimInlineTip(mapClaimInlineTip(msg))
            showError('Transfer Failed', msg)
            setProcessingRequest(null)
            return
          }
        }
      } else {
        try {
          const res = await supabase.deviceTransfer.reject({ transfer_code: transferCode.trim(), rejection_reason: rejectionReason.trim() || undefined })
          if (res && res.success) {
            showSuccess('Transfer Rejected', res.message || 'Transfer request has been rejected')
          } else {
            const msg = (res && res.error) || 'Failed to reject transfer'
            const m = msg.toLowerCase()
            if (m.includes('not active') || m.includes('transfer not found')) {
              const legacy = await supabase.deviceTransfer.legacyReject({ transfer_code: transferCode.trim(), rejection_reason: rejectionReason.trim() || undefined })
              if (legacy && legacy.success) {
                showSuccess('Transfer Rejected', legacy.message || 'Transfer request has been rejected')
              } else {
                setClaimInlineTip(mapClaimInlineTip(msg))
                showError('Transfer Failed', (legacy && legacy.error) || msg)
                setProcessingRequest(null)
                return
              }
            } else {
              setClaimInlineTip(mapClaimInlineTip(msg))
              showError('Transfer Failed', msg)
              setProcessingRequest(null)
              return
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to reject transfer'
          const m = msg.toLowerCase()
          if (m.includes('not active') || m.includes('transfer not found')) {
            try {
              const legacy = await supabase.deviceTransfer.legacyReject({ transfer_code: transferCode.trim(), rejection_reason: rejectionReason.trim() || undefined })
              if (legacy && legacy.success) {
                showSuccess('Transfer Rejected', legacy.message || 'Transfer request has been rejected')
              } else {
                setClaimInlineTip(mapClaimInlineTip(msg))
                showError('Transfer Failed', (legacy && legacy.error) || msg)
                setProcessingRequest(null)
                return
              }
            } catch (err2) {
              const msg2 = err2 instanceof Error ? err2.message : 'Failed to reject transfer'
              setClaimInlineTip(mapClaimInlineTip(msg2))
              showError('Transfer Failed', msg2)
              setProcessingRequest(null)
              return
            }
          } else {
            setClaimInlineTip(mapClaimInlineTip(msg))
            showError('Transfer Failed', msg)
            setProcessingRequest(null)
            return
          }
        }
      }
      
      setShowTransferModal(false)
      setTransferCode('')
      setBuyerOtpCode('')
      setCodeDigits(['', '', '', '', '', '', '', '', '', '', '', ''])
      setOtpDigits(['', '', '', '', '', ''])
      setAwaitingBuyerOtp(false)
      setClaimInlineTip('')
      setRejectionReason('')
      await loadData()
    } catch (err) {
      console.error('Error processing transfer:', err)
      const msg = err instanceof Error ? err.message : 'Failed to process transfer'
      setClaimInlineTip(mapClaimInlineTip(msg))
      showError('Transfer Failed', msg)
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleCancelTransfer = async (transferId: string) => {
    try {
      setProcessingRequest(transferId)
      await supabase.deviceTransfer.cancel(transferId)
      showSuccess('Transfer Cancelled', 'Transfer request has been cancelled')
      await loadData()
    } catch (err) {
      console.error('Error cancelling transfer:', err)
      showError('Cancel Failed', err instanceof Error ? err.message : 'Failed to cancel transfer')
    } finally {
      setProcessingRequest(null)
    }
  }

  // Seller OTP helpers
  const sellerOtpCode = sellerOtpDigits.join('').trim()

  const handleSellerOtpDigitChange = (idx: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1)
    const next = [...sellerOtpDigits]
    next[idx] = cleaned
    setSellerOtpDigits(next)
    if (cleaned && idx < sellerOtpRefs.current.length - 1) {
      sellerOtpRefs.current[idx + 1]?.focus()
    }
  }

  const handleSellerOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (sellerOtpDigits[idx]) {
        const next = [...sellerOtpDigits]
        next[idx] = ''
        setSellerOtpDigits(next)
      } else if (idx > 0) {
        sellerOtpRefs.current[idx - 1]?.focus()
        const next = [...sellerOtpDigits]
        next[idx - 1] = ''
        setSellerOtpDigits(next)
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      sellerOtpRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < sellerOtpRefs.current.length - 1) {
      sellerOtpRefs.current[idx + 1]?.focus()
    }
  }

  const handleSellerOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!text) return
    e.preventDefault()
    const next = [...sellerOtpDigits]
    for (let i = 0; i < 6; i++) {
      next[i] = text[i] ? text[i] : ''
    }
    setSellerOtpDigits(next)
    const lastFilled = Math.min(text.length, 6) - 1
    if (lastFilled >= 0) sellerOtpRefs.current[lastFilled]?.focus()
  }

  const handleVerifySellerOtp = async (transferId: string) => {
    if (sellerOtpCode.length !== 6) {
      showError('Validation Error', 'Enter the 6-digit verification code sent to your email')
      return
    }
    try {
      setProcessingRequest(transferId)
      const result = await supabase.deviceTransfer.verifyOtp({ transferId, otpCode: sellerOtpCode })
      if (result && result.success) {
        showSuccess('Transfer Activated', result.message || 'Transfer verified and activated')
      } else {
        showError('Verification Failed', result?.error || 'Failed to verify transfer OTP')
      }
      setVerifyingTransferId(null)
      setSellerOtpDigits(['', '', '', '', '', ''])
      // Close modal if it was open
      setShowSellerOtpModal(false)
      setInitiatedTransferId(null)
      setInitiatedTransferCode('')
      await loadData()
    } catch (err) {
      console.error('Error verifying transfer OTP:', err)
      showError('Verification Failed', err instanceof Error ? err.message : 'Failed to verify transfer OTP')
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleResendCode = async (transferId: string) => {
    try {
      setProcessingRequest(transferId)
      const res = await supabase.deviceTransfer.resendCode(transferId)
      if (res && res.success) {
        showSuccess('Code Resent', res.message || 'Transfer code resent to buyer email')
      } else {
        showError('Resend Failed', (res && res.error) || 'Failed to resend transfer code')
      }
    } catch (err) {
      console.error('Resend code error:', err)
      showError('Resend Failed', err instanceof Error ? err.message : 'Failed to resend transfer code')
    } finally {
      setProcessingRequest(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffaa44'
      case 'accepted': return '#44aa44'
      case 'rejected': return '#ff4444'
      case 'cancelled': return '#aaa'
      case 'expired': return '#ff4444'
      default: return '#aaa'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      // Legacy statuses (requests list)
      case 'pending': return 'text-bg-warning'
      case 'accepted': return 'text-bg-success'
      // Unified statuses (ownership_transfers)
      case 'initiated': return 'text-bg-primary'
      case 'awaiting_buyer_otp': return 'text-bg-info'
      case 'active': return 'text-bg-warning'
      case 'completed': return 'text-bg-success'
      case 'rejected': return 'text-bg-danger'
      case 'cancelled': return 'text-bg-secondary'
      case 'expired': return 'text-bg-dark'
      default: return 'text-bg-secondary'
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Ensure device details are populated for requests and sent transfers
  useEffect(() => {
    const enrich = async () => {
      try {
        const updatedRequests = await Promise.all(transferRequests.map(async (r) => {
          if (!r.device && r.device_id) {
            try {
              const d = await supabase.devices.get(r.device_id)
              return { ...r, device: { brand: d.brand, model: d.model, imei: d.imei, serial: d.serial } }
            } catch {
              return r
            }
          }
          return r
        }))
        setTransferRequests(updatedRequests)
      } catch {}
    }
    if (transferRequests && transferRequests.length > 0) enrich()
  }, [transferRequests])

  if (loading) {
    return (
      <Layout requireAuth>
        <Loading size="large" message="Loading device transfers..." />
      </Layout>
    )
  }

  return (
    <Layout requireAuth>
      <div className="device-transfer-page">
        <div className="page-header">
          <h1>Device Transfer</h1>
          <p>Transfer device ownership to another user or claim a transfer with a code</p>
        </div>

        {/* Quick Actions */}
        <div className="card mb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="card-body d-flex flex-wrap gap-2 align-items-center">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => setActiveTab('sent')}
              title="Manage sent transfers and cancel pending ones"
            >
              <span>Manage Sent Transfers</span>
              <span className="badge text-bg-secondary">
                {sentTransfers.filter(t => ['initiated','active','awaiting_buyer_otp'].includes(t.status)).length}
              </span>
            </button>
            <button
              className="btn btn-outline-success d-flex align-items-center gap-2"
              onClick={() => setActiveTab('requests')}
              title="Enter a transfer code to accept or reject"
            >
              <span>Claim Transfer</span>
            </button>
            <div className="ms-auto small text-muted">
              Sender can cancel any transfer that isn’t completed. Expired transfers auto-return.
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-pills mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'initiate' ? 'active' : ''}`}
              onClick={() => setActiveTab('initiate')}
            >
              Initiate Transfer
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Claim Transfer
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Received Transfers
              <span className="badge text-bg-secondary ms-2">{receivedTransfers.length}</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent Transfers
              <span className="badge text-bg-secondary ms-2">{sentTransfers.length}</span>
            </button>
          </li>
        </ul>

        {/* Initiate Transfer Tab */}
        {activeTab === 'initiate' && (
          <div className="initiate-tab">
            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <div className="card">
                  <div className="card-body">
                    <h2 className="h4 mb-3">Transfer Device Ownership</h2>
                    <p className="text-muted mb-4">
                      Transfer one of your devices to another user. They will receive an email notification to accept the transfer.
                    </p>

                    <form onSubmit={handleInitiateTransfer}>
                      <div className="mb-3">
                        <label htmlFor="device-select" className="form-label">Select Device</label>
                        <select
                          id="device-select"
                          className="form-select"
                          value={selectedDevice}
                          onChange={(e) => setSelectedDevice(e.target.value)}
                          required
                        >
                          <option value="">Choose a device...</option>
                          {devices.filter(d => d.status === 'verified').map(device => (
                            <option key={device.id} value={device.id}>
                              {device.brand} {device.model} - {device.imei || device.serial}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted d-block mt-1">
                          Only verified devices can be transferred
                        </small>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="recipient-email" className="form-label">Recipient Email</label>
                        <input
                          id="recipient-email"
                          type="email"
                          className="form-control"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="Enter the recipient's email address"
                          required
                          onFocus={() => recipientEmail.length >= 2 && setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        />
                        {showSuggestions && userSuggestions.length > 0 && (
                          <div className="list-group" style={{ position: 'absolute', zIndex: 10, width: '100%' }}>
                            {userSuggestions.map(u => (
                              <button
                                type="button"
                                key={u.id}
                                className="list-group-item list-group-item-action"
                                onMouseDown={() => {
                                  setRecipientEmail(u.email)
                                  setShowSuggestions(false)
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{u.name}</span>
                                  <span className="text-muted" style={{ fontFamily: 'monospace' }}>{u.email}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={transferring || !selectedDevice || !recipientEmail}
                      >
                        {transferring ? <ButtonLoading /> : 'Send Transfer Request'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-5">
                <div className="card">
                  <div className="card-body">
                    <h3 className="h5 mb-3">Your Devices</h3>
                    {devices.length === 0 ? (
                      <p className="text-muted">No devices registered</p>
                    ) : (
                      <ul className="list-group">
                        {devices.map(device => (
                          <li
                            key={device.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div className="fw-semibold">
                                {device.brand} {device.model}
                              </div>
                              <div className="small text-muted">
                                {device.imei || device.serial}
                              </div>
                            </div>
                            <span className={`badge ${getStatusBadgeClass(device.status)}`}>
                              {device.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claim Transfer Tab */}
        {activeTab === 'requests' && (
          <div className="requests-tab">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h4 mb-0">Claim Transfer</h2>
                </div>

                <ul className="nav nav-pills mb-3">
                  <li className="nav-item">
                    <button className={`nav-link ${claimTab === 'accept' ? 'active' : ''}`} onClick={() => { setClaimTab('accept'); setAwaitingBuyerOtp(false); setBuyerOtpCode(''); setClaimInlineTip(''); setRejectionReason(''); }}>
                      Accept
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${claimTab === 'reject' ? 'active' : ''}`} onClick={() => { setClaimTab('reject'); setAwaitingBuyerOtp(false); setBuyerOtpCode(''); setClaimInlineTip(''); setRejectionReason(''); }}>
                      Reject
                    </button>
                  </li>
                </ul>

                <div className="row g-4">
                  <div className="col-12 col-lg-7">
                    <div className="card" style={{ borderColor: 'var(--border)' }}>
                      <div className="card-body">
                        <h3 className="h5 mb-3">{claimTab === 'accept' ? 'Accept Device Transfer' : 'Reject Device Transfer'}</h3>
                        <p className="text-muted mb-3">
                          Enter the 12-character transfer code (A–Z, 0–9) provided by the sender.
                        </p>
                        <div className="form-group">
                          <label>Transfer Code</label>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {codeDigits.map((d, idx) => (
                              <input
                                key={idx}
                                ref={(el) => (codeRefs.current[idx] = el)}
                                type="text"
                                inputMode="text"
                                value={d}
                                onChange={(e) => handleCodeDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                                onPaste={idx === 0 ? handleCodePaste : undefined}
                                maxLength={1}
                                className="form-control"
                                style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace' }}
                              />
                            ))}
                          </div>
                          <small className="text-muted d-block mt-1">Code is alphanumeric (A–Z, 0–9), 12 characters</small>
                          {claimInlineTip && (
                            <div className="alert alert-info mt-2" role="alert">
                              {claimInlineTip}
                            </div>
                          )}
                        </div>

                        {claimTab === 'reject' && (
                          <div className="form-group mt-3">
                            <label>Rejection Reason (optional)</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              placeholder="Briefly explain why you’re rejecting this transfer (optional)"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <small className="text-muted d-block mt-1">Reason will be included in the notification to the sender</small>
                          </div>
                        )}

                        {claimTab === 'accept' && awaitingBuyerOtp && (
                          <div className="form-group mt-3">
                            <label>Verification Code (Email)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {otpDigits.map((d, idx) => (
                                <input
                                  key={idx}
                                  ref={(el) => (otpRefs.current[idx] = el)}
                                  type="text"
                                  inputMode="numeric"
                                  value={d}
                                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                                  maxLength={1}
                                  className="form-control"
                                  style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace' }}
                                />
                              ))}
                            </div>
                            <small className="text-muted d-block mt-1">Check your email for the 6‑digit verification code</small>
                          </div>
                        )}

                        <div className="mt-3 d-flex gap-2">
                          {claimTab === 'accept' ? (
                            <button
                              className="btn btn-success"
                              disabled={processingRequest !== null || transferCode.length !== 12 || (awaitingBuyerOtp && buyerOtpCode.length !== 6)}
                              onClick={() => { setTransferAction('accept'); handleTransferAction(); }}
                            >
                              {processingRequest ? <ButtonLoading /> : (awaitingBuyerOtp ? 'Verify & Accept' : 'Send Verification')}
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-danger"
                              disabled={processingRequest !== null || transferCode.length !== 12}
                              onClick={() => { setTransferAction('reject'); handleTransferAction(); }}
                            >
                              {processingRequest ? <ButtonLoading /> : 'Reject Transfer'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-5">
                    <div className="card" style={{ borderColor: 'var(--border)' }}>
                      <div className="card-body">
                        <h3 className="h6">How to Use Transfer Codes</h3>
                        <ol className="mb-0 ps-3 small text-muted">
                          <li>Ask the sender for the 12‑character transfer code (A–Z, 0–9).</li>
                          <li>{claimTab === 'accept' ? 'Click Send Verification, then enter the email OTP.' : 'Click Reject to decline the transfer.'}</li>
                          <li>Codes expire after 24 hours; expired transfers auto‑return to the sender.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sent Transfers Tab */}
        {activeTab === 'sent' && (
          <div className="sent-tab">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h5 mb-0">Your Sent Transfers</h3>
                  <span className="badge text-bg-secondary">{sentTransfers.length}</span>
                </div>
                {sentTransfers.length === 0 ? (
                  <p className="text-muted">You have not initiated any transfers.</p>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="d-none d-lg-block">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Device</th>
                            <th>Recipient</th>
                            <th>Status</th>
                            <th>Transfer Code</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th>Expires</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sentTransfers.map((t: any) => {
                            const expired = t.expires_at ? new Date() > new Date(t.expires_at) : false
                            const canCancel = (t.status !== 'completed' && t.status !== 'cancelled')
                            return (
                              <tr key={t.id}>
                                <td>
                                  <div className="fw-semibold">{t.brand} {t.model}</div>
                                  <div className="small text-muted">{t.imei || t.serial}</div>
                                </td>
                                <td>
                                  <div>{t.to_user_name || t.buyer_name || '—'}</div>
                                  <div className="small text-muted">{t.to_user_email || t.buyer_email}</div>
                                </td>
                                <td>
                                  <span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                                </td>
                                <td>
                                  <span className="text-muted">Sent to buyer via email</span>
                                </td>
                                <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</td>
                                <td>{t.updated_at ? new Date(t.updated_at).toLocaleDateString() : '—'}</td>
                                <td>{t.expires_at ? new Date(t.expires_at).toLocaleDateString() : '—'}</td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      disabled={!canCancel || processingRequest === t.id}
                                      onClick={() => handleCancelTransfer(t.id)}
                                    >
                                      {processingRequest === t.id ? <ButtonLoading /> : (expired ? 'Cancel (Expired)' : 'Cancel')}
                                    </button>
                                    {t.status === 'initiated' && (
                                      verifyingTransferId === t.id ? (
                                        <div className="d-inline-flex align-items-center gap-2">
                                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            {sellerOtpDigits.map((d, idx) => (
                                              <input
                                                key={idx}
                                                ref={(el) => (sellerOtpRefs.current[idx] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                value={d}
                                                onChange={(e) => handleSellerOtpDigitChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleSellerOtpKeyDown(idx, e)}
                                                onPaste={idx === 0 ? handleSellerOtpPaste : undefined}
                                                maxLength={1}
                                                className="form-control form-control-sm"
                                                style={{ width: '36px', height: '36px', textAlign: 'center', fontFamily: 'monospace' }}
                                              />
                                            ))}
                                          </div>
                                          <button
                                            className="btn btn-success btn-sm"
                                            disabled={processingRequest === t.id || sellerOtpCode.length !== 6}
                                            onClick={() => handleVerifySellerOtp(t.id)}
                                          >
                                            {processingRequest === t.id ? <ButtonLoading /> : 'Verify OTP'}
                                          </button>
                                          <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => { setVerifyingTransferId(null); setSellerOtpDigits(['', '', '', '', '', '']) }}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          className="btn btn-primary btn-sm"
                                          onClick={() => { setVerifyingTransferId(t.id); setSellerOtpDigits(['', '', '', '', '', '']); setTimeout(() => sellerOtpRefs.current[0]?.focus(), 0) }}
                                        >
                                          Verify Seller OTP
                                        </button>
                                      )
                                    )}
                                    {t.status === 'active' && (
                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        disabled={processingRequest === t.id}
                                        onClick={() => handleResendCode(t.id)}
                                      >
                                        {processingRequest === t.id ? <ButtonLoading /> : 'Resend Code'}
                                      </button>
                                    )}
                                    {expired && (
                                      <span className="small text-muted">Expired transfers are already returned</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="d-lg-none">
                      <div className="list-group">
                        {sentTransfers.map((t: any) => {
                          const expired = t.expires_at ? new Date() > new Date(t.expires_at) : false
                          const canCancel = (t.status !== 'completed' && t.status !== 'cancelled')
                          return (
                            <div key={t.id} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="fw-semibold">{t.brand} {t.model}</div>
                                  <div className="small text-muted">{t.imei || t.serial}</div>
                                  <div className="mt-1 small">To: {t.to_user_name || t.buyer_name || '—'} <span className="text-muted">({t.to_user_email || t.buyer_email || '—'})</span></div>
                                  <div className="mt-1 small text-muted">Created: {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'} • Updated: {t.updated_at ? new Date(t.updated_at).toLocaleDateString() : '—'} • Expires: {t.expires_at ? new Date(t.expires_at).toLocaleDateString() : '—'}</div>
                                </div>
                                <span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                              </div>
                              <div className="mt-2 d-flex align-items-center justify-content-between">
                                <span className="small text-muted">Code sent to buyer via email</span>
                                <div className="d-flex align-items-center gap-2">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    disabled={!canCancel || processingRequest === t.id}
                                    onClick={() => handleCancelTransfer(t.id)}
                                  >
                                    {processingRequest === t.id ? <ButtonLoading /> : (expired ? 'Cancel (Expired)' : 'Cancel')}
                                  </button>
                                  {t.status === 'initiated' && (
                                    verifyingTransferId === t.id ? (
                                      <div className="d-inline-flex align-items-center gap-2">
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                          {sellerOtpDigits.map((d, idx) => (
                                            <input
                                              key={idx}
                                              ref={(el) => (sellerOtpRefs.current[idx] = el)}
                                              type="text"
                                              inputMode="numeric"
                                              value={d}
                                              onChange={(e) => handleSellerOtpDigitChange(idx, e.target.value)}
                                              onKeyDown={(e) => handleSellerOtpKeyDown(idx, e)}
                                              onPaste={idx === 0 ? handleSellerOtpPaste : undefined}
                                              maxLength={1}
                                              className="form-control form-control-sm"
                                              style={{ width: '36px', height: '36px', textAlign: 'center', fontFamily: 'monospace' }}
                                            />
                                          ))}
                                        </div>
                                        <button
                                          className="btn btn-success btn-sm"
                                          disabled={processingRequest === t.id || sellerOtpCode.length !== 6}
                                          onClick={() => handleVerifySellerOtp(t.id)}
                                        >
                                          {processingRequest === t.id ? <ButtonLoading /> : 'Verify OTP'}
                                        </button>
                                        <button
                                          className="btn btn-outline-secondary btn-sm"
                                          onClick={() => { setVerifyingTransferId(null); setSellerOtpDigits(['', '', '', '', '', '']) }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => { setVerifyingTransferId(t.id); setSellerOtpDigits(['', '', '', '', '', '']); setTimeout(() => sellerOtpRefs.current[0]?.focus(), 0) }}
                                      >
                                        Verify Seller OTP
                                      </button>
                                    )
                                  )}
                                  {t.status === 'active' && (
                                    <button
                                      className="btn btn-outline-secondary btn-sm"
                                      disabled={processingRequest === t.id}
                                      onClick={() => handleResendCode(t.id)}
                                    >
                                      {processingRequest === t.id ? <ButtonLoading /> : 'Resend Code'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {expired && <div className="mt-1 small text-muted">Expired transfers are already returned</div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
                <div className="small text-muted">You can cancel any transfer that isn’t completed. Expired transfers are already returned to you.</div>
              </div>
            </div>
          </div>
        )}

        {/* Received Transfers Tab */}
        {activeTab === 'received' && (
          <div className="received-tab">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h5 mb-0">Transfers Sent To You</h3>
                  <div className="d-flex align-items-center gap-2">
                    <label className="small text-muted">Filter</label>
                    <select className="form-select form-select-sm" value={receivedFilter} onChange={(e) => setReceivedFilter(e.target.value as any)} style={{ width: '200px' }}>
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="awaiting_buyer_otp">Awaiting OTP</option>
                      <option value="completed">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                {receivedTransfers.length === 0 ? (
                  <p className="text-muted">No transfers have been sent to you yet.</p>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="d-none d-lg-block">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Device</th>
                            <th>Sender</th>
                            <th>Status</th>
                            <th>Transfer Code</th>
                            <th>Created</th>
                            <th>Expires</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivedTransfers.filter((t: any) => receivedFilter === 'all' || t.status === receivedFilter).map((t: any) => (
                            <tr key={t.id}>
                              <td>
                                <div className="fw-semibold">{t.brand} {t.model}</div>
                                <div className="small text-muted">{t.imei || t.serial}</div>
                              </td>
                              <td>
                                <div>{t.from_user_name || t.seller_name || '—'}</div>
                                <div className="small text-muted">{t.from_user_email || t.seller_email || '—'}</div>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                              </td>
                              <td>
                                <span className="text-muted">Check your email</span>
                              </td>
                              <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</td>
                              <td>{t.expires_at ? new Date(t.expires_at).toLocaleDateString() : '—'}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {['active','awaiting_buyer_otp'].includes(t.status) ? (
                                    <>
                                      <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => {
                                          setActiveTab('requests');
                                          setClaimTab('accept');
                                          setCodeDigits(new Array(12).fill(''));
                                          setTimeout(() => codeRefs.current[0]?.focus(), 0);
                                        }}
                                      >
                                        Accept
                                      </button>
                                      <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => {
                                          setActiveTab('requests');
                                          setClaimTab('reject');
                                          setCodeDigits(new Array(12).fill(''));
                                          setTimeout(() => codeRefs.current[0]?.focus(), 0);
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span className="small text-muted">Waiting for seller verification</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="d-lg-none">
                      <div className="list-group">
                        {receivedTransfers.filter((t: any) => receivedFilter === 'all' || t.status === receivedFilter).map((t: any) => (
                          <div key={t.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-semibold">{t.brand} {t.model}</div>
                                <div className="small text-muted">{t.imei || t.serial}</div>
                                <div className="mt-1 small">From: {t.from_user_name || t.seller_name || '—'} <span className="text-muted">({t.from_user_email || t.seller_email || '—'})</span></div>
                                <div className="mt-1 small text-muted">Created: {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'} • Expires: {t.expires_at ? new Date(t.expires_at).toLocaleDateString() : '—'}</div>
                              </div>
                              <span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                            </div>
                            <div className="mt-2 d-flex align-items-center justify-content-between">
                              <span className="small text-muted">Code sent to your email</span>
                              <div className="d-flex align-items-center gap-2">
                                {['active','awaiting_buyer_otp'].includes(t.status) ? (
                                  <>
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => {
                                        setActiveTab('requests');
                                        setClaimTab('accept');
                                        setCodeDigits(new Array(12).fill(''));
                                        setTimeout(() => codeRefs.current[0]?.focus(), 0);
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => {
                                        setActiveTab('requests');
                                        setClaimTab('reject');
                                        setCodeDigits(new Array(12).fill(''));
                                        setTimeout(() => codeRefs.current[0]?.focus(), 0);
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <span className="small text-muted">Waiting for seller verification</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="small text-muted">Use Accept/Reject to jump into the Claim tab, then enter the code from your email.</div>
              </div>
            </div>
          </div>
        )}

        {/* Seller OTP Modal */}
        {showSellerOtpModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Verify Transfer Initiation</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowSellerOtpModal(false); setInitiatedTransferId(null); setInitiatedTransferCode(''); setSellerOtpDigits(['', '', '', '', '', '']) }} />
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">We sent a 6-digit OTP to your email. Enter it to activate the transfer and notify the buyer.</p>
                  <div className="mb-3">
                    <label className="form-label">Verification Code (Email)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {sellerOtpDigits.map((d, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (sellerOtpRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          value={d}
                          onChange={(e) => handleSellerOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleSellerOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleSellerOtpPaste : undefined}
                          maxLength={1}
                          className="form-control"
                          style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace' }}
                        />
                      ))}
                    </div>
                    <small className="text-muted d-block mt-1">Check your email for the 6‑digit verification code</small>
                  </div>
                  <div className="alert alert-info">
                    Once you verify this OTP, the buyer will be notified and will receive the transfer code directly by email. You don’t need to send any codes.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-success"
                    disabled={!initiatedTransferId || sellerOtpCode.length !== 6 || processingRequest === initiatedTransferId}
                    onClick={() => initiatedTransferId && handleVerifySellerOtp(initiatedTransferId)}
                  >
                    {processingRequest === initiatedTransferId ? <ButtonLoading /> : 'Verify & Activate'}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => { setShowSellerOtpModal(false); setInitiatedTransferId(null); setInitiatedTransferCode(''); setSellerOtpDigits(['', '', '', '', '', '']) }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Removed modal in favor of inline Claim Transfer tabs */}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Layout>
  )
}