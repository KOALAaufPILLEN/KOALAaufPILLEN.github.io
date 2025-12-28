-- SQL Fix for Supabase "column user_id does not exist" error
-- Run this in your Supabase SQL Editor

-- 1. Add the missing column 'user_id' to the table if it doesn't exist
ALTER TABLE public.luvvies_crush_scores
ADD COLUMN IF NOT EXISTS user_id text;

-- 2. Add a unique index to prevent duplicate submissions for the same level/difficulty/score combination by the same user
-- This helps keeps the leaderboard clean from spam or accidental double-posts
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_score_submission
ON public.luvvies_crush_scores (user_id, score, level, difficulty);

-- 3. Verify the column exists (Optional: for verification output)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'luvvies_crush_scores';
