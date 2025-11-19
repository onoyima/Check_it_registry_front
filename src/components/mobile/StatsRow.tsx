import React from 'react'

interface StatItem {
  label: string
  value: number | string
  icon?: React.ReactNode
  color?: string
}

interface StatsRowProps {
  items: StatItem[]
  className?: string
}

export function StatsRow({ items, className }: StatsRowProps) {
  return (
    <div className={`d-flex gap-2 flex-wrap ${className || ''}`}>
      {items.map((it, idx) => (
        <div key={idx} className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
             style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
          {it.icon}
          <div>
            <div className="fw-semibold" style={{ fontSize: 13 }}>{String(it.value)}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{it.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}