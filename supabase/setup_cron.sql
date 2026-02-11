-- ============================================
-- DearME Email Delivery CRON Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Add index for efficient message querying
CREATE INDEX IF NOT EXISTS idx_messages_pending 
ON messages(status, scheduled_date) 
WHERE status = 'scheduled';

-- Step 3: Update messages check constraint to include 'failed' status
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_status_check;

ALTER TABLE messages 
ADD CONSTRAINT messages_status_check 
CHECK (status IN ('scheduled', 'sent', 'failed'));

-- Step 4: Create the CRON job (runs every minute)
-- NOTE: Replace YOUR_PROJECT_REF with your actual Supabase project reference
-- Your project ref is: enzjwlhlzljdmnzaadeu

SELECT cron.schedule(
  'send-scheduled-messages',  -- Job name
  '* * * * *',                -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://enzjwlhlzljdmnzaadeu.supabase.co/functions/v1/send-scheduled-messages',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuemp3bGhsemxqZG1uemFhZGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM1MjM2MywiZXhwIjoyMDg1OTI4MzYzfQ.HvRtkQPhXfGkFX2VNm1Khpb7rwMkOxJi2wia9egeHO4'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- Useful commands for managing the CRON job
-- ============================================

-- View all scheduled jobs:
-- SELECT * FROM cron.job;

-- View job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- Unschedule the job if needed:
-- SELECT cron.unschedule('send-scheduled-messages');

-- Manually trigger the Edge Function for testing:
-- SELECT net.http_post(
--   url := 'https://enzjwlhlzljdmnzaadeu.supabase.co/functions/v1/send-scheduled-messages',
--   headers := jsonb_build_object('Content-Type', 'application/json'),
--   body := '{}'::jsonb
-- );
