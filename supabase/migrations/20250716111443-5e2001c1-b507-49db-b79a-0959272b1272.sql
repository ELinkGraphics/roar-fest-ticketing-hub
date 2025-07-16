-- Add payment-related fields to the purchases table
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'chapa',
ADD COLUMN IF NOT EXISTS transaction_reference TEXT,
ADD COLUMN IF NOT EXISTS chapa_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Update existing records to have 'completed' payment status for backwards compatibility
UPDATE public.purchases 
SET payment_status = 'completed' 
WHERE payment_status IS NULL OR payment_status = 'pending';