import { Layout } from '../components/Layout'
import { Shield } from 'lucide-react'

export default function LEARecovery() {
  return (
    <Layout>
      <div className="container py-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Shield />
          <div>
            <h1 className="h5 m-0">LEA Recovery Coordination</h1>
            <small className="text-secondary">Coordinate recovery operations</small>
          </div>
        </div>
        <div className="card"><div className="card-body d-flex align-items-center gap-3"><Shield /><div><div className="fw-semibold">Recovery Planner</div><div className="text-muted" style={{fontSize:'12px'}}>Tasks and assignments</div></div></div></div>
      </div>
    </Layout>
  )
}