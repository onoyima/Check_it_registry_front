import { Layout } from '../components/Layout'
import { Search } from 'lucide-react'

export default function LEADeviceSearch() {
  return (
    <Layout>
      <div className="container py-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Search />
          <div>
            <h1 className="h5 m-0">LEA Device Search</h1>
            <small className="text-secondary">Advanced search for investigations</small>
          </div>
        </div>
        <div className="card"><div className="card-body d-flex align-items-center gap-3"><Search /><div><div className="fw-semibold">Search Panel</div><div className="text-muted" style={{fontSize:'12px'}}>IMEI, serial, user</div></div></div></div>
      </div>
    </Layout>
  )
}