import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Search, CheckCircle, User, Clock, Scan, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QRScanner from "./QRScanner";
import UsherProfile from "./UsherProfile";

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

interface UsherData {
  name: string;
  id: string;
  loginTime: string;
  checkInsToday: number;
}

const CheckInSystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [currentUsher, setCurrentUsher] = useState<UsherData | null>(null);
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

  const checkInGuest = async (guestId: string, guestName: string) => {
    if (!currentUsher) {
      toast({
        title: "Login Required",
        description: "Please log in as an usher first",
        variant: "destructive"
      });
      return;
    }

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

      // Increment usher check-ins
      if ((window as any).incrementUsherCheckIns) {
        (window as any).incrementUsherCheckIns();
      }

      toast({
        title: "Check-in Successful",
        description: `${guestName} has been checked in by ${currentUsher.name}`,
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

  const handleQRScan = (result: string) => {
    setSearchTerm(result);
    searchPurchase(result);
    setActiveTab("search"); // Switch to search tab to show results
    toast({
      title: "QR Code Scanned",
      description: "Searching for purchase...",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPurchase(searchTerm);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 min-h-screen bg-gray-50">
      {/* Usher Profile */}
      <UsherProfile onUsherChange={setCurrentUsher} />

      {/* Main Check-in Interface */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-center justify-center">
            <UserCheck className="h-6 w-6 text-primary" />
            Gate Check-In System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                <span className="hidden sm:inline">QR Scan</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, email, or enter QR code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12 text-lg"
                />
                <Button 
                  onClick={() => searchPurchase(searchTerm)}
                  disabled={loading || !searchTerm.trim()}
                  size="lg"
                  className="px-6"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="scan" className="space-y-4">
              <QRScanner onScan={handleQRScan} isActive={activeTab === "scan"} />
            </TabsContent>
          </Tabs>

          {selectedPurchase && (
            <Alert className="mt-4 border-green-200 bg-green-50">
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

      {/* Guest List */}
      {guests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Guest List</span>
              <Badge variant="outline" className="text-sm">
                {guests.filter(g => g.checked_in).length} / {guests.length} checked in
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guests.map((guest) => (
                <div 
                  key={guest.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    guest.checked_in 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={guest.checked_in ? "default" : "outline"}
                        className="text-base px-3 py-1"
                      >
                        {guest.guest_order}
                      </Badge>
                      <div>
                        <p className="font-medium text-lg">{guest.guest_name}</p>
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
                        <Badge className="bg-green-600 text-white px-4 py-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Checked In
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => checkInGuest(guest.id, guest.guest_name)}
                          size="lg"
                          className="bg-orange-500 hover:bg-orange-600 px-6 py-3 text-base"
                          disabled={!currentUsher}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions for mobile users */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="text-center text-sm text-blue-800">
            <p className="font-medium">Instructions:</p>
            <p>1. Log in as an usher first</p>
            <p>2. Use QR Scan tab for tickets with QR codes</p>
            <p>3. Use Search tab to find guests by name</p>
            <p>4. Tap guest names to check them in</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInSystem;