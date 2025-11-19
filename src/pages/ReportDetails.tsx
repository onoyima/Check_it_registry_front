import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useParams, Link } from 'react-router-dom'
import { AlertTriangle, Calendar, Clock, MapPin, User, Smartphone, FileText, CheckCircle2, Circle } from 'lucide-react'

type TimelineItem = {
  action?: string
  new_values?: any
  created_at?: string
  updated_by_name?: string
}

type ReportDetailsResponse = {
  report: any
  timeline?: TimelineItem[]
}

type DeviceDetailsResponse = {
  device: any
  check_history?: Array<{
    id?: number
    check_type?: string
    status?: string
    result?: string
    created_at?: string
    checker_name?: string
  }>
}

function formatDate(input?: string | number | Date) {
  if (!input) return 'N/A'
  const d = new Date(input)
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString()
}

export default function ReportDetails() {
  const { caseId } = useParams()
  const [data, setData] = useState<ReportDetailsResponse | null>(null)
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      if (!caseId) return
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('auth_token')
        const headers: Record<string, string> = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const res = await fetch(`/api/user-portal/reports/${caseId}`, { headers })
        if (!res.ok) throw new Error(`Failed to load report: ${res.status}`)
        const json = await res.json()
        const payload = json?.data ?? json
        if (isMounted) setData(payload)
        // Fetch device details for device checks if available
        const deviceId = payload?.report?.device_id
        if (deviceId) {
          try {
            const dRes = await fetch(`/api/user-portal/devices/${deviceId}`, { headers })
            if (dRes.ok) {
              const dJson = await dRes.json()
              const dPayload = dJson?.data ?? dJson
              if (isMounted) setDeviceDetails(dPayload)
            }
          } catch (e) {
            console.warn('Device details load failed:', e)
          }
        }
      } catch (err: any) {
        console.error('Load report details error:', err)
        if (isMounted) setError(err.message || 'Failed to load')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [caseId])

  const title = useMemo(() => `Case #${caseId}` , [caseId])

  return (
    <Layout requireAuth>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">{title}</h2>
            <p className="text-secondary m-0">View case details and progress</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link to="/reports" className="btn btn-outline-secondary">Back to Reports</Link>
            <Link
              to={`/audit-trail?resource=report&q=${caseId}`}
              className="btn btn-outline-primary"
            >
              Audit Logs
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3">
            <AlertTriangle size={18} className="me-2" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="modern-card p-4 mb-3">
            <div className="placeholder-glow">
              <span className="placeholder col-12" style={{ height: 20 }}></span>
            </div>
          </div>
        )}

        {data && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="modern-card p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FileText size={18} />
                  <h3 className="h6 m-0">Report Details</h3>
                </div>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="text-secondary" style={{ fontSize: 13 }}>Type</div>
                    <div className="fw-medium text-capitalize">{data.report?.report_type || 'N/A'}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-secondary" style={{ fontSize: 13 }}>Status</div>
                    <div className="fw-medium text-capitalize">{data.report?.status || 'N/A'}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: 13 }}>
                      <Calendar size={14} /> Reported
                    </div>
                    <div className="fw-medium">{formatDate(data.report?.created_at)}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: 13 }}>
                      <Clock size={14} /> Occurred
                    </div>
                    <div className="fw-medium">{formatDate(data.report?.occurred_at)}</div>
                  </div>
                  {data.report?.location && (
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: 13 }}>
                        <MapPin size={14} /> Location
                      </div>
                      <div className="fw-medium">{data.report.location}</div>
                    </div>
                  )}
                  {data.report?.description && (
                    <div className="col-12">
                      <div className="text-secondary" style={{ fontSize: 13 }}>Description</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{data.report.description}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Progress */}
              <div className="modern-card p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FileText size={18} />
                  <h3 className="h6 m-0">Actions & Progress</h3>
                </div>
                {(() => {
                  // Build raw steps and infer statuses
                  const raw = [
                    { key: 'filed', label: 'Report Filed', done: !!data.report?.created_at },
                    { key: 'lea', label: 'LEA Assigned', done: !!data.report?.assigned_lea_id || !!data.report?.agency_name },
                    { key: 'investigation', label: 'Investigation Started', done: (data.timeline || []).some(t => String(t.action || '').toUpperCase().includes('INVESTIGATE') || String(t.action || '').toUpperCase().includes('START')) },
                    { key: 'flag', label: 'Device Flagged', done: ['stolen','lost'].includes(String(data.report?.status || '').toLowerCase()) },
                    { key: 'resolved', label: 'Resolved/Closed', done: ['resolved','closed'].includes(String(data.report?.status || '').toLowerCase()) }
                  ]

                  let lastDoneIndex = -1
                  for (let i = raw.length - 1; i >= 0; i--) {
                    if (raw[i].done) { lastDoneIndex = i; break }
                  }

                  const steps = raw.map((r, i) => {
                    let status: 'completed' | 'current' | 'upcoming' = 'upcoming'
                    if (i <= lastDoneIndex) status = 'completed'
                    else if (i === lastDoneIndex + 1) status = 'current'
                    else status = 'upcoming'

                    // Build optional hrefs for linking
                    let href: string | undefined
                    if (r.key === 'filed') href = `/reports/${caseId}`
                    if (r.key === 'lea' && data.report?.lea_email) href = `mailto:${data.report.lea_email}`
                    if (r.key === 'investigation') href = `/audit-trail?resource=report&q=${caseId}`
                    if (r.key === 'flag' && data.report?.device_id) href = `/device/${data.report.device_id}`
                    if (r.key === 'resolved') href = `/audit-trail?resource=report&q=${caseId}`

                    return { ...r, status, href }
                  })

                  // Helper: find matching timeline event text/date for right column
                  const findEvent = (keys: string[]) => {
                    const tl = data.timeline || []
                    const match = tl.find(t => keys.some(k => String(t.action || '').toUpperCase().includes(k)))
                    return match ? {
                      text: String(match.action || '').replace(/_/g, ' '),
                      date: formatDate(match.created_at),
                      by: match.updated_by_name || undefined
                    } : null
                  }

                  // Build right column content mapped from known actions
                  const rightContent = (key: string) => {
                    if (key === 'filed') {
                      return { text: 'Case opened', date: formatDate(data.report?.created_at) }
                    }
                    if (key === 'lea') {
                      const ev = findEvent(['ASSIGN','LEA'])
                      return ev || { text: data.report?.agency_name ? `Assigned to ${data.report.agency_name}` : 'Awaiting LEA assignment', date: 'N/A' }
                    }
                    if (key === 'investigation') {
                      const ev = findEvent(['INVESTIGATE','START'])
                      return ev || { text: 'Awaiting investigation start', date: 'N/A' }
                    }
                    if (key === 'flag') {
                      const ev = findEvent(['FLAG','STOLEN','LOST'])
                      return ev || { text: `Status: ${String(data.report?.status || 'N/A')}`, date: 'N/A' }
                    }
                    if (key === 'resolved') {
                      const ev = findEvent(['RESOLVED','CLOSED'])
                      return ev || { text: 'Awaiting resolution/closure', date: 'N/A' }
                    }
                    return { text: 'Update pending', date: 'N/A' }
                  }

                  const connectorColor = (i: number) => {
                    if (i <= lastDoneIndex) return 'bg-success'
                    if (i === lastDoneIndex + 1) return 'bg-primary'
                    return 'bg-secondary'
                  }

                  const circleClass = (s: 'completed'|'current'|'upcoming') => (
                    s === 'completed' ? 'bg-success text-white' : s === 'current' ? 'bg-primary text-white' : 'bg-secondary text-white'
                  )
                  const labelClass = (s: 'completed'|'current'|'upcoming') => (
                    s === 'completed' ? 'text-success' : s === 'current' ? 'text-primary' : 'text-secondary'
                  )

                  return (
                    <div className="d-flex flex-column">
                      {steps.map((s, idx) => {
                        const rc = rightContent(s.key)
                        const rightHref = s.key === 'flag' && data.report?.device_id
                          ? `/device/${data.report.device_id}`
                          : `/audit-trail?resource=report&q=${caseId}`
                        return (
                          <div key={idx} className="d-flex align-items-center mb-2">
                            {/* Left: compact label above small circle */}
                            <div className="d-flex flex-column align-items-center" style={{ width: 160 }}>
                              {s.href ? (
                                <Link to={s.href} className={`text-decoration-none fw-medium ${labelClass(s.status)}`} style={{ fontSize: 13 }}>{s.label}</Link>
                              ) : (
                                <span className={`fw-medium ${labelClass(s.status)}`} style={{ fontSize: 13 }}>{s.label}</span>
                              )}
                              {s.href ? (
                                <Link to={s.href} className="text-decoration-none mt-1">
                                  <div className={`d-flex align-items-center justify-content-center rounded-circle ${circleClass(s.status)}`} style={{ width: 22, height: 22, fontSize: 11 }}>
                                    {s.status === 'completed' ? <CheckCircle2 size={14} /> : idx + 1}
                                  </div>
                                </Link>
                              ) : (
                                <div className={`d-flex align-items-center justify-content-center rounded-circle mt-1 ${circleClass(s.status)}`} style={{ width: 22, height: 22, fontSize: 11 }}>
                                  {s.status === 'completed' ? <CheckCircle2 size={14} /> : idx + 1}
                                </div>
                              )}
                            </div>

                            {/* Middle: continuous horizontal connector with arrow head */}
                            <div className="flex-grow-1 d-flex align-items-center">
                              <div className={`${connectorColor(idx)} rounded`} style={{ height: 3, width: '100%' }} />
                              {/* Arrowhead overlaps right box edge to avoid visual break */}
                              <div className={`${connectorColor(idx)}`} style={{ width: 16, height: 12, marginLeft: -1, clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
                            </div>

                            {/* Right: mapped timeline/device info box */}
                            <div className="ms-3" style={{ minWidth: 240 }}>
                              <Link to={rightHref} className="text-decoration-none">
                                <div className="border rounded px-2 py-2" style={{ fontSize: 12 }}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className={`badge ${s.status === 'completed' ? 'bg-success' : s.status === 'current' ? 'bg-primary' : 'bg-secondary'}`}>{s.status === 'completed' ? 'Completed' : s.status === 'current' ? 'Current' : 'Upcoming'}</span>
                                    <span className="text-secondary">{rc.date}</span>
                                  </div>
                                  <div className="mt-1 fw-medium" style={{ fontSize: 12 }}>{rc.text}</div>
                                  {rc.by && <div className="text-secondary" style={{ fontSize: 11 }}>By {rc.by}</div>}
                                </div>
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
                <div className="mt-2 text-secondary" style={{ fontSize: 12 }}>
                  Blue = Current, Green = Completed, Grey = Next/Upcoming
                </div>
              </div>

              <div className="modern-card p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FileText size={18} />
                  <h3 className="h6 m-0">Progress Timeline</h3>
                </div>
                {data.timeline && data.timeline.length > 0 ? (
                  <div className="list-group">
                    {data.timeline.map((item, i) => (
                      <div key={i} className="list-group-item border-0 px-0">
                        <div className="d-flex justify-content-between">
                          <div>
                            <div className="fw-medium">{String(item.action || '').replace(/_/g, ' ') || 'N/A'}</div>
                            {item.new_values && (
                              <div className="text-secondary" style={{ fontSize: 13 }}>
                                {(() => {
                                  const v = item.new_values as any
                                  const formatVal = (val: any) => {
                                    if (val === null || val === undefined) return '—'
                                    if (typeof val === 'object') {
                                      if (Array.isArray(val)) return val.map((x) => String(x)).join(', ')
                                      return Object.entries(val)
                                        .map(([k, x]) => `${k}: ${String(x as any)}`)
                                        .join('; ')
                                    }
                                    return String(val)
                                  }
                                  if (typeof v === 'string') {
                                    return v
                                  }
                                  if (typeof v === 'object' && v) {
                                    const entries = Object.entries(v)
                                    if (entries.length === 0) return 'No changes'
                                    return (
                                      <div className="d-flex flex-column gap-1">
                                        {entries.map(([key, val], idx) => (
                                          <div key={idx}>
                                            <span className="fw-semibold text-dark">{key}:</span> {formatVal(val)}
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  }
                                  return String(v)
                                })()}
                              </div>
                            )}
                          </div>
                          <div className="text-secondary" style={{ fontSize: 12 }}>{formatDate(item.created_at)}</div>
                        </div>
                        {item.updated_by_name && (
                          <div className="text-secondary" style={{ fontSize: 12 }}>By {item.updated_by_name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-secondary">No timeline entries yet.</div>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="modern-card p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Smartphone size={18} />
                  <h3 className="h6 m-0">Device</h3>
                </div>
                {data.report?.device_id ? (
                  <div>
                    <div className="fw-medium">{data.report?.brand} {data.report?.model}</div>
                    <div className="text-secondary" style={{ fontSize: 13 }}>IMEI: {data.report?.imei || 'N/A'}</div>
                    <div className="text-secondary" style={{ fontSize: 13 }}>Serial: {data.report?.serial || 'N/A'}</div>
                    <div className="d-flex gap-2 mt-2">
                      <Link to={`/device/${data.report.device_id}`} className="btn btn-sm btn-outline-primary">View Device</Link>
                      <Link
                        to={`/audit-trail?resource=device&q=${encodeURIComponent(String(data.report.device_id))}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Device Audit
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-secondary">No device info</div>
                )}
              </div>

              <div className="modern-card p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <User size={18} />
                  <h3 className="h6 m-0">Owner / Reporter</h3>
                </div>
                <div>
                  <div className="fw-medium">{data.report?.owner_name || 'N/A'}</div>
                  <div className="text-secondary" style={{ fontSize: 13 }}>{data.report?.owner_email || 'N/A'}</div>
                </div>
              </div>

              <div className="modern-card p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <User size={18} />
                  <h3 className="h6 m-0">Assigned LEA</h3>
                </div>
                {data.report?.agency_name ? (
                  <div>
                    <div className="fw-medium">{data.report.agency_name}</div>
                    <div className="text-secondary" style={{ fontSize: 13 }}>{data.report?.lea_email || 'N/A'}</div>
                    <div className="text-secondary" style={{ fontSize: 13 }}>{data.report?.lea_phone || 'N/A'}</div>
                    {data.report?.lea_address && (
                      <div className="text-secondary" style={{ fontSize: 13 }}>{data.report.lea_address}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-secondary">No LEA assigned</div>
                )}
              </div>

              {/* Device Checks */}
              <div className="modern-card p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Smartphone size={18} />
                  <h3 className="h6 m-0">Device Checks</h3>
                </div>
                {deviceDetails?.check_history && deviceDetails.check_history.length > 0 ? (
                  <div className="list-group">
                    {deviceDetails.check_history.map((c, idx) => (
                      <div key={idx} className="list-group-item border-0 px-0">
                        <div className="d-flex justify-content-between">
                          <div>
                            <div className="fw-medium text-capitalize">{c.check_type || 'check'}</div>
                            <div className="text-secondary" style={{ fontSize: 13 }}>{c.result || c.status || 'N/A'}</div>
                          </div>
                          <div className="text-secondary" style={{ fontSize: 12 }}>{formatDate(c.created_at)}</div>
                        </div>
                        {c.checker_name && (
                          <div className="text-secondary" style={{ fontSize: 12 }}>By {c.checker_name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-secondary">No device check actions yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}