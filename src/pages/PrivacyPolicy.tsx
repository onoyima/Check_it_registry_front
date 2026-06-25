import { motion } from 'framer-motion'
import { Shield, BookOpen, Scale, Lock, Eye, Database, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const sections = [
  {
    icon: Shield, title: 'Information We Collect',
    content: 'We collect information you provide when creating an account, registering devices, reporting incidents, and using our device check services. This includes your name, email address, phone number, device IMEI/serial numbers, and device-related documentation.'
  },
  {
    icon: Eye, title: 'How We Use Your Information',
    content: 'Your information is used to provide and improve our device registry services, process device checks and verifications, facilitate device transfers, prevent fraud, and communicate with you about your account and our services.'
  },
  {
    icon: Database, title: 'Data Storage & Security',
    content: 'We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits. Your data is stored on secure servers with redundant backups.'
  },
  {
    icon: Scale, title: 'Data Sharing & Disclosure',
    content: 'We do not sell your personal information. Device status information (stolen/lost/recovered) may be shared with law enforcement agencies and authorized third parties for the purpose of recovering stolen devices and preventing fraud.'
  },
  {
    icon: Lock, title: 'Your Rights',
    content: 'You have the right to access, correct, or delete your personal information. You can manage your data through your account settings or by contacting our support team. We will respond to your request within 30 days.'
  },
  {
    icon: BookOpen, title: 'Cookies & Tracking',
    content: 'We use essential cookies for authentication and security. Analytics cookies help us improve our service. Device fingerprints (canvas, WebGL, fonts) are collected during device checks for fraud prevention purposes.'
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="row justify-content-center py-5">
          <div className="col-lg-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-5">
                <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }}>
                  <Shield size={36} className="text-white" />
                </div>
                <h1>Privacy Policy</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Last updated: October 2024</p>
              </div>

              <div className="row g-4">
                {sections.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div className="col-12 col-md-6" key={i}>
                      <motion.div
                        className="modern-card p-4 h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 48, height: 48, background: 'var(--primary-50)' }}>
                            <Icon size={24} style={{ color: 'var(--primary-600)' }} />
                          </div>
                          <div>
                            <h5 className="mb-2">{s.title}</h5>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{s.content}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )
                })}
              </div>

              <div className="modern-card p-4 mt-4">
                <div className="d-flex align-items-start gap-3">
                  <Mail size={20} style={{ color: 'var(--primary-600)' }} className="mt-1" />
                  <div>
                    <h5 className="mb-2">Contact Us</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      If you have questions about this Privacy Policy, please contact us at{' '}
                      <a href="mailto:privacy@checkit.com" style={{ color: 'var(--primary-600)' }}>privacy@checkit.com</a>
                    </p>
                    <Link to="/" className="btn-outline-primary d-inline-flex align-items-center gap-2 mt-2">
                      <Shield size={16} /> Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
