-- Keep monthly and quarterly micro themes independently, under the existing RLS policies.
ALTER TABLE public.church_monthly_themes
  ADD COLUMN cadence TEXT NOT NULL DEFAULT 'monthly'
  CHECK (cadence IN ('monthly', 'quarterly'));
ALTER TABLE public.church_monthly_themes
  DROP CONSTRAINT church_monthly_themes_organization_id_year_month_key,
  ADD CONSTRAINT church_themes_org_year_cadence_period_key
    UNIQUE (organization_id, year, cadence, month),
  ADD CONSTRAINT church_themes_quarter_range
    CHECK (cadence <> 'quarterly' OR month BETWEEN 1 AND 4);
COMMENT ON COLUMN public.church_monthly_themes.month IS
  'Calendar month (1–12) for monthly cadence; calendar quarter (1–4) for quarterly cadence.';
