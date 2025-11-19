import React, { useEffect, useRef, useState } from 'react'
import { Layout } from '../components/Layout'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type CheckRecord = {
  check?: {
    id: string
    device_id?: string
    created_at?: string
    check_result?: string
    ip_address?: string
    mac_address?: string
    user_agent?: string
    device_fingerprint?: string
    browser_fingerprint?: string
    risk_score?: number
    latitude?: number
    longitude?: number
    location_accuracy?: number
  } | null
  checker?: { id?: string; name?: string; email?: string } | null
  device?: { id?: string; brand?: string; model?: string; imei?: string; serial?: string; status?: string } | null
}

export default function DeviceCheckReport() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Accept both 'checkId' and legacy 'id' query params for compatibility
  const checkId = searchParams.get('checkId') || searchParams.get('id') || ''
  const [record, setRecord] = useState<CheckRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCheckId, setManualCheckId] = useState('')
  const [showFonts, setShowFonts] = useState(false)
  const [showPlugins, setShowPlugins] = useState(false)

  const parsedFingerprint = (() => {
    const raw = record?.check?.device_fingerprint
    if (!raw) return null as any
    try {
      if (typeof raw === 'string') return JSON.parse(raw)
      if (typeof raw === 'object') return raw
      return null
    } catch {
      return null
    }
  })()

  // Lightweight Google Maps component that uses JS API if key is provided, otherwise falls back to iframe
  const GoogleMapPin: React.FC<{ lat: number; lon: number; accuracy?: number }> = ({ lat, lon, accuracy }) => {
    const mapRef = useRef<HTMLDivElement | null>(null)
    const [jsApiReady, setJsApiReady] = useState(false)
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined

    useEffect(() => {
      let cancelled = false
      const loadJsApi = async () => {
        if (!apiKey) return
        try {
          if ((window as any).google?.maps) {
            setJsApiReady(true)
            return
          }
          let script = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null
          if (!script) {
            script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
            script.async = true
            script.defer = true
            script.setAttribute('data-google-maps', 'true')
            document.head.appendChild(script)
          }
          await new Promise<void>((resolve, reject) => {
            script!.onload = () => resolve()
            script!.onerror = () => reject(new Error('Failed to load Google Maps JS API'))
            // If already loaded
            if ((window as any).google?.maps) resolve()
          })
          if (!cancelled) setJsApiReady(true)
        } catch {
          if (!cancelled) setJsApiReady(false)
        }
      }
      loadJsApi()
      return () => { cancelled = true }
    }, [apiKey])

    useEffect(() => {
      if (!jsApiReady || !mapRef.current) return
      try {
        const google = (window as any).google
        const center = { lat, lng: lon }
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapTypeId: 'roadmap'
        })
        new google.maps.Marker({ position: center, map })
        if (typeof accuracy === 'number' && accuracy > 0) {
          new google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: '#4285F4',
            fillOpacity: 0.15,
            map,
            center,
            radius: Math.min(accuracy, 2000) // cap radius to keep view sensible
          })
        }
      } catch (e) {
        // If any error occurs, rely on iframe fallback below by toggling jsApiReady off
        setJsApiReady(false)
      }
    }, [jsApiReady, lat, lon, accuracy])

    if (!apiKey || !jsApiReady) {
      return (
        <iframe
          title="Google Map"
          src={`https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`}
          width="100%"
          height="260"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )
    }

    return <div ref={mapRef} style={{ width: '100%', height: 260, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color, #e5e7eb)' }} />
  }

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!checkId) {
          // No checkId provided; show manual input UI instead of error
          setRecord(null)
          return
        }
        const token = localStorage.getItem('auth_token')
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await supabase.deviceChecks.get(checkId)
        // When called via client wrapper, headers are attached automatically; keeping pattern consistent
        const data = (res as any)?.data || res
        setRecord(data)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load check report'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchRecord()
  }, [checkId])

  const statusBadge = (s?: string) => {
    const status = (s || '').toLowerCase()
    if (status === 'clean' || status === 'verified' || status === 'clear') return <span className="status-badge status-verified">Clean</span>
    if (status === 'stolen') return <span className="status-badge status-stolen">Stolen</span>
    if (status === 'lost') return <span className="status-badge status-unverified">Lost</span>
    if (status === 'not_found' || status === 'unknown') return <span className="status-badge status-found">Not Found</span>
    return <span className="status-badge status-found">Unknown</span>
  }

  return (
    <Layout requireAuth>
      <div className="container py-4">
        <h2 className="fw-bold mb-3">Device Check Report</h2>

        {loading && (
          <div className="modern-card p-3 mb-3">
            <div>Loading check report...</div>
          </div>
        )}
        {error && (
          <div className="modern-card p-3 mb-3">
            <div className="text-danger">{error}</div>
          </div>
        )}
        {!loading && !record && !error && (
          <div className="modern-card p-3 mb-3">
            <div className="mb-2 fw-semibold">Enter a Check ID to view a report</div>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 7f8e2b54-..."
                value={manualCheckId}
                onChange={(e) => setManualCheckId(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  const id = manualCheckId.trim()
                  if (!id) return
                  const params = new URLSearchParams(searchParams)
                  params.set('checkId', id)
                  // Remove legacy id param if present
                  params.delete('id')
                  setSearchParams(params)
                }}
              >
                Load Report
              </button>
            </div>
            <small className="text-secondary d-block mt-2">
              Tip: You can copy the Check ID from the Alerts page or your check history.
            </small>
          </div>
        )}

        {record && (
        <div className="modern-card p-3 mb-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <h5 className="m-0">{record.device?.brand || 'Unknown'} {record.device?.model || ''}</h5>
              <small className="text-secondary">IMEI {record.device?.imei || '—'} • Serial {record.device?.serial || '—'}</small>
            </div>
            <div className="col-12 col-md-6 text-md-end">
              {statusBadge(record.check?.check_result)}
            </div>
          </div>
        </div>
        )}

        {record && (
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="modern-card p-3 h-100">
              <h5>Risk Assessment</h5>
              <p className="text-secondary mb-2">Calculated using reported incidents and device fingerprint signals</p>
              <div className="glass-card p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-secondary">Risk Score</span>
                  <strong>{typeof record.check?.risk_score === 'number' ? record.check?.risk_score : 0}</strong>
                </div>
              </div>
              <div className="mt-3">
                <small className="text-secondary">Checked: {record.check?.created_at ? new Date(record.check.created_at).toLocaleString() : '—'}</small>
              </div>

              {/* Live Location Map */}
              <div className="mt-3">
                <h5>Live Location</h5>
                {(() => {
                  const latRaw = record.check?.latitude as any
                  const lonRaw = record.check?.longitude as any
                  const accRaw = record.check?.location_accuracy as any
                  const latNum = typeof latRaw === 'number' ? latRaw : (typeof latRaw === 'string' ? parseFloat(latRaw) : NaN)
                  const lonNum = typeof lonRaw === 'number' ? lonRaw : (typeof lonRaw === 'string' ? parseFloat(lonRaw) : NaN)
                  const accNum = typeof accRaw === 'number' ? accRaw : (typeof accRaw === 'string' ? parseFloat(accRaw) : NaN)
                  const hasCoords = Number.isFinite(latNum) && Number.isFinite(lonNum)
                  return hasCoords ? (
                  <>
                    <div className="text-secondary mb-2">
                      {latNum.toFixed(6)}, {lonNum.toFixed(6)} (±{Number.isFinite(accNum) ? Math.round(accNum) : '—'}m)
                    </div>
                    <GoogleMapPin lat={latNum} lon={lonNum} accuracy={Number.isFinite(accNum) ? accNum : undefined} />
                    <div className="mt-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${latNum},${lonNum}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </>
                  ) : (
                    <div className="text-secondary">No location data</div>
                  )
                })()}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="modern-card p-3">
              <h5>Registry Matches</h5>
              <div className="d-flex flex-column gap-2">
                <div className="modern-card p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-semibold">Check Result</div>
                      <small className="text-secondary">Status: {record.check?.check_result || '—'}</small>
                    </div>
                    <div className="text-end">
                      <span className="status-badge status-found">{record.check?.check_result ? 'Data Available' : 'No Data'}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-secondary small">
                    <div>IP: {record.check?.ip_address || '—'}</div>
                    <div>MAC: {record.check?.mac_address || '—'}</div>
                    <div>User-Agent: {parsedFingerprint?.userAgent || record.check?.user_agent || '—'}</div>
                    <div>Browser Fingerprint: {parsedFingerprint?.browserFingerprint || record.check?.browser_fingerprint || '—'}</div>
                    <div>Screen: {parsedFingerprint?.screenResolution || '—'}</div>
                    <div>Timezone: {parsedFingerprint?.timezone || '—'}</div>
                    <div>Language: {parsedFingerprint?.language || '—'}</div>
                    <div>Platform: {parsedFingerprint?.platform || '—'}</div>
                    <div>Cookies Enabled: {(parsedFingerprint?.cookieEnabled === true || parsedFingerprint?.cookieEnabled === false) ? String(parsedFingerprint?.cookieEnabled) : '—'}</div>
                    <div>Do Not Track: {parsedFingerprint?.doNotTrack ?? '—'}</div>
                    <div>Canvas: {parsedFingerprint?.canvas || '—'}</div>
                    <div>WebGL: {parsedFingerprint?.webgl || '—'}</div>
                    <div>
                      Fonts: {Array.isArray(parsedFingerprint?.fonts) ? parsedFingerprint.fonts.length : '—'}
                      {Array.isArray(parsedFingerprint?.fonts) && (
                        <>
                          <button className="btn btn-link btn-sm ms-2 p-0" onClick={() => setShowFonts(v => !v)}>
                            {showFonts ? 'Hide' : 'Show'}
                          </button>
                          {showFonts && (
                            <div className="mt-1">{parsedFingerprint.fonts.join(', ')}</div>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      Plugins: {Array.isArray(parsedFingerprint?.plugins) ? parsedFingerprint.plugins.length : '—'}
                      {Array.isArray(parsedFingerprint?.plugins) && (
                        <>
                          <button className="btn btn-link btn-sm ms-2 p-0" onClick={() => setShowPlugins(v => !v)}>
                            {showPlugins ? 'Hide' : 'Show'}
                          </button>
                          {showPlugins && (
                            <div className="mt-1">{parsedFingerprint.plugins.join(', ')}</div>
                          )}
                        </>
                      )}
                    </div>
                    <div>Timestamp: {parsedFingerprint?.timestamp ? new Date(parsedFingerprint.timestamp).toLocaleString() : '—'}</div>
                  </div>
                </div>
                <div className="modern-card p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-semibold">Checker</div>
                      <small className="text-secondary">{record.checker?.name || 'Anonymous'} • {record.checker?.email || '—'}</small>
                    </div>
                    <div className="text-end">
                      <span className="status-badge status-verified">{record.checker?.id ? 'Identified' : 'Public'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="modern-card p-3 mt-3">
          <div className="d-flex justify-content-end gap-2">
            <a href="#/report-incident" className="btn btn-outline-danger">Report Incident</a>
            <a href="#/verification-status" className="btn btn-outline-primary">View Verification Status</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}