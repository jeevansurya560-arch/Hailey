-- ============================================================
-- 0014_security_hardening_and_data_protection.sql
-- Comprehensive Security Hardening & Zero-Trust Access Control
-- ============================================================

-- ── 1. Revoke public/anon execute on sensitive functions ─────
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ── 2. Privilege Escalation Defense on profiles ──────────────
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS trigger AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NEW.is_editorial IS DISTINCT FROM OLD.is_editorial THEN
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true) THEN
        RAISE EXCEPTION 'Unauthorized modification of is_editorial role';
      END IF;
    END IF;
    IF NEW.id <> OLD.id THEN
      RAISE EXCEPTION 'Cannot modify profile primary key ID';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.protect_profile_roles() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

-- ── 3. Explicit Service-Role Policy on wallet_nonces ──────────
DROP POLICY IF EXISTS "wallet_nonces_service_role_only" ON public.wallet_nonces;
CREATE POLICY "wallet_nonces_service_role_only"
  ON public.wallet_nonces FOR ALL
  USING (false);

-- ── 4. Durable Audit Logs Table & RLS ─────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  who                text NOT NULL,
  what               text NOT NULL,
  target             text NOT NULL,
  result             text NOT NULL,
  ip_address         text,
  metadata           jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_insert_all" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_all" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs_select_editorial" ON public.audit_logs;
CREATE POLICY "audit_logs_select_editorial" ON public.audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true));

-- ── 5. Moderation Reports Table & RLS ─────────────────────────
CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type        text NOT NULL CHECK (target_type IN ('post', 'comment', 'user', 'collection_item')),
  target_id          text NOT NULL,
  reason             text NOT NULL,
  status             text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED')),
  moderator_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_taken       text,
  reviewed_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moderation_reports_insert_auth" ON public.moderation_reports;
CREATE POLICY "moderation_reports_insert_auth" ON public.moderation_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_user_id OR reporter_user_id IS NULL);

DROP POLICY IF EXISTS "moderation_reports_select_editorial" ON public.moderation_reports;
CREATE POLICY "moderation_reports_select_editorial" ON public.moderation_reports FOR SELECT
  USING (
    auth.uid() = reporter_user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true)
  );

DROP POLICY IF EXISTS "moderation_reports_update_editorial" ON public.moderation_reports;
CREATE POLICY "moderation_reports_update_editorial" ON public.moderation_reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true));

-- ── 6. Reports Table Editorial Read Access ────────────────────
DROP POLICY IF EXISTS "reports_select_editorial" ON public.reports;
CREATE POLICY "reports_select_editorial" ON public.reports FOR SELECT
  USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true)
  );

-- ── 7. User Age Eligibility Table & RLS ───────────────────────
CREATE TABLE IF NOT EXISTS public.user_age_eligibility (
  user_id             uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  eligibility         text NOT NULL DEFAULT 'UNVERIFIED' CHECK (eligibility IN ('UNVERIFIED', 'MINOR', 'ADULT', 'REQUIRES_REVIEW')),
  verified_at         timestamptz,
  verification_method text NOT NULL DEFAULT 'unverified',
  provider            text,
  reference_id        text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_age_eligibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_age_eligibility_select_own" ON public.user_age_eligibility;
CREATE POLICY "user_age_eligibility_select_own" ON public.user_age_eligibility FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true)
  );

-- ── 8. Posts Age Classification, Status & RLS ─────────────────
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS age_classification text NOT NULL DEFAULT 'GENERAL' CHECK (age_classification IN ('GENERAL', 'ADULT_18_PLUS', 'AGE_RESTRICTED_REVIEW', 'UNCLASSIFIED')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'pending_review', 'removed'));

ALTER POLICY "posts_select_all" ON public.posts
  USING (
    (
      status = 'published'
      AND (
        age_classification = 'GENERAL'
        OR (
          age_classification = 'ADULT_18_PLUS'
          AND EXISTS (
            SELECT 1 FROM public.user_age_eligibility uae
            WHERE uae.user_id = auth.uid() AND uae.eligibility = 'ADULT'
          )
        )
      )
    )
    OR auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_editorial = true
    )
  );

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
