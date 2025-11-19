import React, { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'

type Agency = {
  id: string
  name: string
  jurisdiction: string
  users: number
  status: 'active' | 'suspended' | 'pending'
}

export default function AdminLEAManagement() {
  const agencies = useMemo<Agency[]>(() => ([
    { id: 'AG-001', name: 'Lagos Police Command', jurisdiction: 'Lagos State', users: 128, status: 'active' },
    { id: 'AG-002', name: 'Abuja Police HQ', jurisdiction: 'FCT Abuja', users: 94, status: 'active' },
    { id: 'AG-003', name: 'Kano Division', jurisdiction: 'Kano State', users: 37, status: 'pending' },
    { id: 'AG-004', name: 'Rivers Tactical Unit', jurisdiction: 'Rivers State', users: 52, status: 'suspended' },
  ]), [])

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all'|'active'|'pending'|'suspended'>('all')

  const filtered = agencies.filter(a => (
    (filter === 'all' || a.status === filter) &&
    (a.name.toLowerCase().includes(query.toLowerCase()) || a.jurisdiction.toLowerCase().includes(query.toLowerCase()))
  ))

  return (
    <Layout requireAuth allowedRoles={["admin"]}>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">LEA Management</h2>
            <p className="text-secondary m-0">Manage law enforcement agency access and settings</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn-gradient-primary">Invite Agency</button>
            <button className="btn btn-outline-danger">Suspend Selected</button>
          </div>
        </div>

        <div className="modern-card p-3 mb-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <input className="modern-input" placeholder="Search agencies by name or jurisdiction" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="col-12 col-md-6 d-flex gap-2 align-items-center">
              <label className="text-secondary">Status:</label>
              <select className="form-select" style={{maxWidth: 240}} value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modern-card p-0">
          <div className="table-responsive">
            <table className="table align-middle m-0">
              <thead>
                <tr>
                  <th scope="col">Agency</th>
                  <th scope="col">Jurisdiction</th>
                  <th scope="col">Users</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="fw-semibold">{a.name}</div>
                      <small className="text-secondary">{a.id}</small>
                    </td>
                    <td>{a.jurisdiction}</td>
                    <td>{a.users}</td>
                    <td>
                      <span className={`status-badge ${a.status === 'active' ? 'status-verified' : a.status === 'pending' ? 'status-unverified' : 'status-stolen'}`.trim()}>
                        {a.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary">View</button>
                        <button className="btn btn-sm btn-outline-secondary">Edit</button>
                        {a.status !== 'suspended' ? (
                          <button className="btn btn-sm btn-outline-danger">Suspend</button>
                        ) : (
                          <button className="btn btn-sm btn-outline-success">Activate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary py-4">No agencies match your filter</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}