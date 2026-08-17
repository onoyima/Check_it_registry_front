import React from 'react'
import { CheckCircle, Shield, ShieldAlert } from 'lucide-react'

interface VerificationBadgeProps {
  verified: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function VerificationBadge({ verified, size = 'sm', showLabel = true, className = '' }: VerificationBadgeProps) {
  const sizeConfig = {
    sm: { icon: 14, fontSize: 11, padding: '2px 8px', gap: 4, borderRadius: 12 },
    md: { icon: 16, fontSize: 12, padding: '4px 12px', gap: 6, borderRadius: 14 },
    lg: { icon: 20, fontSize: 14, padding: '6px 16px', gap: 8, borderRadius: 16 },
  }
  const cfg = sizeConfig[size]

  if (verified) {
    return (
      <span
        className={`d-inline-flex align-items-center ${className}`}
        style={{
          gap: cfg.gap,
          background: 'rgba(16,185,129,0.1)',
          color: '#059669',
          borderRadius: cfg.borderRadius,
          padding: cfg.padding,
          fontSize: cfg.fontSize,
          fontWeight: 600,
          lineHeight: 1.4,
          whiteSpace: 'nowrap' as const,
        }}
        title="Verified Business"
      >
        <CheckCircle size={cfg.icon} />
        {showLabel && (size === 'lg' ? 'Verified Business' : 'Verified')}
      </span>
    )
  }

  return (
    <span
      className={`d-inline-flex align-items-center ${className}`}
      style={{
        gap: cfg.gap,
        background: 'rgba(245,158,11,0.1)',
        color: '#D97706',
        borderRadius: cfg.borderRadius,
        padding: cfg.padding,
        fontSize: cfg.fontSize,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap' as const,
      }}
      title="Not yet verified"
    >
      <ShieldAlert size={cfg.icon} />
      {showLabel && (size === 'lg' ? 'Unverified' : 'Unverified')}
    </span>
  )
}

export function MarketplaceSellerBadge({ verified, businessName }: { verified: boolean; businessName?: string }) {
  return (
    <div className="d-flex align-items-center gap-2">
      {businessName && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{businessName}</span>}
      <VerificationBadge verified={verified} size="sm" showLabel={false} />
    </div>
  )
}
