import { Layout } from '../components/Layout'
import { Settings } from 'lucide-react'

export default function LEASettings() {
  return (
    <Layout>
      <div className="container py-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Settings />
          <div>
            <h1 className="h5 m-0">LEA Settings</h1>
            <small className="text-secondary">Configure LEA preferences</small>
          </div>
        </div>
        <div className="card"><div className="card-body d-flex align-items-center gap-3"><Settings /><div><div className="fw-semibold">Preferences</div><div className="text-muted" style={{fontSize:'12px'}}>Notifications and access</div></div></div></div>
      </div>
    </Layout>
  )
}