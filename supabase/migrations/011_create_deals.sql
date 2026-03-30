-- ============================================================
-- 011: deals table (HV Pipeline CRM)
-- Run after 010_third_semester_full_access.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deals (
  id                  TEXT PRIMARY KEY,             -- Zoho CRM Deal Id
  deal_name           TEXT,
  company_name        TEXT,
  deal_owner          TEXT,
  contact_name        TEXT,
  description         TEXT,
  sub_pipeline        TEXT,                          -- HV STEM | HV Genesis | Real Estate Investment Fund
  industry_vertical   TEXT,
  investment_cycle    TEXT,                          -- Fall 2023 | Spring 2024 | ...
  deal_source         TEXT,
  contact_status      TEXT,                          -- Reached Out | Have not Reached out
  sourcing_analyst    TEXT,
  stage               TEXT NOT NULL DEFAULT 'Source'
                      CHECK (stage IN (
                        'Source', 'Connect', 'Quick Screen', 'One Pager',
                        'Investment Memo', 'Due Diligence', 'Close',
                        'In Portfolio', 'On Hold', 'Too Early',
                        'Rejected', 'Needs Attention'
                      )),
  tag                 TEXT,
  reason_for_killing  TEXT,
  analysts            TEXT,                          -- comma-separated analyst names
  created_time        TIMESTAMPTZ,
  modified_time       TIMESTAMPTZ,
  last_activity_time  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_stage            ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_investment_cycle ON public.deals(investment_cycle);
CREATE INDEX IF NOT EXISTS idx_deals_sub_pipeline     ON public.deals(sub_pipeline);
CREATE INDEX IF NOT EXISTS idx_deals_industry_vertical ON public.deals(industry_vertical);
CREATE INDEX IF NOT EXISTS idx_deals_deal_owner       ON public.deals(deal_owner);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.handle_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS deals_updated_at ON public.deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.handle_deals_updated_at();

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Full access (admin + 3rd semester) can read all deals
CREATE POLICY "Full access users read deals"
  ON public.deals FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Full access users can update deals
CREATE POLICY "Full access users update deals"
  ON public.deals FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- Full access users can insert deals
CREATE POLICY "Full access users insert deals"
  ON public.deals FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- Full access users can delete deals
CREATE POLICY "Full access users delete deals"
  ON public.deals FOR DELETE
  USING (public.get_my_role() = 'admin');
