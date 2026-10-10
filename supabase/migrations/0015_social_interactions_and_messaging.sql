-- ============================================================
-- 0015_social_interactions_and_messaging.sql
-- Instagram-grade profiles, social interactions (likes, comments, shares, follows),
-- and direct messaging for author-reader cultural discussions.
-- ============================================================

-- 1. Profiles bio, website, location enhancements
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;

-- Ensure profiles update policy allows self-updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY profiles_update_own ON public.profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Post reactions public select for aggregate counts
ALTER POLICY post_reactions_select_own ON public.post_reactions
  USING (kind IN ('like', 'save') OR (auth.uid() = user_id));

-- 3. Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'post_comments_select_all') THEN
    CREATE POLICY post_comments_select_all ON public.post_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'post_comments_insert_own') THEN
    CREATE POLICY post_comments_insert_own ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'post_comments_delete_own') THEN
    CREATE POLICY post_comments_delete_own ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = author_id);
  END IF;
END $$;

-- 4. Post Shares
CREATE TABLE IF NOT EXISTS public.post_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  platform text DEFAULT 'link',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_shares' AND policyname = 'post_shares_select_all') THEN
    CREATE POLICY post_shares_select_all ON public.post_shares FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_shares' AND policyname = 'post_shares_insert_any') THEN
    CREATE POLICY post_shares_insert_any ON public.post_shares FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 5. Follows
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'follows_select_all') THEN
    CREATE POLICY follows_select_all ON public.follows FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'follows_insert_own') THEN
    CREATE POLICY follows_insert_own ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'follows_delete_own') THEN
    CREATE POLICY follows_delete_own ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);
  END IF;
END $$;

-- 6. Direct Messaging & Conversations for Author-Community Engagement
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (participant1_id != participant2_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_participant_select') THEN
    CREATE POLICY conversations_participant_select ON public.conversations
      FOR SELECT TO authenticated
      USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_participant_insert') THEN
    CREATE POLICY conversations_participant_insert ON public.conversations
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_participant_update') THEN
    CREATE POLICY conversations_participant_update ON public.conversations
      FOR UPDATE TO authenticated
      USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_participant_select') THEN
    CREATE POLICY messages_participant_select ON public.messages
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = conversation_id
          AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_participant_insert') THEN
    CREATE POLICY messages_participant_insert ON public.messages
      FOR INSERT TO authenticated
      WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = conversation_id
          AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
      );
  END IF;
END $$;
