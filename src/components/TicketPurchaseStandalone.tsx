
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Ticket,
  CreditCard
} from "lucide-react";
import ChapaCheckoutForm from "./ChapaCheckoutForm";
import { supabase } from "@/integrations/supabase/client";

interface TicketPurchaseStandaloneProps {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  setCustomerInfo: (info: any) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  onPurchase: () => void;
  processing: boolean;
  currentTicket: any;
}

const TicketPurchaseStandalone = ({ 
  customerInfo, 
  setCustomerInfo, 
  quantity, 
  setQuantity, 
  onPurchase,
  processing,
  currentTicket 
}: TicketPurchaseStandaloneProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  
  const handleProceedToPayment = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Generate unique transaction reference
    const txRef = `RF${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTransactionRef(txRef);

    // Create pending purchase record
    try {
      const totalAmount = Number(currentTicket.price) * quantity;
      const { data, error } = await supabase
        .from("purchases")
        .insert({
          ticket_id: `RF${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone || null,
          quantity,
          total_amount: totalAmount,
          payment_method: "chapa",
          transaction_reference: txRef,
          payment_status: "pending"
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating purchase:", error);
        toast({
          title: "Error",
          description: "Failed to create purchase record.",
          variant: "destructive"
        });
        return;
      }

      console.log("Created pending purchase:", data);
      setShowPayment(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <img 
              src="/lovable-uploads/58f80963-5fd4-4b66-ae01-836925499cab.png" 
              alt="Roar Fest Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Get Your Tickets
          </h1>
          <p className="text-gray-600">Secure your spot at the most exciting kids carnival event!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Information */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 relative">
                <img 
                  src="/lovable-uploads/e48b0098-8372-4d7e-af4d-f99de18763c0.png"
                  alt="Roar Fest Banner"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    Kids Event
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Family Friendly
                  </Badge>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                  {currentTicket.event_name}
                </h2>
                
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <span>{new Date(currentTicket.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span>{currentTicket.time} - 6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span>{currentTicket.venue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span>All Ages Welcome</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800">Event Highlights:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Carnival games and rides</li>
                    <li>• Face painting and activities</li>
                    <li>• Live entertainment</li>
                    <li>• Food vendors and treats</li>
                    <li>• Prize competitions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-orange-600" />
                  Purchase Tickets
                </CardTitle>
                <CardDescription>
                  Get your tickets for the most exciting kids carnival event!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-orange-800">General Admission</p>
                      <p className="text-sm text-orange-600">Access to all carnival activities</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-700">{currentTicket.price} ETB</p>
                      <p className="text-sm text-orange-600">per ticket</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Number of Tickets</Label>
                  <Input 
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="border-orange-200 focus:border-orange-400"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="border-orange-200 focus:border-orange-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="border-orange-200 focus:border-orange-400"
                    placeholder="Enter your phone number"
                  />
                </div>

                <Separator />

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Tickets ({quantity}x)</span>
                    <span>{(Number(currentTicket.price) * quantity)} ETB</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{(Number(currentTicket.price) * quantity)} ETB</span>
                  </div>
                </div>

                {!showPayment ? (
                  <Button 
                    onClick={handleProceedToPayment}
                    disabled={processing || !customerInfo.name || !customerInfo.email}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-3"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {processing ? "Processing..." : `Proceed to Payment - ${(Number(currentTicket.price) * quantity)} ETB`}
                  </Button>
                ) : (
                  <ChapaCheckoutForm
                    customerInfo={customerInfo}
                    quantity={quantity}
                    currentTicket={currentTicket}
                    transactionRef={transactionRef}
                  />
                )}

                <p className="text-xs text-gray-500 text-center">
                  By purchasing, you agree to our terms and conditions. 
                  Tickets are non-refundable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchaseStandalone;
