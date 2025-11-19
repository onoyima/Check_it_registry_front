import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabase'
import { AlertTriangle, FileText, Eye, RefreshCw } from 'lucide-react'

type ReportItem = {
  id: number | string
  case_id: number | string
  status?: string
  report_type?: string
  description?: string
  created_at?: string
  occurred_at?: string
}

const formatDate = (value?: string | number | Date) => {
  try {
    if (!value) return 'Unknown'
    const d = new Date(value)
    return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString()
  } catch {
    return 'Unknown'
  }
}

class PageErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }>{
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, message: undefined }
  }
  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return { hasError: true, message }
  }
  componentDidCatch(error: unknown) {
    console.error('ReportsV2 render error:', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <Layout requireAuth>
          <div className="container-fluid">
            <div className="modern-card p-4">
              <div className="alert alert-danger d-flex align-items-center">
                <AlertTriangle size={18} className="me-2" />
                <div>
                  <div className="fw-semibold">Could not render reports.</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{this.state.message}</div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>Reload Page</button>
                <Link to="/reports" className="btn btn-outline-secondary">Back to Reports</Link>
              </div>
            </div>
          </div>
        </Layout>
      )
    }
    return this.props.children as React.ReactElement
  }
}

export default function ReportsV2() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()

  const loadReports = async () => {
    try {
      setLoading(true)
      setError('')
      const reportsData = await supabase.reports.list()
      const normalized: ReportItem[] = Array.isArray(reportsData)
        ? reportsData as ReportItem[]
        : (reportsData && Array.isArray((reportsData as any).data?.reports))
          ? (reportsData as any).data.reports
          : (reportsData && Array.isArray((reportsData as any).reports))
            ? (reportsData as any).reports
            : []
      setReports(normalized)
    } catch (err) {
      console.error('ReportsV2 load error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading your reports...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <PageErrorBoundary>
      <Layout requireAuth>
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 fw-bold" style={{ color: 'var(--text-primary)' }}>My Reports (V2)</h1>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Simplified view to avoid render issues</p>
              </div>
              <div className="d-flex gap-2">
                <button onClick={loadReports} className="btn btn-outline-primary d-flex align-items-center gap-2">
                  <RefreshCw size={18} />
                  Refresh
                </button>
                <Link to="/report-missing" className="btn-gradient-primary d-flex align-items-center gap-2">
                  <AlertTriangle size={18} />
                  New Report
                </Link>
              </div>
            </div>
          </div>

          <div className="modern-card">
            <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
              <h3 className="h5 mb-0" style={{ color: 'var(--text-primary)' }}>Reports ({reports.length})</h3>
            </div>

            <div className="p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4">
                  <AlertTriangle size={18} className="me-2" />
                  <span>{error}</span>
                </div>
              )}

              {reports.length === 0 ? (
                <div className="text-center py-5">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                    style={{ width: '80px', height: '80px', backgroundColor: 'rgba(14, 165, 233, 0.1)' }}
                  >
                    <FileText size={40} style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <h4 className="h5 mb-3" style={{ color: 'var(--text-primary)' }}>No reports yet</h4>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    You haven't filed any reports yet. Report a missing device to get started.
                  </p>
                  <Link to="/report-missing" className="btn-gradient-primary">
                    <AlertTriangle size={18} className="me-2" />
                    Report Missing Device
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Reported</th>
                        <th>Occurred</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr key={String(r.id)}>
                          <td>#{String(r.case_id)}</td>
                          <td>{typeof r.status === 'string' ? r.status.replace('_', ' ') : 'unknown'}</td>
                          <td>{typeof r.report_type === 'string' ? r.report_type : 'unknown'}</td>
                          <td>{formatDate(r.created_at)}</td>
                          <td>{formatDate(r.occurred_at)}</td>
                          <td className="text-end">
                            <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" onClick={() => navigate(`/reports/${r.case_id}`)}>
                              <Eye size={16} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </PageErrorBoundary>
  )
}