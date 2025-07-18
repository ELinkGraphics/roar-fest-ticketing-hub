import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Search, CheckCircle, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Guest {
  id: string;
  guest_name: string;
  guest_order: number;
  checked_in: boolean;
  checkin_time: string | null;
  purchase_id: string;
}

interface Purchase {
  id: string;
  customer_name: string;
  customer_email: string;
  quantity: number;
  total_amount: number;
  qr_code: string | null;
}

const CheckInSystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchPurchase = async (qrOrSearch: string) => {
    if (!qrOrSearch.trim()) return;
    
    setLoading(true);
    try {
      // First try to find by QR code
      let { data: purchases, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('qr_code', qrOrSearch.trim())
        .limit(1);

      // If no QR match, search by customer name or email
      if (!purchases?.length) {
        const { data: nameMatches, error: nameError } = await supabase
          .from('purchases')
          .select('*')
          .or(`customer_name.ilike.%${qrOrSearch}%,customer_email.ilike.%${qrOrSearch}%`)
          .limit(10);
        
        purchases = nameMatches;
        error = nameError;
      }

      if (error) throw error;

      if (purchases?.length === 1) {
        setSelectedPurchase(purchases[0]);
        await loadGuests(purchases[0].id);
      } else if (purchases?.length > 1) {
        toast({
          title: "Multiple Results",
          description: "Multiple purchases found. Please be more specific.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "No Results",
          description: "No purchase found with that QR code or search term.",
          variant: "destructive"
        });
        setSelectedPurchase(null);
        setGuests([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Error searching for purchase.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGuests = async (purchaseId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_guests')
        .select('*')
        .eq('purchase_id', purchaseId)
        .order('guest_order');

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error("Error loading guests:", error);
      toast({
        title: "Error",
        description: "Failed to load guest list.",
        variant: "destructive"
      });
    }
  };

  const checkInGuest = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_guests')
        .update({
          checked_in: true,
          checkin_time: new Date().toISOString()
        })
        .eq('id', guestId);

      if (error) throw error;

      // Update local state
      setGuests(guests.map(guest => 
        guest.id === guestId 
          ? { ...guest, checked_in: true, checkin_time: new Date().toISOString() }
          : guest
      ));

      toast({
        title: "Check-in Successful",
        description: "Guest has been marked as arrived.",
      });
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in Failed",
        description: "Failed to check in guest.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPurchase(searchTerm);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Check-In System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Scan QR code or search by name/email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={() => searchPurchase(searchTerm)}
              disabled={loading || !searchTerm.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {selectedPurchase && (
            <Alert className="mb-4">
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Purchase Found:</strong> {selectedPurchase.customer_name} - 
                {selectedPurchase.quantity} ticket{selectedPurchase.quantity > 1 ? 's' : ''} - 
                {selectedPurchase.total_amount} ETB
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {guests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Guest List</span>
              <Badge variant="outline">
                {guests.filter(g => g.checked_in).length} / {guests.length} checked in
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guests.map((guest) => (
                <div 
                  key={guest.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    guest.checked_in 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={guest.checked_in ? "default" : "outline"}>
                      {guest.guest_order}
                    </Badge>
                    <div>
                      <p className="font-medium">{guest.guest_name}</p>
                      {guest.checked_in && guest.checkin_time && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Checked in at {new Date(guest.checkin_time).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {guest.checked_in ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Checked In
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => checkInGuest(guest.id)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CheckInSystem;