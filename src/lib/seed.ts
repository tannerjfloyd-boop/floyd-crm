import { supabase } from './supabase'
import {
  mockContacts,
  mockLeads,
  mockLoans,
  mockPartners,
  mockPastClients,
  mockActivities,
} from './mockData'

// ── Mapping helpers ───────────────────────────────────────────────────────────

function mapContactType(type: string): string {
  const map: Record<string, string> = {
    'lead': 'lead',
    'client': 'past_client',
    'partner': 'referral_partner',
  }
  return map[type] ?? 'lead'
}

function mapLeadStatus(stage: string): string {
  const map: Record<string, string> = {
    'New': 'new', 'Contacted': 'contacted', 'Pre-Approved': 'pre_approved',
    'Under Contract': 'under_contract', 'Closed': 'closed_won', 'Lost': 'lost',
  }
  return map[stage] ?? 'new'
}

function mapLoanType(loanType: string): string {
  const map: Record<string, string> = {
    'Purchase': 'purchase', 'Refinance': 'refi', 'Cash-Out Refi': 'cash_out',
    'HELOC': 'heloc', 'VA IRRRL': 'va_irrrl', 'FHA Streamline': 'fha_streamline',
    'USDA': 'usda', 'Construction': 'construction',
  }
  return map[loanType] ?? 'purchase'
}

function mapPartnerType(partnerType: string): string {
  const map: Record<string, string> = {
    'Realtor': 'agent', 'Builder': 'builder',
    'Financial Planner': 'financial_planner', 'Attorney': 'attorney',
  }
  return map[partnerType] ?? 'agent'
}

function mapLoanStage(stage: string): string {
  const map: Record<string, string> = {
    'Processing': 'processing', 'Underwriting': 'underwriting',
    'Clear to Close': 'clear_to_close', 'Application': 'application',
    'Suspended': 'suspended', 'Cond. Approval': 'conditional_approval',
    'Docs Out': 'docs_out', 'Closing Sched.': 'closing_scheduled', 'Funded': 'funded',
  }
  return map[stage] ?? 'processing'
}

function mapLeadSource(source: string): string {
  const map: Record<string, string> = {
    'Realtor Referral': 'realtor_referral',
    'Website': 'website',
    'Past Client': 'past_client_referral',
    'Facebook Ad': 'social_media',
  }
  return map[source] ?? 'other'
}

function mapReactivationStatus(status: string): string {
  const map: Record<string, string> = {
    'Not Contacted': 'not_contacted',
    'Contacted': 'contacted',
    'Scheduled': 'interested',
    'Not Interested': 'not_interested',
  }
  return map[status] ?? 'not_contacted'
}

// ── Seed function ─────────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<void> {
  if (!supabase) throw new Error('Supabase not connected')

  // ── Step 1: Build contact rows ──────────────────────────────────────────────

  // Find source for lead contacts from mockLeads
  const leadSourceByContactId: Record<string, string> = {}
  for (const lead of mockLeads) {
    if (!leadSourceByContactId[lead.contact_id]) {
      leadSourceByContactId[lead.contact_id] = mapLeadSource(lead.lead_source)
    }
  }

  // Past client property_address lookup
  const pastClientAddressByName: Record<string, string> = {}
  for (const pc of mockPastClients) {
    pastClientAddressByName[pc.name] = pc.property_address
  }

  // Build rows from mockContacts
  const contactRows: Array<{
    full_name: string; email: string; phone: string
    contact_type: string; source?: string; notes?: string
    created_at: string; _mockKey: string
  }> = mockContacts.map(c => {
    const row: {
      full_name: string; email: string; phone: string
      contact_type: string; source?: string; notes?: string
      created_at: string; _mockKey: string
    } = {
      full_name: c.name,
      email: c.email,
      phone: c.phone,
      contact_type: mapContactType(c.type),
      created_at: c.created_at,
      _mockKey: c.id,
    }
    // Set source for lead contacts
    if (c.type === 'lead' && leadSourceByContactId[c.id]) {
      row.source = leadSourceByContactId[c.id]
    }
    // Set notes (property_address) for past client contacts
    if (c.type === 'client' && pastClientAddressByName[c.name]) {
      row.notes = pastClientAddressByName[c.name]
    }
    return row
  })

  // Extra partner contacts not in mockContacts
  const extraPartnerContacts = [
    { _mockKey: 'p2', full_name: 'Tom Harrison', email: 'tom.harrison@kellerwilliams.com', phone: '(770) 555-0201', contact_type: 'referral_partner', created_at: '2024-03-20' },
    { _mockKey: 'p3', full_name: 'Angela Brooks', email: 'angela.brooks@remax.com', phone: '(404) 555-0202', contact_type: 'referral_partner', created_at: '2024-06-10' },
    { _mockKey: 'p4', full_name: 'Kevin Martinez', email: 'kevin.martinez@century21.com', phone: '(678) 555-0203', contact_type: 'referral_partner', created_at: '2024-08-05' },
    { _mockKey: 'p5', full_name: 'Rachel Kim', email: 'rachel.kim@coldwellbanker.com', phone: '(770) 555-0204', contact_type: 'referral_partner', created_at: '2025-02-01' },
    { _mockKey: 'p6', full_name: 'Steve Johnson', email: 'steve.johnson@homebuildersInc.com', phone: '(404) 555-0205', contact_type: 'referral_partner', created_at: '2024-04-12' },
  ]

  // Extra past client contacts not in mockContacts
  const extraPastClientContacts = [
    { _mockKey: 'pc3', full_name: 'Carlos Diaz', email: 'carlos.diaz@email.com', phone: '(678) 555-0301', contact_type: 'past_client', notes: pastClientAddressByName['Carlos Diaz'] ?? '', created_at: '2024-01-10' },
    { _mockKey: 'pc4', full_name: 'Amanda Foster', email: 'amanda.foster@email.com', phone: '(770) 555-0302', contact_type: 'past_client', notes: pastClientAddressByName['Amanda Foster'] ?? '', created_at: '2023-03-18' },
    { _mockKey: 'pc5', full_name: 'Brian Lewis', email: 'brian.lewis@email.com', phone: '(404) 555-0303', contact_type: 'past_client', notes: pastClientAddressByName['Brian Lewis'] ?? '', created_at: '2023-11-05' },
  ]

  const allContactRows = [
    ...contactRows,
    ...extraPartnerContacts,
    ...extraPastClientContacts,
  ]

  // Strip _mockKey before inserting
  const contactsToInsert = allContactRows.map(({ _mockKey: _k, ...rest }) => rest)

  console.log('Seeding contacts...')
  const { data: insertedContacts, error: contactsError } = await supabase
    .from('contacts')
    .insert(contactsToInsert)
    .select()
  if (contactsError) {
    console.error('Error inserting contacts:', contactsError)
    throw contactsError
  }

  // Build contactIdMap: _mockKey → real UUID
  const contactIdMap: Record<string, string> = {}
  const insertedContactsTyped = (insertedContacts ?? []) as Array<{ id: string; full_name: string }>

  // Map using the order of allContactRows (Supabase insert returns in same order)
  allContactRows.forEach((row, idx) => {
    const inserted = insertedContactsTyped[idx]
    if (inserted) {
      contactIdMap[row._mockKey] = inserted.id
    }
  })

  // ── Step 2: Insert leads ────────────────────────────────────────────────────

  type LeadInsert = {
    contact_id: string; loan_type: string; loan_amount: number
    lead_status: string; temperature: string; next_follow_up?: string; created_at: string
    _leadKey: string
  }

  const leadsToInsert: LeadInsert[] = mockLeads.map(lead => ({
    contact_id: contactIdMap[lead.contact_id],
    loan_type: mapLoanType(lead.loan_type),
    loan_amount: lead.loan_amount,
    lead_status: mapLeadStatus(lead.stage),
    temperature: lead.temperature,
    next_follow_up: lead.next_follow_up,
    created_at: lead.created_at,
    _leadKey: lead.contact_id, // use contact_id as lead key for the 5 mock leads
  }))

  // Extra leads for pipeline entries
  const extraLeads: LeadInsert[] = [
    {
      contact_id: contactIdMap['3'],
      loan_type: 'purchase',
      loan_amount: 425000,
      lead_status: 'under_contract',
      temperature: 'hot',
      next_follow_up: '2026-03-30',
      created_at: '2026-02-15',
      _leadKey: 'el3',
    },
    {
      contact_id: contactIdMap['7'],
      loan_type: 'purchase',
      loan_amount: 380000,
      lead_status: 'under_contract',
      temperature: 'warm',
      next_follow_up: '2026-04-10',
      created_at: '2026-03-01',
      _leadKey: 'el7',
    },
  ]

  const allLeadsToInsert = [...leadsToInsert, ...extraLeads]
  const leadsForDB = allLeadsToInsert.map(({ _leadKey: _k, ...rest }) => rest)

  console.log('Seeding leads...')
  const { data: insertedLeads, error: leadsError } = await supabase
    .from('leads')
    .insert(leadsForDB)
    .select()
  if (leadsError) {
    console.error('Error inserting leads:', leadsError)
    throw leadsError
  }

  // Build leadIdMap: _leadKey → real UUID
  const leadIdMap: Record<string, string> = {}
  const insertedLeadsTyped = (insertedLeads ?? []) as Array<{ id: string }>
  allLeadsToInsert.forEach((lead, idx) => {
    const inserted = insertedLeadsTyped[idx]
    if (inserted) {
      leadIdMap[lead._leadKey] = inserted.id
    }
  })

  // ── Step 3: Insert pipeline ─────────────────────────────────────────────────

  // mockLoans[0] (Michael Roberts) → lead mockKey '4' (contact_id '4' in mockLeads[2])
  // mockLoans[1] (Robert Taylor) → lead mockKey '8' (contact_id '8' in mockLeads[4])
  // mockLoans[2] (Emily Thompson) → extra lead 'el3'
  // mockLoans[3] (Jennifer Wilson) → extra lead 'el7'
  const loanLeadKeys = ['4', '8', 'el3', 'el7']

  const pipelineToInsert = mockLoans.map((loan, idx) => ({
    lead_id: leadIdMap[loanLeadKeys[idx]],
    loan_stage: mapLoanStage(loan.loan_stage),
    lender: loan.lender,
    loan_amount: loan.loan_amount,
    lock_status: loan.lock_status,
    est_close_date: loan.est_close_date,
    created_at: loan.created_at,
  }))

  console.log('Seeding pipeline...')
  const { error: pipelineError } = await supabase.from('pipeline').insert(pipelineToInsert)
  if (pipelineError) {
    console.error('Error inserting pipeline:', pipelineError)
    throw pipelineError
  }

  // ── Step 4: Insert referral_partners ────────────────────────────────────────

  const partnerContactKeys = ['5', 'p2', 'p3', 'p4', 'p5', 'p6']

  const partnersToInsert = mockPartners.map((partner, idx) => ({
    contact_id: contactIdMap[partnerContactKeys[idx]],
    company: partner.company,
    partner_type: mapPartnerType(partner.partner_type),
    relationship_tier: partner.tier,
    deals_closed_together: partner.deals_closed,
    last_deal_date: partner.last_deal_date,
    next_touchpoint: partner.next_touchpoint,
  }))

  console.log('Seeding referral partners...')
  const { error: partnersError } = await supabase.from('referral_partners').insert(partnersToInsert)
  if (partnersError) {
    console.error('Error inserting referral partners:', partnersError)
    throw partnersError
  }

  // ── Step 5: Insert past_clients ─────────────────────────────────────────────

  const pastClientContactKeys = ['3', '7', 'pc3', 'pc4', 'pc5']

  const pastClientsToInsert = mockPastClients.map((client, idx) => ({
    contact_id: contactIdMap[pastClientContactKeys[idx]],
    original_close_date: client.original_close_date,
    current_rate: client.current_rate,
    estimated_equity: client.estimated_equity,
    refi_eligible: client.refi_eligible,
    reactivation_status: mapReactivationStatus(client.reactivation_status),
    life_event_flags: client.life_events,
    last_reactivation_attempt: client.last_contacted,
  }))

  console.log('Seeding past clients...')
  const { error: pastClientsError } = await supabase.from('past_clients').insert(pastClientsToInsert)
  if (pastClientsError) {
    console.error('Error inserting past clients:', pastClientsError)
    throw pastClientsError
  }

  // ── Step 6: Insert activity_log ─────────────────────────────────────────────

  const activitiesForDB = mockActivities.map(activity => ({
    contact_id: contactIdMap[activity.contact_id],
    activity_type: activity.type,
    summary: activity.description,
    created_at: activity.created_at,
  }))

  console.log('Seeding activities...')
  const { error: activitiesError } = await supabase.from('activity_log').insert(activitiesForDB)
  if (activitiesError) {
    console.error('Error inserting activities:', activitiesError)
    throw activitiesError
  }

  console.log('Seed complete!')
}
