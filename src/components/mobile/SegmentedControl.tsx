import React from 'react'

export interface SegmentedOption {
  key: string
  label: string
}

interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (key: string) => void
  className?: string
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={`d-flex gap-2 flex-wrap ${className || ''}`}>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`btn btn-sm ${value === opt.key ? 'btn-primary' : 'btn-outline-secondary'}`}
          style={{ borderRadius: 12 }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}