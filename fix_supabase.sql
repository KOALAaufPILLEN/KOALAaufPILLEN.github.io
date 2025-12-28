-- SQL Fix for Supabase "column user_id does not exist" error

-- 1. Add the missing column 'user_id' to the table
ALTER TABLE public.luvvies_crush_scores
ADD COLUMN IF NOT EXISTS user_id text;

-- 2. Add the unique index to prevent duplicate submissions (optional but recommended)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_score_submission
ON public.luvvies_crush_scores (user_id, score, level, difficulty);

-- 3. Verify the column exists (this is just for you to see in the output)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'luvvies_crush_scores';
