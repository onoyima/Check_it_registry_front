import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar user={null} onLogout={() => {}} />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-11 col-md-8 col-lg-6">
            <div className="text-center p-5" style={{ borderRadius: 16, border: '1px solid var(--gray-200)', background: 'var(--surface)' }}>
              <h1 className="mb-3" style={{ fontSize: '2rem' }}>Page Not Found</h1>
              <p className="mb-4" style={{ opacity: 0.8 }}>The link you followed doesn’t exist or is no longer available.</p>
              <Link to="/dashboard" className="btn btn-primary d-inline-flex align-items-center gap-2">
                <ArrowLeft size={18} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}