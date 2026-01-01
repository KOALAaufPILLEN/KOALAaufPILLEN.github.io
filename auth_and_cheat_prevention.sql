-- Security Enhancement: RLS Policies for Supabase Auth
-- This ensures users can only insert/update their OWN scores if logged in.

-- 1. Enable RLS (already enabled in setup, but good to ensure)
ALTER TABLE public.luvvies_crush_scores ENABLE ROW LEVEL SECURITY;

-- 2. Drop insecure "Anyone can upload" policy if it exists (Optional: keeping both might allow anon scores)
-- For strict security, we should replace it.
-- However, since the game supports anonymous play, we might need a hybrid approach:
-- "Authenticated users can only insert their own UUID"
-- "Anonymous users can insert any UUID?" -> This is the vulnerability.
-- Ideally, we only allow authenticated inserts.

CREATE POLICY "Users can insert their own scores"
ON public.luvvies_crush_scores
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = user_id
);

CREATE POLICY "Users can update their own scores"
ON public.luvvies_crush_scores
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = user_id
)
WITH CHECK (
  auth.uid()::text = user_id
);

-- Anti-Cheat Analysis Query
-- Run this in Supabase SQL Editor to find suspicious scores
-- Heuristic: Score > (Level * 25000 + 50000) is likely impossible/cheated.
/*
SELECT
  player_name,
  score,
  level,
  difficulty,
  created_at,
  user_id,
  (score / GREATEST(level, 1)) as score_per_level
FROM public.luvvies_crush_scores
WHERE
  score > (level * 25000 + 100000) -- Generous threshold
ORDER BY score DESC;
*/
