
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ticket, Download } from "lucide-react";
import TicketDesign from "./TicketDesign";
import { Tables } from '@/integrations/supabase/types';

type Purchase = Tables<'purchases'>;
type Ticket = Tables<'tickets'>;

interface TicketPurchaseSuccessProps {
  purchase: Purchase;
  ticket: Ticket;
  onBackToAdmin?: () => void;
  onDownloadTicket: () => void;
}

const TicketPurchaseSuccess = ({ 
  purchase, 
  ticket, 
  onBackToAdmin, 
  onDownloadTicket 
}: TicketPurchaseSuccessProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {onBackToAdmin && (
          <Button 
            variant="ghost" 
            onClick={onBackToAdmin}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        )}

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-700">Purchase Successful!</CardTitle>
            <CardDescription className="text-green-600">
              Your tickets for {ticket.event_name} have been confirmed
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              Ticket ID: {purchase.ticket_id}
            </Badge>
            <p className="text-sm text-green-600">
              A confirmation email has been sent to {purchase.customer_email}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Quantity:</strong> {purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total Amount:</strong> ${purchase.total_amount}
              </p>
            </div>
            <Button 
              onClick={onDownloadTicket}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Ticket</CardTitle>
            <CardDescription>Save this ticket for event entry</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketDesign 
              ticketId={purchase.ticket_id}
              customerName={purchase.customer_name}
              eventData={{
                eventName: ticket.event_name,
                date: ticket.date,
                time: ticket.time,
                venue: ticket.venue,
                price: Number(ticket.price)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketPurchaseSuccess;
