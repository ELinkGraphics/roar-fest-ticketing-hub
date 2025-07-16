
-- Create tickets table to store ticket information
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL DEFAULT 'Roar Fest 2024',
  date DATE NOT NULL DEFAULT '2024-08-15',
  time TIME NOT NULL DEFAULT '10:00:00',
  venue TEXT NOT NULL DEFAULT 'Central Park Carnival Grounds',
  price DECIMAL(10,2) NOT NULL DEFAULT 25.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table to store ticket purchases
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed'
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public ticket system)
CREATE POLICY "Anyone can view tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tickets" ON public.tickets FOR UPDATE USING (true);

CREATE POLICY "Anyone can view purchases" ON public.purchases FOR SELECT USING (true);
CREATE POLICY "Anyone can insert purchases" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update purchases" ON public.purchases FOR UPDATE USING (true);

-- Insert default ticket data
INSERT INTO public.tickets (event_name, date, time, venue, price) 
VALUES ('Roar Fest 2024', '2024-08-15', '10:00:00', 'Central Park Carnival Grounds', 25.00);

-- Enable realtime for both tables
ALTER TABLE public.tickets REPLICA IDENTITY FULL;
ALTER TABLE public.purchases REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
