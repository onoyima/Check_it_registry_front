import React from 'react'
import { motion } from 'framer-motion'
import { Construction, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ComingSoonProps {
  title: string
  description?: string
  backLink?: string
  backText?: string
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = "This feature is currently under development and will be available soon.",
  backLink = "/dashboard",
  backText = "Back to Dashboard"
}) => {
  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="col-md-8 col-lg-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
              style={{ 
                width: '100px', 
                height: '100px',
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)'
              }}
            >
              <Construction size={48} className="text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="display-6 fw-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lead mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {description}
            </motion.p>

            {/* Features Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="modern-card p-4 mb-4"
            >
              <h3 className="h6 mb-3" style={{ color: 'var(--text-primary)' }}>
                What's Coming:
              </h3>
              <div className="row g-3 text-start">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle"
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: 'var(--primary-500)' 
                      }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Enhanced user interface
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle"
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: 'var(--primary-500)' 
                      }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Advanced functionality
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle"
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: 'var(--primary-500)' 
                      }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Real-time updates
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle"
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: 'var(--primary-500)' 
                      }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Improved performance
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to={backLink} className="btn-gradient-primary d-inline-flex align-items-center gap-2">
                <ArrowLeft size={18} />
                {backText}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon