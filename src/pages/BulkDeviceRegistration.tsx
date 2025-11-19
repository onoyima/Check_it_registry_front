import React, { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'

type Row = {
  imei: string
  brand: string
  model: string
  purchaseDate: string
  ownerEmail: string
}

export default function BulkDeviceRegistration() {
  const template = useMemo<Row[]>(() => ([
    { imei: '3567XXXXXXXXX01', brand: 'Samsung', model: 'A52', purchaseDate: '2024-11-12', ownerEmail: 'owner1@example.com' },
    { imei: '7890XXXXXXXXX56', brand: 'Apple', model: 'iPhone 13', purchaseDate: '2025-02-09', ownerEmail: 'owner2@example.com' },
  ]), [])

  const [rows, setRows] = useState<Row[]>(template)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const onFile = async (f: File) => {
    const text = await f.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    const parsed: Row[] = []
    const err: string[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      if (cols.length < 5) {
        err.push(`Line ${i + 1}: expected 5 columns`)
        continue
      }
      const [imei, brand, model, purchaseDate, ownerEmail] = cols.map(c => c.trim())
      parsed.push({ imei, brand, model, purchaseDate, ownerEmail })
    }
    setRows(parsed.length ? parsed : [])
    setErrors(err)
    setSuccess(false)
  }

  const downloadTemplate = () => {
    const header = 'imei,brand,model,purchaseDate,ownerEmail\n'
    const body = template.map(r => `${r.imei},${r.brand},${r.model},${r.purchaseDate},${r.ownerEmail}`).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk_device_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const submit = () => {
    const invalid = rows.filter(r => !r.imei || !r.brand || !r.model || !r.purchaseDate || !r.ownerEmail)
    if (invalid.length) {
      setErrors([`There are ${invalid.length} invalid rows. Please fix and retry.`])
      setSuccess(false)
      return
    }
    setErrors([])
    setSuccess(true)
    setTimeout(() => alert(`Submitted ${rows.length} devices for registration`), 300)
  }

  return (
    <Layout requireAuth allowedRoles={["business"]}>
      <div className="container py-4">
        <h2 className="fw-bold mb-3">Bulk Device Registration</h2>

        <div className="modern-card p-3 mb-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center gap-2">
                <input type="file" accept=".csv" className="form-control" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
                <button className="btn btn-outline-secondary" type="button" onClick={downloadTemplate}>Download Template</button>
              </div>
              <small className="text-secondary">Columns: imei, brand, model, purchaseDate (YYYY-MM-DD), ownerEmail</small>
            </div>
            <div className="col-12 col-md-6 text-md-end">
              <button className="btn btn-primary" type="button" onClick={submit}>Submit Batch</button>
            </div>
          </div>
          {errors.length > 0 && (
            <div className="alert alert-warning mt-3">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
          {success && (
            <div className="alert alert-success mt-3">Batch submitted successfully</div>
          )}
        </div>

        <div className="modern-card p-0">
          <div className="table-responsive">
            <table className="table align-middle m-0">
              <thead>
                <tr>
                  <th>IMEI</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Purchase Date</th>
                  <th>Owner Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.imei}</td>
                    <td>{r.brand}</td>
                    <td>{r.model}</td>
                    <td>{new Date(r.purchaseDate).toLocaleDateString()}</td>
                    <td>{r.ownerEmail}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary py-4">Upload a CSV to preview rows</td>
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