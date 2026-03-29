-- Temporary anon access for Floyd CRM (single-user personal CRM)
-- Replace with proper auth when multi-user or public-facing

-- Drop user_id NOT NULL constraint and add default
ALTER TABLE public.contacts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.pipeline ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.referral_partners ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.past_clients ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.activity_log ALTER COLUMN user_id DROP NOT NULL;

-- Anon full access policies
CREATE POLICY "anon_all_contacts" ON public.contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_leads" ON public.leads FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_pipeline" ON public.pipeline FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_referral_partners" ON public.referral_partners FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_past_clients" ON public.past_clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_activity_log" ON public.activity_log FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_rate_feed" ON public.rate_feed FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_reactivation_triggers" ON public.reactivation_triggers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_webhook_intake" ON public.webhook_intake FOR ALL TO anon USING (true) WITH CHECK (true);
