
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const { user, logout } = useAuth();

  return (
    <div className="privacy-page" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar user={user} onLogout={logout} />
      
      <div className="container py-5 mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none text-muted mb-4 hover-text-primary">
                <ArrowLeft size={18} /> Back to Home
              </Link>
              
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <Shield size={32} /> 
                </div>
                <h1 className="fw-bold mb-0 display-5">Privacy & Legal Policy</h1>
              </div>
              
              <div className="recent-update text-muted small mb-5">
                Last Updated: {new Date().toLocaleDateString()}
              </div>

              <div className="policy-content bg-white p-5 rounded-4 shadow-sm border">
                <section className="mb-5">
                  <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                    <Eye size={24} />
                    <h2 className="h4 fw-bold mb-0">1. Data Collection & Usage</h2>
                  </div>
                  <p className="text-secondary">
                    We collect information to provide better services to all our users. This includes:
                  </p>
                  <ul className="text-secondary">
                    <li className="mb-2"><strong>Personal Identification:</strong> Name, email address, phone number, and government-issued ID (for verification).</li>
                    <li className="mb-2"><strong>Device Information:</strong> IMEI, Serial Number, model, brand, and proof of purchase images.</li>
                    <li className="mb-2"><strong>Usage Data:</strong> Log data, IP addresses, and device fingerprints for security monitoring.</li>
                  </ul>
                  <p className="text-secondary fst-italic border-start border-4 border-primary ps-3 bg-light p-2 rounded-end">
                    We do not sell your personal data to third parties. Data is shared with Law Enforcement Agencies (LEA) only upon verified request or flag investigation.
                  </p>
                </section>

                <section className="mb-5">
                   <div className="d-flex align-items-center gap-2 mb-3 text-success">
                    <Lock size={24} />
                    <h2 className="h4 fw-bold mb-0">2. Security & Encryption</h2>
                  </div>
                  <p className="text-secondary">
                    We employ industry-standard security measures to protect your data:
                  </p>
                   <ul className="text-secondary">
                    <li className="mb-2">All sensitive data (PII) is encrypted at rest using AES-256 standards.</li>
                    <li className="mb-2">Data transmission occurs over secure SSL/TLS channels.</li>
                    <li className="mb-2">Strict access controls ensure only authorized personnel can access sensitive registry data.</li>
                  </ul>
                </section>

                <section className="mb-5">
                   <div className="d-flex align-items-center gap-2 mb-3 text-warning">
                    <FileText size={24} />
                    <h2 className="h4 fw-bold mb-0">3. User Rights</h2>
                  </div>
                  <p className="text-secondary">
                    Under the Nigeria Data Protection Regulation (NDPR) and global standards, you have the right to:
                  </p>
                   <ul className="text-secondary">
                    <li className="mb-2"><strong>Access:</strong> Request a copy of all personal data we hold about you.</li>
                    <li className="mb-2"><strong>Rectification:</strong> Correct any inaccurate or incomplete data.</li>
                    <li className="mb-2"><strong>Erasure:</strong> Request deletion of your account and associated data (subject to LEA retention laws).</li>
                  </ul>
                </section>

                <section className="mb-5">
                   <h2 className="h4 fw-bold mb-3">4. Device Status & Public Ledger</h2>
                   <p className="text-secondary">
                     By registering a device, you consent to its IMEI/Serial status (Clean, Lost, Stolen) being publicly searchable. 
                     <strong> No personal owner information</strong> is revealed in public searches unless explicitly authorized for recovery purposes.
                   </p>
                </section>

                <section>
                   <h2 className="h4 fw-bold mb-3">5. Contact Us</h2>
                   <p className="text-secondary">
                     For any privacy concerns or legal inquiries, please contact our Data Protection Officer at:
                   </p>
                   <a href="mailto:privacy@checkit-registry.ng" className="text-primary fw-bold text-decoration-none">privacy@checkit-registry.ng</a>
                </section>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
       {/* Footer */}
      <footer className="py-4 border-top mt-5 bg-light" style={{ borderColor: 'var(--border-color)' }}>
        <div className="container text-center">
            <p className="text-muted small mb-0">
                © {new Date().getFullYear()} Check It Registry. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}
