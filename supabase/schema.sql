-- Floyd CRM — Supabase Schema
-- Phase 1: Core Tables
-- Instance: sqqlawadxemgywbddssl.supabase.co

-- ============================================================
-- CONTACTS — Unified table for all people
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('lead', 'past_client', 'referral_partner', 'builder')),
  source TEXT CHECK (source IN ('zillow', 'realtor_referral', 'mabls', 'walk_in', 'reactivation', 'website', 'social_media', 'past_client_referral', 'builder_referral', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_contacted TIMESTAMPTZ,
  notes TEXT
);

-- ============================================================
-- LEADS — Active prospects (extends contacts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'pre_approved', 'under_contract', 'closed', 'lost', 'stale')),
  loan_type TEXT CHECK (loan_type IN ('purchase', 'refi', 'cash_out', 'heloc')),
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
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  loan_stage TEXT NOT NULL DEFAULT 'application' CHECK (loan_stage IN ('application', 'processing', 'underwriting', 'conditional_approval', 'clear_to_close', 'funded')),
  lender TEXT,
  loan_program TEXT,
  est_close_date DATE,
  loan_amount NUMERIC(12,2),
  lock_status TEXT DEFAULT 'floating' CHECK (lock_status IN ('locked', 'floating', 'expired')),
  lock_expiration DATE,
  processor_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- REFERRAL_PARTNERS — Extends contacts for agents/builders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- ACTIVITY_LOG — Every touchpoint
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'text', 'meeting', 'note')),
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
CREATE INDEX IF NOT EXISTS idx_contacts_last_contacted ON public.contacts(last_contacted);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_contact ON public.leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON public.leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON public.leads(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON public.pipeline(loan_stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_lock ON public.pipeline(lock_status);
CREATE INDEX IF NOT EXISTS idx_pipeline_close ON public.pipeline(est_close_date);
CREATE INDEX IF NOT EXISTS idx_referral_tier ON public.referral_partners(relationship_tier);
CREATE INDEX IF NOT EXISTS idx_past_clients_refi ON public.past_clients(refi_eligible);
CREATE INDEX IF NOT EXISTS idx_past_clients_reactivation ON public.past_clients(reactivation_status);
CREATE INDEX IF NOT EXISTS idx_activity_contact ON public.activity_log(contact_id);
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

-- Service role gets full access (used by Make.com webhooks and internal agents)
CREATE POLICY "service_role_all" ON public.contacts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.pipeline FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.referral_partners FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.past_clients FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.activity_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.webhook_intake FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.rate_feed FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON public.reactivation_triggers FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users (Tanner via Lovable/frontend) get full CRUD
CREATE POLICY "authenticated_all" ON public.contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all" ON public.leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all" ON public.pipeline FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all" ON public.referral_partners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all" ON public.past_clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all" ON public.activity_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read" ON public.rate_feed FOR SELECT USING (auth.role() = 'authenticated');

-- Anon gets NOTHING (no public access to CRM data)
-- No policies for anon role = denied by default with RLS enabled

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
