CREATE TABLE IF NOT EXISTS public.workflow_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_key text NOT NULL,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'skipped', 'running')),
  message text,
  details jsonb,
  duration_ms integer,
  created_at timestamp with time zone DEFAULT now()
)