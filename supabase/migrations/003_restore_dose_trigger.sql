-- Trigger to restore remaining_mcg when a dose log is deleted
-- This is the counterpart to the existing deduct_dose() trigger on INSERT
-- Without this, deleting a log (for undo or corrections) permanently loses the deducted amount

CREATE OR REPLACE FUNCTION public.restore_dose()
RETURNS TRIGGER
SECURITY DEFINER AS $$
BEGIN
  -- Only restore if the dose was "taken" (skipped doses don't deduct)
  IF OLD.status = 'taken' THEN
    UPDATE public.user_peptides
    SET remaining_mcg = remaining_mcg + OLD.dose_mcg
    WHERE id = OLD.user_peptide_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists to make this idempotent
DROP TRIGGER IF EXISTS restore_dose_on_delete ON public.dose_logs;

CREATE TRIGGER restore_dose_on_delete
  BEFORE DELETE ON public.dose_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.restore_dose();
