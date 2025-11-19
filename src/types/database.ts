export type UserRole = 'user' | 'business' | 'admin' | 'lea'
export type DeviceStatus = 'verified' | 'unverified' | 'stolen' | 'lost' | 'found' | 'pending_transfer'
export type ReportType = 'stolen' | 'lost' | 'found'
export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  verified_at?: string
  id_document_url?: string
  region?: string
  two_fa_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Device {
  id: string
  user_id: string
  imei?: string
  serial?: string
  brand: string
  model: string
  color?: string
  device_image_url?: string
  proof_url: string
  status: DeviceStatus
  verified_by?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  device_id: string
  report_type: ReportType
  reporter_id?: string
  description: string
  occurred_at: string
  location?: string
  evidence_url?: string
  status: ReportStatus
  case_id: string
  assigned_lea_id?: string
  created_at: string
  updated_at: string
  devices?: Device
}

export interface CheckResult {
  status: string
  message: string
  case_id?: string
  report_type?: string
  occurred_at?: string
  recovery_instructions?: string
}
