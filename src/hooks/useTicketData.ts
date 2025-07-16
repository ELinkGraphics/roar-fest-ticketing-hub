
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Ticket = Tables<'tickets'>;
type Purchase = Tables<'purchases'>;

export const useTicketData = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [ticketsData, purchasesData] = await Promise.all([
          supabase.from('tickets').select('*'),
          supabase.from('purchases').select('*').order('purchase_date', { ascending: false })
        ]);

        if (ticketsData.data) setTickets(ticketsData.data);
        if (purchasesData.data) setPurchases(purchasesData.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscriptions
    const purchasesChannel = supabase
      .channel('purchases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases'
        },
        (payload) => {
          console.log('Purchase change received:', payload);
          if (payload.eventType === 'INSERT') {
            setPurchases(prev => [payload.new as Purchase, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPurchases(prev => 
              prev.map(p => p.id === payload.new.id ? payload.new as Purchase : p)
            );
          }
        }
      )
      .subscribe();

    const ticketsChannel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Ticket change received:', payload);
          if (payload.eventType === 'UPDATE') {
            setTickets(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new as Ticket : t)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(purchasesChannel);
      supabase.removeChannel(ticketsChannel);
    };
  }, []);

  const createPurchase = async (purchaseData: {
    ticket_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    quantity: number;
    total_amount: number;
  }) => {
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchaseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    tickets,
    purchases,
    loading,
    createPurchase,
    updateTicket
  };
};
