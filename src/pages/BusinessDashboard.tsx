import React, { useMemo } from 'react'
import { Layout } from '../components/Layout'

export default function BusinessDashboard() {
  const stats = useMemo(() => ([
    { label: 'Active Listings', value: 24 },
    { label: 'Devices Registered', value: 182 },
    { label: 'Monthly Revenue', value: '₦1,240,500' },
    { label: 'Verification Queue', value: 7 },
  ]), [])

  const recentActivity = useMemo(() => ([
    { type: 'sale', title: 'Order #11245 confirmed', time: '2h ago' },
    { type: 'verify', title: 'Device IMEI 3567••• verified', time: '5h ago' },
    { type: 'listing', title: 'Listing “iPhone 13 128GB” updated', time: 'Yesterday' },
  ]), [])

  const operations = useMemo(() => ([
    { icon: 'smartphone', title: 'Register Device', desc: 'Add a new device to your inventory' },
    { icon: 'storefront', title: 'Create Listing', desc: 'Publish a device to marketplace' },
    { icon: 'shield_person', title: 'Verify Ownership', desc: 'Submit verification for a device' },
  ]), [])

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">Business Dashboard</h2>
            <p className="text-secondary m-0">Overview of devices, listings, and revenue</p>
          </div>
          <div className="d-flex gap-2">
            <a className="btn-gradient-primary" href="/marketplace/browse">Go to Marketplace</a>
            <a className="btn btn-outline-primary" href="/business/my-listings">My Listings</a>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {stats.map((s, i) => (
            <div className="col-12 col-md-6 col-lg-3" key={i}>
              <div className="modern-card p-3">
                <p className="text-secondary mb-1">{s.label}</p>
                <h3 className="fw-bold m-0">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="modern-card p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="m-0">Quick Operations</h5>
                <span className="text-secondary">Tools</span>
              </div>
              <div className="row g-3">
                {operations.map((op, idx) => (
                  <div className="col-12 col-md-4" key={idx}>
                    <div className="modern-card p-3 h-100">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-primary">{op.icon}</span>
                        <strong>{op.title}</strong>
                      </div>
                      <p className="text-secondary mb-3">{op.desc}</p>
                      <button className="btn btn-sm btn-outline-primary w-100">Open</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="modern-card p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="m-0">Recent Activity</h5>
                <a href="#/business/activity" className="text-primary">View all</a>
              </div>
              <div className="d-flex flex-column gap-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="d-flex align-items-start gap-3">
                    <div className={`status-badge ${a.type === 'sale' ? 'status-found' : a.type === 'verify' ? 'status-verified' : 'status-unverified'}`}>{a.type}</div>
                    <div>
                      <p className="m-0 fw-medium">{a.title}</p>
                      <small className="text-secondary">{a.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-12">
            <div className="modern-card p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="m-0">Verification Queue</h5>
                <a href="/verification-status" className="text-primary">Manage</a>
              </div>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Device</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Submitted</th>
                      <th scope="col" className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3].map(i => (
                      <tr key={i}>
                        <td>IMEI 3567•••{i}</td>
                        <td>John Doe</td>
                        <td>Apr {10+i}, 2025</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary">Review</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}