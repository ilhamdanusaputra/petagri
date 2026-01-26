-- Add message column to tender_assigns for tender creator notes
ALTER TABLE public.tender_assigns
  ADD COLUMN IF NOT EXISTS message TEXT NULL;

COMMENT ON COLUMN public.tender_assigns.message IS 'Catatan atau pesan dari pembuat tender';
