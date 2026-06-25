import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="row justify-content-center py-5" style={{ minHeight: '80vh' }}>
          <div className="col-lg-6 d-flex align-items-center justify-content-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-4"
                style={{
                  width: 140, height: 140,
                  background: 'linear-gradient(135deg, var(--danger-50), var(--danger-100))',
                  border: '4px solid var(--danger-200)',
                }}
              >
                <span className="fw-bold" style={{ fontSize: 56, color: 'var(--danger-500)' }}>404</span>
              </motion.div>

              <h2 className="mb-2">Page Not Found</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 400, margin: '0 auto 32px' }}>
                The page you're looking for doesn't exist or has been moved.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button className="btn-gradient-primary d-inline-flex align-items-center gap-2 px-4 py-2" onClick={() => navigate(-1)}>
                  <ArrowLeft size={18} />
                  Go Back
                </button>
                <Link to="/" className="btn-outline-primary d-inline-flex align-items-center gap-2 px-4 py-2">
                  <Home size={18} />
                  Home
                </Link>
                <Link to="/search" className="btn-ghost d-inline-flex align-items-center gap-2 px-4 py-2">
                  <Search size={18} />
                  Search
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
