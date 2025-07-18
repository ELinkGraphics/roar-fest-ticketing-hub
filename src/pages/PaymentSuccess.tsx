import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TicketPurchaseSuccess from "@/components/TicketPurchaseSuccess";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "failed">("loading");
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);

  useEffect(() => {
    const verifyPayment = async () => {
      const txRef = searchParams.get("tx_ref");
      
      if (!txRef) {
        setVerificationStatus("failed");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-chapa-payment", {
          body: { tx_ref: txRef }
        });

        if (error) {
          console.error("Verification error:", error);
          setVerificationStatus("failed");
          toast({
            title: "Payment Verification Failed",
            description: "Unable to verify your payment. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        if (data.success && data.payment_status === "completed") {
          setVerificationStatus("success");
          setPurchaseData(data.purchase);
          
          // Load event data and guests
          await loadEventAndGuests(data.purchase);
          
          toast({
            title: "Payment Successful!",
            description: "Your ticket purchase has been confirmed.",
          });
        } else {
          setVerificationStatus("failed");
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setVerificationStatus("failed");
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  const loadEventAndGuests = async (purchase: any) => {
    try {
      // Load event data
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', purchase.ticket_id)
        .single();

      if (ticketError) throw ticketError;
      setEventData(ticketData);

      // Load guests
      const { data: guestData, error: guestError } = await supabase
        .from('ticket_guests')
        .select('*')
        .eq('purchase_id', purchase.id)
        .order('guest_order');

      if (guestError) throw guestError;
      setGuests(guestData || []);
    } catch (error) {
      console.error("Error loading additional data:", error);
    }
  };

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <Loader className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === "success" && purchaseData && eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <TicketPurchaseSuccess
          purchase={purchaseData}
          eventData={eventData}
          guests={guests}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          {verificationStatus === "success" ? (
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          )}
          <CardTitle className="text-2xl">
            {verificationStatus === "success" ? "Payment Successful!" : "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verificationStatus === "failed" && (
            <p className="text-gray-600">
              Your payment could not be processed. Please try again or contact support.
            </p>
          )}
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/tickets")} 
              className="w-full"
              variant={verificationStatus === "success" ? "default" : "outline"}
            >
              {verificationStatus === "success" ? "Purchase Another Ticket" : "Try Again"}
            </Button>
            {verificationStatus === "failed" && (
              <Button 
                onClick={() => navigate("/tickets")} 
                className="w-full"
              >
                Back to Tickets
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;