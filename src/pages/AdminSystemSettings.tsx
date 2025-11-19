import React, { useState } from 'react'
import { Layout } from '../components/Layout'

export default function AdminSystemSettings() {
  const [featureFlags, setFeatureFlags] = useState({
    marketplace: true,
    leaPortal: true,
    emailNotifications: true,
    smsNotifications: false,
    publicCheck: true,
  })
  const [security, setSecurity] = useState({
    require2FA: true,
    sessionTimeout: 30,
    allowPasswordless: false
  })

  const updateFlag = (k: keyof typeof featureFlags) => setFeatureFlags(prev => ({ ...prev, [k]: !prev[k] }))
  const onSave = () => {
    // Mock save
    alert('Settings saved')
  }

  return (
    <Layout requireAuth allowedRoles={["admin"]}>
      <div className="container py-4">
        <h2 className="fw-bold mb-3">System Settings</h2>

        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="modern-card p-3">
              <h5 className="mb-3">Feature Flags</h5>
              <div className="d-flex flex-column gap-2">
                {Object.keys(featureFlags).map((k) => (
                  <div key={k} className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary text-capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked={(featureFlags as any)[k]} onChange={() => updateFlag(k as any)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="modern-card p-3">
              <h5 className="mb-3">Security</h5>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span className="text-secondary">Require 2FA for admins</span>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={security.require2FA} onChange={(e) => setSecurity(prev => ({ ...prev, require2FA: e.target.checked }))} />
                </div>
              </div>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span className="text-secondary">Session timeout (minutes)</span>
                <input type="number" className="form-control" style={{ maxWidth: 120 }} value={security.sessionTimeout} onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))} />
              </div>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span className="text-secondary">Allow passwordless login</span>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={security.allowPasswordless} onChange={(e) => setSecurity(prev => ({ ...prev, allowPasswordless: e.target.checked }))} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn-gradient-primary" onClick={onSave}>Save Changes</button>
        </div>
      </div>
    </Layout>
  )
}