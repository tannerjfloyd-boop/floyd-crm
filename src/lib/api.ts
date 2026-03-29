import { supabase } from './supabase'

// UI display → DB value mappings
const LEAD_STATUS_TO_DB: Record<string, string> = {
  'New': 'new', 'Contacted': 'contacted', 'Pre-Approved': 'pre_approved',
  'Under Contract': 'under_contract', 'Closed': 'closed_won', 'Lost': 'lost',
}
const LEAD_STATUS_FROM_DB: Record<string, string> = {
  'new': 'New', 'contacted': 'Contacted', 'qualified': 'Contacted',
  'pre_qual': 'Pre-Approved', 'pre_approved': 'Pre-Approved',
  'under_contract': 'Under Contract', 'closed_won': 'Closed', 'lost': 'Lost', 'stale': 'Lost',
}
const LOAN_TYPE_FROM_DB: Record<string, string> = {
  'purchase': 'Purchase', 'refi': 'Refinance', 'cash_out': 'Cash-Out Refi',
  'heloc': 'HELOC', 'va_irrrl': 'VA IRRRL', 'fha_streamline': 'FHA Streamline',
  'usda': 'USDA', 'construction': 'Construction',
}
const LOAN_TYPE_TO_DB: Record<string, string> = {
  'Purchase': 'purchase', 'Refinance': 'refi', 'Cash-Out Refi': 'cash_out',
  'HELOC': 'heloc', 'VA IRRRL': 'va_irrrl', 'FHA Streamline': 'fha_streamline',
  'USDA': 'usda', 'Construction': 'construction',
}
const LOAN_STAGE_FROM_DB: Record<string, string> = {
  'application': 'Application', 'processing': 'Processing', 'underwriting': 'Underwriting',
  'suspended': 'Suspended', 'conditional_approval': 'Cond. Approval',
  'clear_to_close': 'Clear to Close', 'docs_out': 'Docs Out',
  'closing_scheduled': 'Closing Sched.', 'funded': 'Funded',
}
const REACTIVATION_STATUS_FROM_DB: Record<string, string> = {
  'not_contacted': 'Not Contacted', 'contacted': 'Contacted',
  'interested': 'Scheduled', 'not_interested': 'Not Interested',
}
const REACTIVATION_STATUS_TO_DB: Record<string, string> = {
  'Not Contacted': 'not_contacted', 'Contacted': 'contacted',
  'Scheduled': 'interested', 'Not Interested': 'not_interested',
}

// UI-facing types
export interface Contact {
  id: string; full_name: string; email: string; phone: string
  contact_type: string; source?: string | null; created_at: string
  last_contacted?: string | null; notes?: string | null
}
export interface Lead {
  id: string; contact_id: string; contact_name: string
  loan_type: string; loan_amount: number
  stage: 'New' | 'Contacted' | 'Pre-Approved' | 'Under Contract' | 'Closed' | 'Lost'
  temperature: 'hot' | 'warm' | 'cold'; next_follow_up: string
  lead_source: string; created_at: string
}
export interface PipelineLoan {
  id: string; lead_id: string; borrower_name: string; loan_stage: string
  lender: string; loan_amount: number
  lock_status: 'locked' | 'floating' | 'expired' | 'lock_pending' | 'lock_extended' | 'relocked'
  est_close_date: string; created_at?: string
}
export interface Partner {
  id: string; contact_id: string; name: string; email: string; phone: string
  company: string; partner_type: string
  tier: 'A' | 'B' | 'C'; deals_closed: number
  last_deal_date: string | null; next_touchpoint: string; notes?: string | null
}
export interface PastClient {
  id: string; contact_id: string; name: string; property_address: string
  original_close_date: string; current_rate: number; estimated_equity: number
  refi_eligible: boolean
  reactivation_status: 'Not Contacted' | 'Contacted' | 'Scheduled' | 'Not Interested'
  life_events: string[]; last_contacted: string | null
}
export interface Activity {
  id: string; contact_id: string
  type: 'call' | 'email' | 'text' | 'meeting' | 'note' | string
  description: string; created_at: string
}
export interface DashboardStats {
  newLeadsThisWeek: number; pipelineVolume: number
  dealsClosingThisMonth: number; activityCountThisWeek: number
  pipelineByStage: { stage: string; count: number; value: number }[]
  leadSourceBreakdown: { source: string; count: number; value: number }[]
}

// ── Contacts ────────────────────────────────────────────────────────────────

export async function getContacts(): Promise<Contact[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Contact[]
}

export async function getContact(id: string): Promise<Contact | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Contact | null
}

export async function createContact(params: {
  full_name: string; email: string; phone: string; contact_type: string
  source?: string | null; notes?: string | null
}): Promise<Contact> {
  if (!supabase) throw new Error('Supabase not connected')
  const { data, error } = await supabase
    .from('contacts')
    .insert(params)
    .select()
    .single()
  if (error) throw error
  return data as Contact
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('contacts').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteContact(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw error
}

// ── Leads ────────────────────────────────────────────────────────────────────

function mapLeadRow(row: Record<string, unknown>): Lead {
  const contacts = row.contacts as { full_name?: string; source?: string } | null
  const dbStatus = String(row.lead_status ?? '')
  const dbLoanType = String(row.loan_type ?? '')
  return {
    id: String(row.id),
    contact_id: String(row.contact_id),
    contact_name: contacts?.full_name ?? 'Unknown',
    loan_type: LOAN_TYPE_FROM_DB[dbLoanType] ?? (dbLoanType.charAt(0).toUpperCase() + dbLoanType.slice(1)),
    loan_amount: Number(row.loan_amount ?? 0),
    stage: (LEAD_STATUS_FROM_DB[dbStatus] ?? 'New') as Lead['stage'],
    temperature: (row.temperature as Lead['temperature']) ?? 'warm',
    next_follow_up: String(row.next_follow_up ?? ''),
    lead_source: contacts?.source ?? 'Unknown',
    created_at: String(row.created_at ?? ''),
  }
}

export async function getLeads(): Promise<Lead[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('leads')
    .select('*, contacts(full_name, source)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => mapLeadRow(row as Record<string, unknown>))
}

export async function getLead(id: string): Promise<Lead | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('leads')
    .select('*, contacts(full_name, source)')
    .eq('id', id)
    .single()
  if (error) throw error
  if (!data) return null
  return mapLeadRow(data as Record<string, unknown>)
}

export async function createLead(params: {
  contact_id: string; loan_type: string; loan_amount: number
  stage?: string; temperature?: string; next_follow_up?: string
}): Promise<Lead> {
  if (!supabase) throw new Error('Supabase not connected')
  const insertPayload: Record<string, unknown> = {
    contact_id: params.contact_id,
    loan_type: LOAN_TYPE_TO_DB[params.loan_type] ?? params.loan_type,
    loan_amount: params.loan_amount,
    lead_status: LEAD_STATUS_TO_DB[params.stage ?? 'New'] ?? 'new',
    temperature: params.temperature ?? 'warm',
  }
  if (params.next_follow_up) insertPayload.next_follow_up = params.next_follow_up
  const { data, error } = await supabase
    .from('leads')
    .insert(insertPayload)
    .select('*, contacts(full_name, source)')
    .single()
  if (error) throw error
  return mapLeadRow(data as Record<string, unknown>)
}

export async function updateLead(
  id: string,
  updates: Partial<{ stage: string; temperature: string; next_follow_up: string; loan_amount: number }>
): Promise<void> {
  if (!supabase) return
  const dbUpdates: Record<string, unknown> = {}
  if (updates.stage !== undefined) dbUpdates.lead_status = LEAD_STATUS_TO_DB[updates.stage] ?? updates.stage
  if (updates.temperature !== undefined) dbUpdates.temperature = updates.temperature
  if (updates.next_follow_up !== undefined) dbUpdates.next_follow_up = updates.next_follow_up
  if (updates.loan_amount !== undefined) dbUpdates.loan_amount = updates.loan_amount
  const { error } = await supabase.from('leads').update(dbUpdates).eq('id', id)
  if (error) throw error
}

export async function deleteLead(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

// ── Pipeline ─────────────────────────────────────────────────────────────────

function mapPipelineRow(row: Record<string, unknown>): PipelineLoan {
  const leads = row.leads as { contacts?: { full_name?: string } } | null
  const dbStage = String(row.loan_stage ?? '')
  return {
    id: String(row.id),
    lead_id: String(row.lead_id),
    borrower_name: leads?.contacts?.full_name ?? 'Unknown',
    loan_stage: LOAN_STAGE_FROM_DB[dbStage] ?? dbStage,
    lender: String(row.lender ?? ''),
    loan_amount: Number(row.loan_amount ?? 0),
    lock_status: (row.lock_status as PipelineLoan['lock_status']) ?? 'floating',
    est_close_date: String(row.est_close_date ?? ''),
    created_at: String(row.created_at ?? ''),
  }
}

export async function getPipelineLoans(): Promise<PipelineLoan[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('pipeline')
    .select('*, leads!lead_id(contact_id, contacts!contact_id(full_name))')
    .order('est_close_date', { ascending: true })
  if (error) throw error
  return (data ?? []).map(row => mapPipelineRow(row as Record<string, unknown>))
}

export async function createPipelineLoan(params: {
  lead_id: string; loan_stage: string; lender?: string
  loan_amount: number; lock_status?: string; est_close_date?: string
}): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('pipeline').insert(params)
  if (error) throw error
}

export async function updatePipelineLoan(
  id: string,
  updates: Partial<{
    loan_stage: string; lender: string; loan_amount: number
    lock_status: string; est_close_date: string; processor_notes: string
  }>
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('pipeline').update(updates).eq('id', id)
  if (error) throw error
}

// ── Referral Partners ─────────────────────────────────────────────────────────

function mapPartnerRow(row: Record<string, unknown>): Partner {
  const contacts = row.contacts as { full_name?: string; email?: string; phone?: string } | null
  return {
    id: String(row.id),
    contact_id: String(row.contact_id),
    name: contacts?.full_name ?? 'Unknown',
    email: contacts?.email ?? '',
    phone: contacts?.phone ?? '',
    company: String(row.company ?? ''),
    partner_type: String(row.partner_type ?? ''),
    tier: (row.relationship_tier as Partner['tier']) ?? 'C',
    deals_closed: Number(row.deals_closed_together ?? 0),
    last_deal_date: (row.last_deal_date as string | null) ?? null,
    next_touchpoint: String(row.next_touchpoint ?? ''),
    notes: (row.notes as string | null) ?? null,
  }
}

export async function getPartners(): Promise<Partner[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('referral_partners')
    .select('*, contacts!contact_id(full_name, email, phone)')
    .order('deals_closed_together', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => mapPartnerRow(row as Record<string, unknown>))
}

export async function createPartner(params: {
  contact_id: string; company: string; partner_type: string; relationship_tier?: string
}): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('referral_partners').insert(params)
  if (error) throw error
}

export async function updatePartner(
  id: string,
  updates: Partial<{
    company: string; partner_type: string; relationship_tier: string
    deals_closed_together: number; last_deal_date: string; next_touchpoint: string; notes: string
  }>
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('referral_partners').update(updates).eq('id', id)
  if (error) throw error
}

// ── Past Clients ──────────────────────────────────────────────────────────────

function mapPastClientRow(row: Record<string, unknown>): PastClient {
  const contacts = row.contacts as { full_name?: string; notes?: string } | null
  const dbStatus = String(row.reactivation_status ?? 'not_contacted')
  return {
    id: String(row.id),
    contact_id: String(row.contact_id),
    name: contacts?.full_name ?? 'Unknown',
    property_address: contacts?.notes ?? '',
    original_close_date: String(row.original_close_date ?? ''),
    current_rate: Number(row.current_rate ?? 0),
    estimated_equity: Number(row.estimated_equity ?? 0),
    refi_eligible: Boolean(row.refi_eligible),
    reactivation_status: (REACTIVATION_STATUS_FROM_DB[dbStatus] ?? 'Not Contacted') as PastClient['reactivation_status'],
    life_events: (row.life_event_flags as string[]) ?? [],
    last_contacted: (row.last_reactivation_attempt as string | null) ?? null,
  }
}

export async function getPastClients(): Promise<PastClient[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('past_clients')
    .select('*, contacts!contact_id(full_name, notes)')
    .order('original_close_date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => mapPastClientRow(row as Record<string, unknown>))
}

export async function updatePastClient(
  id: string,
  updates: Partial<{
    reactivation_status: string; last_reactivation_attempt: string
    refi_eligible: boolean; life_event_flags: string[]
  }>
): Promise<void> {
  if (!supabase) return
  const dbUpdates: Record<string, unknown> = { ...updates }
  if (updates.reactivation_status !== undefined) {
    dbUpdates.reactivation_status = REACTIVATION_STATUS_TO_DB[updates.reactivation_status] ?? updates.reactivation_status
  }
  const { error } = await supabase.from('past_clients').update(dbUpdates).eq('id', id)
  if (error) throw error
}

// ── Activity Log ──────────────────────────────────────────────────────────────

function mapActivityRow(row: Record<string, unknown>): Activity {
  return {
    id: String(row.id),
    contact_id: String(row.contact_id),
    type: String(row.activity_type ?? 'note'),
    description: String(row.summary ?? ''),
    created_at: String(row.created_at ?? ''),
  }
}

export async function getActivities(contactId?: string): Promise<Activity[]> {
  if (!supabase) return []
  let query = supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
  if (contactId) {
    query = query.eq('contact_id', contactId)
  }
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(row => mapActivityRow(row as Record<string, unknown>))
}

export async function logActivity(params: {
  contact_id: string; type: string; summary: string
}): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('activity_log').insert({
    contact_id: params.contact_id,
    activity_type: params.type,
    summary: params.summary,
  })
  if (error) throw error
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!supabase) {
    return {
      newLeadsThisWeek: 0, pipelineVolume: 0,
      dealsClosingThisMonth: 0, activityCountThisWeek: 0,
      pipelineByStage: [], leadSourceBreakdown: [],
    }
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const [
    newLeadsRes,
    pipelineAmountsRes,
    closingThisMonthRes,
    activityCountRes,
    stageBreakdownRes,
    sourceBreakdownRes,
  ] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('pipeline').select('loan_amount'),
    supabase.from('pipeline').select('id', { count: 'exact', head: true })
      .gte('est_close_date', monthStart).lte('est_close_date', monthEnd),
    supabase.from('activity_log').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('leads').select('lead_status, loan_amount'),
    supabase.from('leads').select('loan_amount, contacts!contact_id(source)'),
  ])

  const pipelineVolume = (pipelineAmountsRes.data ?? []).reduce(
    (sum, row) => sum + Number((row as { loan_amount?: number }).loan_amount ?? 0), 0
  )

  // Group pipeline by stage
  const stageMap: Record<string, { count: number; value: number }> = {}
  for (const row of (stageBreakdownRes.data ?? []) as Array<{ lead_status?: string; loan_amount?: number }>) {
    const uiStage = LEAD_STATUS_FROM_DB[row.lead_status ?? ''] ?? row.lead_status ?? 'Unknown'
    if (!stageMap[uiStage]) stageMap[uiStage] = { count: 0, value: 0 }
    stageMap[uiStage].count += 1
    stageMap[uiStage].value += Number(row.loan_amount ?? 0)
  }
  const pipelineByStage = Object.entries(stageMap).map(([stage, v]) => ({ stage, ...v }))

  // Group by lead source
  const sourceMap: Record<string, { count: number; value: number }> = {}
  for (const row of (sourceBreakdownRes.data ?? []) as Array<{ loan_amount?: number; contacts?: { source?: string } | null }>) {
    const src = row.contacts?.source ?? 'other'
    if (!sourceMap[src]) sourceMap[src] = { count: 0, value: 0 }
    sourceMap[src].count += 1
    sourceMap[src].value += Number(row.loan_amount ?? 0)
  }
  const leadSourceBreakdown = Object.entries(sourceMap).map(([source, v]) => ({ source, ...v }))

  return {
    newLeadsThisWeek: newLeadsRes.count ?? 0,
    pipelineVolume,
    dealsClosingThisMonth: closingThisMonthRes.count ?? 0,
    activityCountThisWeek: activityCountRes.count ?? 0,
    pipelineByStage,
    leadSourceBreakdown,
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

export async function isDBEmpty(): Promise<boolean> {
  if (!supabase) return false
  const { count, error } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
  if (error) return false
  return (count ?? 0) === 0
}
