// Admin: every price Prove Ownership charges, in one place. Nothing is
// charged at an amount that isn't set here; a price that isn't set yet
// stops that action until it is.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Tag, AlertTriangle, Save } from 'lucide-react'
import { Layout } from '../components/Layout'
import { apiClient } from '../lib/apiClient'

type Price = { key: string; label: string; help?: string; unit: 'naira' | 'percent' | 'count'; value: number | null; updated_at?: string | null }

const show = (p: Price) => p.value == null ? 'Not set'
  : p.unit === 'naira' ? `₦${p.value.toLocaleString()}` : p.unit === 'percent' ? `${p.value}%` : String(p.value)

export default function AdminPrices() {
  const [prices, setPrices] = useState<Price[]>([])
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')

  const load = () => apiClient.revenue.listPrices()
    .then((b: any) => {
      setPrices(b.prices || [])
      setDraft(Object.fromEntries((b.prices || []).map((p: Price) => [p.key, p.value == null ? '' : String(p.value)])))
    })
    .catch(() => setErr({ _: 'Could not load the prices' }))
    .finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async (p: Price) => {
    setBusy(p.key); setErr({}); setMsg('')
    try {
      await apiClient.revenue.setPrice(p.key, draft[p.key])
      setMsg(`Saved: ${p.label}.`)
      await load()
    } catch (e: any) {
      setErr({ [p.key]: e?.message || 'Could not save it' })
    } finally { setBusy('') }
  }

  const missing = prices.filter((p) => p.value == null)

  return (
    <Layout requireAuth>
      <div className="po-page po-single" style={{ maxWidth: 820 }}>
        <h1 className="po-hello">Prices</h1>
        <p className="po-muted" style={{ marginTop: -12 }}>Everything Prove Ownership charges. Fees are paid with Paystack; the marketplace commission comes out of the seller's payout. A price of 0 means free.</p>

        {missing.length > 0 && (
          <div className="po-alert po-alert-warning mb-3" role="status" data-testid="prices-missing">
            <AlertTriangle size={18} aria-hidden="true" /> {missing.length === 1 ? '1 price is' : `${missing.length} prices are`} not set. Until it's set, the action that needs it is refused: {missing.map((p) => p.label).join(', ')}.
          </div>
        )}
        {msg && <p className="po-text-success" role="status">{msg}</p>}
        {err._ && <p className="po-error" role="alert">{err._}</p>}

        {loading ? <div className="po-center py-5"><Loader2 size={28} className="po-spin" aria-label="Loading" /></div> : (
          <section className="po-card" data-testid="prices">
            <h2 className="po-card-title"><Tag size={18} aria-hidden="true" /> Price list</h2>
            {prices.map((p) => {
              const changed = (draft[p.key] ?? '') !== (p.value == null ? '' : String(p.value))
              return (
                <form key={p.key} className="po-price-row" onSubmit={(e) => { e.preventDefault(); save(p) }} data-testid={`price-${p.key}`}>
                  <div className="po-price-main">
                    <label htmlFor={`price-${p.key}`} className="fw-semibold d-block" style={{ color: 'var(--text-primary)' }}>{p.label}</label>
                    {p.help && <span className="small" style={{ color: 'var(--text-secondary)' }}>{p.help}</span>}
                    <div className="small mt-1">Now: <strong className={p.value == null ? 'text-danger' : ''}>{show(p)}</strong></div>
                    {err[p.key] && <p className="po-error mb-0" role="alert">{err[p.key]}</p>}
                  </div>
                  <div className="po-price-input">
                    {p.unit === 'naira' && <span aria-hidden="true">₦</span>}
                    <input id={`price-${p.key}`} className="modern-input po-mono" inputMode="decimal" autoComplete="off"
                      placeholder={p.unit === 'count' ? 'e.g. 3' : p.unit === 'percent' ? 'e.g. 5' : 'Amount'}
                      value={draft[p.key] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [p.key]: e.target.value.replace(/[^0-9.]/g, '').slice(0, 12) }))} />
                    {p.unit === 'percent' && <span aria-hidden="true">%</span>}
                  </div>
                  <button type="submit" className="po-btn po-btn-primary" disabled={!!busy || !changed || (draft[p.key] ?? '') === ''} aria-label={`Save ${p.label}`}>
                    {busy === p.key ? <Loader2 size={16} className="po-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Save
                  </button>
                </form>
              )
            })}
          </section>
        )}
        <p className="po-muted small mt-3">Who handles marketplace payments is set in <Link to="/admin/modules">Modules & payments</Link>. Income is on <Link to="/admin/revenue">Fees & revenue</Link>.</p>
      </div>
    </Layout>
  )
}
