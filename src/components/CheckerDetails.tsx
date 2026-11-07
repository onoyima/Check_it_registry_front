// Who checked an item: their photo, account, where they were, and the
// browser and network they used. Shown to admins and the police.
import PrivateFile from './ownership/PrivateFile'

export type CheckRecord = {
  id?: string
  created_at?: string
  selfie_url?: string | null
  checker_name?: string | null
  checker_first_name?: string | null
  checker_middle_name?: string | null
  checker_last_name?: string | null
  checker_email?: string | null
  checker_phone?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  location_accuracy?: number | string | null
  ip_address?: string | null
  reported_ip?: string | null
  browser_device_id?: string | null
  user_agent?: string | null
  is_own_item?: number | boolean | null
  fee_paid?: number | string | null
  check_result?: string | null
  searched_identifier?: string | null
  query?: string | null
}

export const checkerName = (c: CheckRecord) =>
  [c.checker_first_name, c.checker_middle_name, c.checker_last_name].filter(Boolean).join(' ') || c.checker_name || 'Unknown'

export function CheckerPhoto({ url, size = 72 }: { url?: string | null; size?: number }) {
  return (
    <div className="po-checker-photo" style={{ width: size, height: size }}>
      {url ? <PrivateFile fileUrl={url} label="Photo of the person who checked" height={size} />
        : <div className="po-file po-file-empty small text-center" style={{ height: size }}>No photo</div>}
    </div>
  )
}

export default function CheckerDetails({ check }: { check: CheckRecord }) {
  const lat = check.latitude != null ? Number(check.latitude) : null
  const lng = check.longitude != null ? Number(check.longitude) : null
  const hasPlace = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
  return (
    <div className="po-checker" data-testid="checker-details">
      <CheckerPhoto url={check.selfie_url} />
      <div style={{ minWidth: 0 }}>
        <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{checkerName(check)}</div>
        <div className="small" style={{ color: 'var(--text-secondary)' }}>{[check.checker_email, check.checker_phone].filter(Boolean).join(' · ')}</div>
        <dl>
          {check.created_at && <><dt>When</dt><dd>{new Date(check.created_at).toLocaleString()}</dd></>}
          {(check.searched_identifier || check.query) && <><dt>Searched</dt><dd className="po-mono">{check.searched_identifier || check.query}</dd></>}
          <dt>Location</dt>
          <dd>{hasPlace
            ? <a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noreferrer">{lat!.toFixed(5)}, {lng!.toFixed(5)}</a>
            : 'Not recorded'}{check.location_accuracy != null ? ` (±${Math.round(Number(check.location_accuracy))} m)` : ''}</dd>
          <dt>IP address</dt><dd className="po-mono">{check.ip_address || 'Not recorded'}{check.reported_ip && check.reported_ip !== check.ip_address ? ` (browser said ${check.reported_ip})` : ''}</dd>
          <dt>Browser ID</dt><dd className="po-mono">{check.browser_device_id || 'Not recorded'}</dd>
          {check.user_agent && <><dt>Browser</dt><dd className="small">{check.user_agent}</dd></>}
          {check.is_own_item != null && <><dt>Whose item</dt><dd>{Number(check.is_own_item) ? 'Their own' : "Someone else's"}{check.fee_paid != null && Number(check.fee_paid) > 0 ? ` · paid ₦${Number(check.fee_paid).toLocaleString()}` : ''}</dd></>}
        </dl>
      </div>
    </div>
  )
}
