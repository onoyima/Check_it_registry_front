import React, { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'

type Txn = {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  method: 'card' | 'wallet' | 'bank'
  description: string
}

export default function TransactionHistory() {
  const txns = useMemo<Txn[]>(() => ([
    { id: 'TX-202504-001', date: '2025-04-12', amount: 145000, status: 'paid', method: 'card', description: 'Marketplace order #11245' },
    { id: 'TX-202504-002', date: '2025-04-14', amount: 85000, status: 'pending', method: 'wallet', description: 'Listing boost (7 days)' },
    { id: 'TX-202504-003', date: '2025-04-18', amount: 35000, status: 'failed', method: 'bank', description: 'Verification fee' },
    { id: 'TX-202505-001', date: '2025-05-02', amount: 225000, status: 'paid', method: 'card', description: 'Marketplace order #11302' },
  ]), [])

  const [status, setStatus] = useState<'all'|'paid'|'pending'|'failed'>('all')
  const [search, setSearch] = useState('')

  const filtered = txns.filter(t => (
    (status === 'all' || t.status === status) &&
    (t.id.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  ))

  const currency = (n: number) => `₦${n.toLocaleString()}`

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fw-bold m-0">Transaction History</h2>
            <p className="text-secondary m-0">Payments, fees, and marketplace payouts</p>
          </div>
          <a className="btn btn-outline-primary" href="#/payments/method-selection">Manage Payment Methods</a>
        </div>

        <div className="modern-card p-3 mb-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <input className="modern-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or description" />
            </div>
            <div className="col-12 col-md-6 d-flex gap-2 align-items-center">
              <label className="text-secondary">Status:</label>
              <select className="form-select" style={{maxWidth: 240}} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {filtered.map(t => (
            <div key={t.id} className="modern-card p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className={`status-badge ${t.status === 'paid' ? 'status-verified' : t.status === 'pending' ? 'status-unverified' : 'status-stolen'}`}>{t.status}</div>
                  <div>
                    <div className="fw-semibold">{t.description}</div>
                    <small className="text-secondary">{t.id} • {new Date(t.date).toLocaleDateString()}</small>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold">{currency(t.amount)}</div>
                  <small className="text-secondary">Method: {t.method}</small>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="modern-card p-4 text-center text-secondary">No transactions found.</div>
          )}
        </div>
      </div>
    </Layout>
  )
}