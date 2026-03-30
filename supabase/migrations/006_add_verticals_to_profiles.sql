-- ============================================================
-- 006: add verticals array to profiles
-- Enables vertical-based page access control
-- Verticals: financial_technology, sustainability, consumer_products, sports_wellness
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verticals TEXT[] NOT NULL DEFAULT '{}';
