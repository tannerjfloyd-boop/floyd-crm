export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  type: 'lead' | 'client' | 'partner'
  created_at: string
}

export interface Lead {
  id: string
  contact_id: string
  contact_name: string
  loan_type: string
  loan_amount: number
  stage: 'New' | 'Contacted' | 'Pre-Approved' | 'Under Contract' | 'Closed' | 'Lost'
  temperature: 'hot' | 'warm' | 'cold'
  next_follow_up: string
  lead_source: string
  created_at: string
}

export interface Loan {
  id: string
  borrower_name: string
  loan_stage: string
  lender: string
  loan_amount: number
  lock_status: 'locked' | 'floating' | 'expired'
  est_close_date: string
  created_at: string
}

export interface Partner {
  id: string
  name: string
  company: string
  partner_type: string
  tier: 'A' | 'B' | 'C'
  deals_closed: number
  last_deal_date: string | null
  next_touchpoint: string
  created_at: string
}

export interface PastClient {
  id: string
  name: string
  original_close_date: string
  current_rate: number
  estimated_equity: number
  refi_eligible: boolean
  reactivation_status: 'Not Contacted' | 'Contacted' | 'Scheduled' | 'Not Interested'
  life_events: string[]
  last_contacted: string | null
  property_address: string
}

export interface Activity {
  id: string
  contact_id: string
  type: 'call' | 'email' | 'text' | 'meeting' | 'note'
  description: string
  created_at: string
}

// Mock Data
export const mockContacts: Contact[] = [
  { id: '1', name: 'Sarah Martinez', email: 'sarah.martinez@email.com', phone: '(678) 555-0101', type: 'lead', created_at: '2026-03-20' },
  { id: '2', name: 'James Chen', email: 'james.chen@email.com', phone: '(770) 555-0102', type: 'lead', created_at: '2026-03-19' },
  { id: '3', name: 'Emily Thompson', email: 'emily.t@email.com', phone: '(404) 555-0103', type: 'client', created_at: '2026-02-15' },
  { id: '4', name: 'Michael Roberts', email: 'mroberts@email.com', phone: '(678) 555-0104', type: 'lead', created_at: '2026-03-21' },
  { id: '5', name: 'Lisa Anderson', email: 'lisa.anderson@email.com', phone: '(770) 555-0105', type: 'partner', created_at: '2025-06-10' },
  { id: '6', name: 'David Park', email: 'dpark@email.com', phone: '(404) 555-0106', type: 'lead', created_at: '2026-03-18' },
  { id: '7', name: 'Jennifer Wilson', email: 'jwilson@email.com', phone: '(678) 555-0107', type: 'client', created_at: '2025-11-22' },
  { id: '8', name: 'Robert Taylor', email: 'rtaylor@email.com', phone: '(770) 555-0108', type: 'lead', created_at: '2026-03-22' },
]

export const mockLeads: Lead[] = [
  { id: '1', contact_id: '1', contact_name: 'Sarah Martinez', loan_type: 'Purchase', loan_amount: 425000, stage: 'New', temperature: 'hot', next_follow_up: '2026-03-26', lead_source: 'Realtor Referral', created_at: '2026-03-20' },
  { id: '2', contact_id: '2', contact_name: 'James Chen', loan_type: 'Refinance', loan_amount: 350000, stage: 'Contacted', temperature: 'warm', next_follow_up: '2026-03-27', lead_source: 'Website', created_at: '2026-03-19' },
  { id: '3', contact_id: '4', contact_name: 'Michael Roberts', loan_type: 'Purchase', loan_amount: 575000, stage: 'Pre-Approved', temperature: 'hot', next_follow_up: '2026-03-25', lead_source: 'Past Client', created_at: '2026-03-21' },
  { id: '4', contact_id: '6', contact_name: 'David Park', loan_type: 'Cash-Out Refi', loan_amount: 285000, stage: 'Contacted', temperature: 'warm', next_follow_up: '2026-03-28', lead_source: 'Facebook Ad', created_at: '2026-03-18' },
  { id: '5', contact_id: '8', contact_name: 'Robert Taylor', loan_type: 'Purchase', loan_amount: 650000, stage: 'Under Contract', temperature: 'hot', next_follow_up: '2026-03-26', lead_source: 'Realtor Referral', created_at: '2026-03-22' },
]

export const mockLoans: Loan[] = [
  { id: '1', borrower_name: 'Michael Roberts', loan_stage: 'Processing', lender: 'Rocket Mortgage', loan_amount: 575000, lock_status: 'locked', est_close_date: '2026-04-15', created_at: '2026-03-10' },
  { id: '2', borrower_name: 'Robert Taylor', loan_stage: 'Underwriting', lender: 'Better.com', loan_amount: 650000, lock_status: 'floating', est_close_date: '2026-04-20', created_at: '2026-03-15' },
  { id: '3', borrower_name: 'Emily Thompson', loan_stage: 'Clear to Close', lender: 'LoanDepot', loan_amount: 425000, lock_status: 'locked', est_close_date: '2026-03-30', created_at: '2026-02-15' },
  { id: '4', borrower_name: 'Jennifer Wilson', loan_stage: 'Processing', lender: 'Quicken Loans', loan_amount: 380000, lock_status: 'expired', est_close_date: '2026-04-10', created_at: '2026-03-01' },
]

export const mockPartners: Partner[] = [
  { id: '1', name: 'Lisa Anderson', company: 'Berkshire Hathaway', partner_type: 'Realtor', tier: 'A', deals_closed: 23, last_deal_date: '2026-03-10', next_touchpoint: '2026-03-28', created_at: '2024-01-15' },
  { id: '2', name: 'Tom Harrison', company: 'Keller Williams', partner_type: 'Realtor', tier: 'A', deals_closed: 18, last_deal_date: '2026-02-28', next_touchpoint: '2026-03-30', created_at: '2024-03-20' },
  { id: '3', name: 'Angela Brooks', company: 'RE/MAX', partner_type: 'Realtor', tier: 'B', deals_closed: 9, last_deal_date: '2026-01-15', next_touchpoint: '2026-04-01', created_at: '2024-06-10' },
  { id: '4', name: 'Kevin Martinez', company: 'Century 21', partner_type: 'Realtor', tier: 'B', deals_closed: 7, last_deal_date: '2025-12-20', next_touchpoint: '2026-04-05', created_at: '2024-08-05' },
  { id: '5', name: 'Rachel Kim', company: 'Coldwell Banker', partner_type: 'Realtor', tier: 'C', deals_closed: 3, last_deal_date: '2025-10-10', next_touchpoint: '2026-04-10', created_at: '2025-02-01' },
  { id: '6', name: 'Steve Johnson', company: 'HomeBuilders Inc', partner_type: 'Builder', tier: 'A', deals_closed: 15, last_deal_date: '2026-03-05', next_touchpoint: '2026-03-27', created_at: '2024-04-12' },
]

export const mockPastClients: PastClient[] = [
  { id: '1', name: 'Emily Thompson', original_close_date: '2023-06-15', current_rate: 6.75, estimated_equity: 125000, refi_eligible: true, reactivation_status: 'Not Contacted', life_events: ['Job Change'], last_contacted: null, property_address: '1234 Peachtree St, Atlanta, GA 30309' },
  { id: '2', name: 'Jennifer Wilson', original_close_date: '2023-08-22', current_rate: 7.125, estimated_equity: 95000, refi_eligible: true, reactivation_status: 'Contacted', life_events: [], last_contacted: '2026-03-15', property_address: '5678 Roswell Rd, Alpharetta, GA 30022' },
  { id: '3', name: 'Carlos Diaz', original_close_date: '2024-01-10', current_rate: 6.5, estimated_equity: 60000, refi_eligible: false, reactivation_status: 'Not Contacted', life_events: ['New Baby'], last_contacted: null, property_address: '910 Main St, Marietta, GA 30060' },
  { id: '4', name: 'Amanda Foster', original_close_date: '2023-03-18', current_rate: 7.25, estimated_equity: 140000, refi_eligible: true, reactivation_status: 'Scheduled', life_events: ['Marriage'], last_contacted: '2026-03-20', property_address: '2345 Northside Dr, Atlanta, GA 30305' },
  { id: '5', name: 'Brian Lewis', original_close_date: '2023-11-05', current_rate: 6.875, estimated_equity: 80000, refi_eligible: true, reactivation_status: 'Not Interested', life_events: [], last_contacted: '2026-02-28', property_address: '6789 Windward Pkwy, Alpharetta, GA 30005' },
]

export const mockActivities: Activity[] = [
  { id: '1', contact_id: '1', type: 'call', description: 'Initial consultation - discussed purchase timeline', created_at: '2026-03-20T10:30:00' },
  { id: '2', contact_id: '1', type: 'email', description: 'Sent pre-approval requirements', created_at: '2026-03-20T14:15:00' },
  { id: '3', contact_id: '2', type: 'call', description: 'Discussed refinance options and current rates', created_at: '2026-03-19T11:00:00' },
  { id: '4', contact_id: '3', type: 'meeting', description: 'Closing appointment at title office', created_at: '2026-02-15T15:00:00' },
  { id: '5', contact_id: '4', type: 'text', description: 'Confirmed appointment for tomorrow', created_at: '2026-03-21T16:45:00' },
  { id: '6', contact_id: '6', type: 'note', description: 'Interested in cash-out refi for home improvements', created_at: '2026-03-18T09:20:00' },
]

// KPI Mock Data
export const mockKPIs = {
  newLeadsThisWeek: 8,
  pipelineVolume: 2030000,
  dealsClosingThisMonth: 4,
  reactivationTouchesThisWeek: 12,
}

export const mockPipelineByStage = [
  { stage: 'New', count: 3, value: 1250000 },
  { stage: 'Contacted', count: 5, value: 1835000 },
  { stage: 'Pre-Approved', count: 4, value: 2100000 },
  { stage: 'Under Contract', count: 3, value: 1655000 },
]

export const mockLeadSourceBreakdown = [
  { source: 'Realtor Referral', count: 12, value: 45 },
  { source: 'Past Client', count: 8, value: 30 },
  { source: 'Website', count: 4, value: 15 },
  { source: 'Facebook Ad', count: 3, value: 10 },
]
