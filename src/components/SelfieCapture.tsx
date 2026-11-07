// Takes a photo of the person with their camera (front camera on phones).
// Used before every item check; the photo is stored with that check.
import { useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, Loader2, X } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = { open: boolean; onCancel: () => void; onPhoto: (dataUrl: string) => void }

export default function SelfieCapture({ open, onCancel, onPhoto }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const [photo, setPhoto] = useState('')
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null }

  const start = async () => {
    setError(''); setPhoto(''); setStarting(true)
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported')
      stop()
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }, audio: false })
      if (video.current) { video.current.srcObject = stream.current; await video.current.play().catch(() => {}) }
    } catch (e: any) {
      setError(e?.message === 'unsupported'
        ? "This browser can't use the camera. Try Chrome or Safari on your phone."
        : 'Allow the camera to continue. A photo of you is needed for every item check.')
    } finally { setStarting(false) }
  }

  useEffect(() => {
    if (open) start()
    return stop
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const take = () => {
    const v = video.current
    if (!v || !v.videoWidth) { setError('The camera is not ready yet. Wait a moment and try again.'); return }
    const size = Math.min(v.videoWidth, v.videoHeight)
    const scale = Math.min(1, 640 / size)
    const c = document.createElement('canvas')
    c.width = Math.round(size * scale); c.height = Math.round(size * scale)
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, (v.videoWidth - size) / 2, (v.videoHeight - size) / 2, size, size, 0, 0, c.width, c.height)
    setPhoto(c.toDataURL('image/jpeg', 0.85))
    stop()
  }

  if (!open) return null
  return (
    <div className="po-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="selfie-title">
      <div className="po-dialog po-selfie" data-testid="selfie-capture">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <h2 id="selfie-title" className="po-card-title mb-1">Take a photo of yourself</h2>
          <button type="button" className="po-icon-btn" onClick={() => { stop(); onCancel() }} aria-label="Cancel"><X size={18} /></button>
        </div>
        <p className="po-muted small mb-3">Every item check records a photo of the person checking, with their location, so stolen items can be traced. Only Prove Ownership staff and the police can see it. <Link to="/privacy" target="_blank">Privacy Policy</Link></p>
        <div className="po-selfie-frame">
          {photo ? <img src={photo} alt="Your photo" /> : <video ref={video} playsInline muted aria-label="Camera preview" />}
          {starting && <div className="po-selfie-wait"><Loader2 size={28} className="po-spin" aria-label="Starting camera" /></div>}
        </div>
        {error && <p className="po-error" role="alert">{error}</p>}
        <div className="d-flex gap-2 mt-3">
          {photo ? (
            <>
              <button type="button" className="po-btn po-btn-secondary" onClick={start}><RefreshCw size={16} aria-hidden="true" /> Retake</button>
              <button type="button" className="po-btn po-btn-primary flex-grow-1" onClick={() => onPhoto(photo)}>Use this photo</button>
            </>
          ) : error ? (
            <button type="button" className="po-btn po-btn-primary flex-grow-1" onClick={start}>Try the camera again</button>
          ) : (
            <button type="button" className="po-btn po-btn-primary flex-grow-1" onClick={take} disabled={starting}><Camera size={18} aria-hidden="true" /> Take photo</button>
          )}
        </div>
      </div>
    </div>
  )
}
