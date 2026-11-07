// A buyer confirms the certificate a seller shows them. The seller checked
// their own item (free) and got a code; the buyer enters it here, for free,
// to see the result, the owner's name and whether anything has changed
// since. Then the seller transfers the item to the buyer as they pay.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BadgeCheck, AlertTriangle, Loader2, Search } from 'lucide-react'
import { Layout } from '../components/Layout'
import { apiClient } from '../lib/apiClient'

type Cert = {
  code: string; issuedAt: string; ownerName: string | null
  item: { category?: string; brand?: string; model?: string; identifierEnding?: string | null }
  resultAtCheck?: string; stillOwnedByIssuer: boolean; reportedNow: string | null
  heldByProveOwnership: boolean; ownershipLevel: string; viewerIsOwner: boolean
}

export default function CheckCertificate() {
  const [params] = useSearchParams()
  const [code, setCode] = useState((params.get('code') || '').toUpperCase())
  const [cert, setCert] = useState<Cert | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const look = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError(''); setCert(null)
    try {
      const r: any = await apiClient.verifyCertificate(code.trim())
      setCert(r.certificate)
    } catch (err: any) {
      setError(err?.message || "We couldn't check that certificate.")
    } finally { setBusy(false) }
  }

  const bad = cert && (cert.reportedNow || cert.heldByProveOwnership || !cert.stillOwnedByIssuer || cert.ownershipLevel === 'disputed')
  const item = cert ? [cert.item.brand, cert.item.model].filter(Boolean).join(' ') || 'Item' : ''

  return (
    <Layout requireAuth>
      <div className="po-page po-single" style={{ maxWidth: 600 }}>
        <h1 className="po-hello">Verify a certificate</h1>
        <p className="po-muted" style={{ marginTop: -12, marginBottom: 20 }}>Buying from someone? Ask them to check the item on Prove Ownership and give you the certificate code. It's free to verify.</p>

        <form className="po-card" onSubmit={look}>
          <label className="po-label" htmlFor="cert-code">Certificate code</label>
          <div className="po-check-row">
            <input id="cert-code" className="modern-input po-mono po-check-input" autoComplete="off" autoCapitalize="characters" placeholder="PO-XXXX-XXXX"
              value={code} onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 14)); setError('') }} />
            <button type="submit" className="po-btn po-btn-primary" disabled={busy || code.replace(/[^A-Z0-9]/g, '').length < 10}>
              {busy ? <Loader2 size={18} className="po-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />} Verify
            </button>
          </div>
          {error && <p className="po-error" role="alert">{error}</p>}
        </form>

        {cert && (
          <section className={`po-result is-${bad ? 'danger' : 'success'}`} aria-live="polite" data-testid="certificate-result">
            <div className="po-result-icon">{bad ? <AlertTriangle size={30} aria-hidden="true" /> : <BadgeCheck size={30} aria-hidden="true" />}</div>
            <h2>{bad ? "Don't buy yet" : 'Certificate is genuine'}</h2>
            <p>
              {cert.reportedNow ? `This item is now reported ${cert.reportedNow}.`
                : cert.heldByProveOwnership ? 'This item is held by Prove Ownership after a report.'
                : !cert.stillOwnedByIssuer ? 'This item is no longer in the name of the person who made this certificate.'
                : cert.ownershipLevel === 'disputed' ? 'Someone else has claimed this item and our team is reviewing it.'
                : `${cert.ownerName || 'The owner'} checked this item on Prove Ownership and it is in their name.`}
            </p>
            <dl className="po-rows po-result-rows">
              <div><dt>Item</dt><dd>{item}{cert.item.identifierEnding ? <span className="po-mono"> (ends …{cert.item.identifierEnding})</span> : null}</dd></div>
              <div><dt>Owner</dt><dd>{cert.ownerName || '—'}</dd></div>
              <div><dt>Checked on</dt><dd>{new Date(cert.issuedAt).toLocaleString()}</dd></div>
              <div><dt>Code</dt><dd className="po-mono">{cert.code}</dd></div>
            </dl>
            {!bad && (
              <p className="po-result-action">Make sure the seller is <strong>{cert.ownerName}</strong> (ask for an ID) and that the IMEI or serial on the item ends with <strong>{cert.item.identifierEnding}</strong>. Then ask them to transfer it to you on Prove Ownership as you pay. <Link to="/transfer?tab=receive" className="po-link">Receive a transfer</Link></p>
            )}
          </section>
        )}
      </div>
    </Layout>
  )
}
