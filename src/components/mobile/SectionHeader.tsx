import React from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, actions, className }: SectionHeaderProps) {
  return (
    <div className={`d-flex justify-content-between align-items-center ${className || ''}`}> 
      <div>
        <h2 className="h5 fw-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}