-- Migration: Add created_by to consultation_visits and trigger
-- Date: 2026-01-19

ALTER TABLE consultation_visits
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Trigger function to set created_by to current user
CREATE OR REPLACE FUNCTION set_consultation_visit_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on insert
DROP TRIGGER IF EXISTS trg_set_created_by ON consultation_visits;
CREATE TRIGGER trg_set_created_by
BEFORE INSERT ON consultation_visits
FOR EACH ROW EXECUTE FUNCTION set_consultation_visit_created_by();
