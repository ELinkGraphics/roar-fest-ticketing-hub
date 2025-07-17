-- Create ticket_guests table
CREATE TABLE public.ticket_guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_order INTEGER NOT NULL,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checkin_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique guest names within each purchase
  UNIQUE(purchase_id, guest_name)
);

-- Add QR code field to purchases table
ALTER TABLE public.purchases 
ADD COLUMN qr_code TEXT UNIQUE;

-- Enable Row Level Security on ticket_guests
ALTER TABLE public.ticket_guests ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket_guests table
CREATE POLICY "Anyone can view ticket guests" 
ON public.ticket_guests 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert ticket guests" 
ON public.ticket_guests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update ticket guests" 
ON public.ticket_guests 
FOR UPDATE 
USING (true);

-- Add realtime for ticket_guests
ALTER TABLE public.ticket_guests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_guests;