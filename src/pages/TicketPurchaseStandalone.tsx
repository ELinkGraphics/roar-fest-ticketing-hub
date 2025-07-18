
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TicketPurchaseStandalone from "@/components/TicketPurchaseStandalone";
import TicketPurchaseSuccess from "@/components/TicketPurchaseSuccess";
import { useTicketData } from "@/hooks/useTicketData";

const TicketPurchaseStandalonePage = () => {
  const { tickets, createPurchase, loading } = useTicketData();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [quantity, setQuantity] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([""]);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  // Sync guest names array with quantity changes
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    
    // Adjust guest names array to match quantity
    if (newQuantity > guestNames.length) {
      // Add empty strings for new tickets
      const newNames = [...guestNames];
      while (newNames.length < newQuantity) {
        newNames.push("");
      }
      setGuestNames(newNames);
    } else if (newQuantity < guestNames.length) {
      // Remove excess names
      setGuestNames(guestNames.slice(0, newQuantity));
    }
  };

  const currentTicket = tickets[0];

  const handlePurchase = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      return;
    }

    if (!currentTicket) {
      return;
    }

    setProcessing(true);
    
    try {
      const ticketId = `RF${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const totalAmount = Number(currentTicket.price) * quantity;

      const purchase = await createPurchase({
        ticket_id: ticketId,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone || null,
        quantity,
        total_amount: totalAmount
      });

      setPurchaseData(purchase);
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadTicket = () => {
    console.log(`Downloading ticket ${purchaseData.ticket_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket information...</p>
        </div>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600">Ticket sales are currently unavailable.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (purchaseData) {
    return (
      <TicketPurchaseSuccess
        purchase={purchaseData}
        eventData={{
          event_name: currentTicket.event_name,
          date: currentTicket.date,
          time: currentTicket.time,
          venue: currentTicket.venue,
          price: currentTicket.price
        }}
        guests={guestNames.map((name, index) => ({ guest_name: name, guest_order: index + 1 }))}
      />
    );
  }

  return (
    <TicketPurchaseStandalone 
      customerInfo={customerInfo}
      setCustomerInfo={setCustomerInfo}
      quantity={quantity}
      setQuantity={handleQuantityChange}
      guestNames={guestNames}
      setGuestNames={setGuestNames}
      onPurchase={handlePurchase}
      processing={processing}
      currentTicket={currentTicket}
    />
  );
};

export default TicketPurchaseStandalonePage;
