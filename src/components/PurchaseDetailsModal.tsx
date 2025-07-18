import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Clock, Users, Mail, Phone, CreditCard, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Guest {
  id: string;
  guest_name: string;
  guest_order: number;
  checked_in: boolean;
  checkin_time: string | null;
}

interface PurchaseDetailsModalProps {
  purchase: any;
  eventData: any;
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseDetailsModal = ({ purchase, eventData, isOpen, onClose }: PurchaseDetailsModalProps) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && purchase) {
      loadGuests();
    }
  }, [isOpen, purchase]);

  const loadGuests = async () => {
    if (!purchase?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_guests')
        .select('*')
        .eq('purchase_id', purchase.id)
        .order('guest_order');

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error("Error loading guests:", error);
      toast({
        title: "Error",
        description: "Failed to load guest information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!purchase || !eventData) return null;

  const checkedInCount = guests.filter(guest => guest.checked_in).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Purchase Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket ID and Status */}
          <div className="flex items-center justify-between">
            <Badge className="bg-primary text-lg px-4 py-2">
              Ticket ID: {purchase.ticket_id}
            </Badge>
            <Badge 
              variant="outline" 
              className={`${
                purchase.payment_status === 'completed' ? 'text-green-600 border-green-200' : 
                purchase.payment_status === 'pending' ? 'text-yellow-600 border-yellow-200' : 
                'text-red-600 border-red-200'
              }`}
            >
              {purchase.payment_status || 'completed'}
            </Badge>
          </div>

          {/* Event Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Event Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <span>{eventData.event_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{eventData.date} at {eventData.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{eventData.venue}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{purchase.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{purchase.customer_email}</span>
                </div>
                {purchase.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{purchase.customer_phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span className="font-medium">{eventData.price} ETB</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total Amount:</span>
                  <span>{purchase.total_amount} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">{purchase.payment_method || 'Chapa'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Purchase Date:</span>
                  <span className="font-medium">
                    {new Date(purchase.purchase_date).toLocaleDateString()} {new Date(purchase.purchase_date).toLocaleTimeString()}
                  </span>
                </div>
                {purchase.transaction_reference && (
                  <div className="flex justify-between">
                    <span>Transaction Ref:</span>
                    <span className="font-mono text-xs">{purchase.transaction_reference}</span>
                  </div>
                )}
                {purchase.chapa_transaction_id && (
                  <div className="flex justify-between">
                    <span>Chapa ID:</span>
                    <span className="font-mono text-xs">{purchase.chapa_transaction_id}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guest List and Check-in Status */}
          {guests.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Guest List
                  </span>
                  <Badge variant="outline">
                    {checkedInCount} / {guests.length} checked in
                  </Badge>
                </h3>
                
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Loading guests...</div>
                ) : (
                  <div className="space-y-2">
                    {guests.map((guest) => (
                      <div 
                        key={guest.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          guest.checked_in 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={guest.checked_in ? "default" : "outline"}>
                            {guest.guest_order}
                          </Badge>
                          <span className="font-medium">{guest.guest_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {guest.checked_in ? (
                            <div className="text-right">
                              <Badge className="bg-green-600 text-white">
                                Checked In
                              </Badge>
                              {guest.checkin_time && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(guest.checkin_time).toLocaleTimeString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Not Checked In
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* QR Code Information */}
          {purchase.qr_code && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </h3>
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {purchase.qr_code}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDetailsModal;