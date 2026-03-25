-- Floyd CRM — Supabase Schema v2
-- Incorporates: LO workflow validation + Sentinel security hardening
-- Instance: sqqlawadxemgywbddssl.supabase.co
-- Run this in Supabase SQL Editor

-- ============================================================
-- CONTACTS — Unified table for all people
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('lead', 'past_client', 'referral_partner', 'builder')),
  source TEXT CHECK (source IN (
    'zillow', 'realtor_referral', 'builder_referral', 'bank_referral',
    'financial_planner_referral', 'attorney_referral', 'past_client_referral',
    'sphere', 'open_house', 'co_marketing', 'mabls', 'branch_walk_in',
    'reactivation', 'website', 'social_media', 'other'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_contacted TIMESTAMPTZ,
  notes TEXT
);

COMMENT ON COLUMN contacts.email IS 'PII:email';
COMMENT ON COLUMN contacts.phone IS 'PII:phone';

-- ============================================================
-- LEADS — Active prospects (extends contacts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN (
    'new', 'contacted', 'qualified', 'pre_qual', 'pre_approved',
    'under_contract', 'closed_won', 'lost', 'stale'
  )),
  loan_type TEXT CHECK (loan_type IN (
    'purchase', 'refi', 'cash_out', 'heloc',
    'va_irrrl', 'fha_streamline', 'usda', 'construction'
  )),
  loan_amount NUMERIC(12,2),
  property_address TEXT,
  assigned_agent UUID REFERENCES public.contacts(id),
  next_follow_up TIMESTAMPTZ,
  temperature TEXT DEFAULT 'warm' CHECK (temperature IN ('hot', 'warm', 'cold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PIPELINE — Active loans in process
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  loan_stage TEXT NOT NULL DEFAULT 'application' CHECK (loan_stage IN (
    'application', 'processing', 'underwriting', 'suspended',
    'conditional_approval', 'clear_to_close', 'docs_out',
    'closing_scheduled', 'funded'
  )),
  lender TEXT,
  loan_program TEXT,
  est_close_date DATE,
  loan_amount NUMERIC(12,2),
  lock_status TEXT DEFAULT 'floating' CHECK (lock_status IN (
    'floating', 'lock_pending', 'locked', 'lock_extended', 'relocked', 'expired'
  )),
  lock_expiration DATE,
  processor_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- REFERRAL_PARTNERS — Extends contacts for agents/builders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company TEXT,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('agent', 'builder', 'financial_planner', 'attorney')),
  relationship_tier TEXT DEFAULT 'C' CHECK (relationship_tier IN ('A', 'B', 'C')),
  deals_closed_together INTEGER DEFAULT 0,
  last_deal_date DATE,
  next_touchpoint TIMESTAMPTZ,
  notes TEXT
);

-- ============================================================
-- PAST_CLIENTS — Closed borrowers (extends contacts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.past_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  original_close_date DATE,
  original_loan_amount NUMERIC(12,2),
  current_rate NUMERIC(5,3),
  estimated_equity NUMERIC(12,2),
  refi_eligible BOOLEAN DEFAULT false,
  last_reactivation_attempt TIMESTAMPTZ,
  reactivation_status TEXT DEFAULT 'not_contacted' CHECK (reactivation_status IN ('not_contacted', 'contacted', 'interested', 'not_interested')),
  life_event_flags TEXT[] DEFAULT '{}'
);

-- ============================================================
-- ACTIVITY_LOG — Every touchpoint (append-only for authenticated)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'call', 'voicemail', 'email', 'text', 'linkedin',
    'mailer', 'meeting', 'note', 'referral_sent', 'task'
  )),
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT DEFAULT 'tanner'
);

-- ============================================================
-- PHASE 3 SCAFFOLDS — Placeholder tables (no logic yet)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.webhook_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rate_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date DATE NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value NUMERIC(5,3),
  source TEXT DEFAULT 'mortgage_news_daily',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reactivation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  past_client_id UUID REFERENCES public.past_clients(id),
  trigger_type TEXT NOT NULL,
  trigger_data JSONB,
  fired_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fired', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contacts_type ON public.contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contacted ON public.contacts(last_contacted);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_contact ON public.leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_user ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON public.leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON public.leads(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON public.pipeline(loan_stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_user ON public.pipeline(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_lock ON public.pipeline(lock_status);
CREATE INDEX IF NOT EXISTS idx_pipeline_close ON public.pipeline(est_close_date);
CREATE INDEX IF NOT EXISTS idx_referral_tier ON public.referral_partners(relationship_tier);
CREATE INDEX IF NOT EXISTS idx_referral_user ON public.referral_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_past_clients_refi ON public.past_clients(refi_eligible);
CREATE INDEX IF NOT EXISTS idx_past_clients_user ON public.past_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_past_clients_reactivation ON public.past_clients(reactivation_status);
CREATE INDEX IF NOT EXISTS idx_activity_contact ON public.activity_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactivation_triggers ENABLE ROW LEVEL SECURITY;

-- Service role: full access (internal agents, edge functions)
CREATE POLICY "service_role_all" ON public.contacts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.pipeline FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.referral_partners FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.past_clients FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.activity_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.webhook_intake FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.rate_feed FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.reactivation_triggers FOR ALL USING (auth.role() = 'service_role');

-- Authenticated: user-scoped CRUD (each user sees only their data)
CREATE POLICY "user_crud" ON public.contacts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_crud" ON public.leads FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_crud" ON public.pipeline FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_crud" ON public.referral_partners FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_crud" ON public.past_clients FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity log: append-only for authenticated (no UPDATE/DELETE)
CREATE POLICY "activity_log_insert" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_log_read" ON public.activity_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Rate feed: read-only for authenticated
CREATE POLICY "authenticated_read" ON public.rate_feed
  FOR SELECT TO authenticated USING (true);

-- Anon gets NOTHING (no policies = denied by RLS)

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pipeline_updated_at BEFORE UPDATE ON public.pipeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-UPDATE last_contacted on activity_log insert
-- ============================================================
CREATE OR REPLACE FUNCTION update_last_contacted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.contacts SET last_contacted = now() WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_updates_contact AFTER INSERT ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION update_last_contacted();
