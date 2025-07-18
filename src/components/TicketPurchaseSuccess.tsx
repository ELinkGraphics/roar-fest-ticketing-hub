import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Share, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TicketDesign from "./TicketDesign";

interface Guest {
  guest_name: string;
  guest_order: number;
}

interface TicketPurchaseSuccessProps {
  purchase: {
    id: string;
    ticket_id: string;
    customer_name: string;
    customer_email: string;
    quantity: number;
    total_amount: number;
    qr_code: string | null;
  };
  eventData: {
    event_name: string;
    date: string;
    time: string;
    venue: string;
    price: number;
  };
  guests: Guest[];
}

const TicketPurchaseSuccess = ({ purchase, eventData, guests }: TicketPurchaseSuccessProps) => {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const downloadTicket = async () => {
    setDownloading(true);
    try {
      // Create a canvas element to render the ticket
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add ticket content (simplified version)
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(eventData.event_name, 50, 80);

      ctx.font = '18px Arial';
      ctx.fillText(`Ticket ID: ${purchase.ticket_id}`, 50, 120);
      ctx.fillText(`Customer: ${purchase.customer_name}`, 50, 150);
      ctx.fillText(`Date: ${eventData.date}`, 50, 180);
      ctx.fillText(`Time: ${eventData.time}`, 50, 210);
      ctx.fillText(`Venue: ${eventData.venue}`, 50, 240);
      ctx.fillText(`Quantity: ${purchase.quantity}`, 50, 270);
      ctx.fillText(`Total: ${purchase.total_amount} ETB`, 50, 300);

      // Add guest names if any
      if (guests.length > 0) {
        ctx.fillText('Guests:', 50, 340);
        guests.forEach((guest, index) => {
          ctx.fillText(`${guest.guest_order}. ${guest.guest_name}`, 70, 370 + (index * 25));
        });
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ticket-${purchase.ticket_id}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Download Complete",
            description: "Your ticket has been downloaded successfully.",
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `${eventData.event_name} Ticket`,
        text: `I just purchased tickets for ${eventData.event_name}!`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Ticket link copied to clipboard.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <CardTitle className="text-2xl text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Thank you for your purchase! Your ticket has been confirmed.
            </p>
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              Ticket ID: {purchase.ticket_id}
            </Badge>
          </div>

          {/* Purchase Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Purchase Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Event:</span>
                <span className="font-medium">{eventData.event_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-medium">{eventData.date} at {eventData.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Venue:</span>
                <span className="font-medium">{eventData.venue}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{purchase.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{purchase.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-lg">{purchase.total_amount} ETB</span>
              </div>
            </div>
          </div>

          {/* Guest List */}
          {guests.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Guest List
              </h3>
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div key={guest.guest_order} className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                      {guest.guest_order}
                    </Badge>
                    <span>{guest.guest_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Display */}
          {purchase.qr_code && (
            <div className="text-center bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="font-semibold mb-4">Your QR Code</h3>
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Show this QR code at the event entrance
              </p>
            </div>
          )}

          {/* Ticket Preview */}
          <div className="border rounded-lg overflow-hidden">
            <TicketDesign
              ticketId={purchase.ticket_id}
              customerName={purchase.customer_name}
              eventData={{
                eventName: eventData.event_name,
                date: eventData.date,
                time: eventData.time,
                venue: eventData.venue,
                price: eventData.price
              }}
              qrCode={purchase.qr_code}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={downloadTicket}
              disabled={downloading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Downloading..." : "Download Ticket"}
            </Button>
            <Button
              onClick={shareTicket}
              variant="outline"
              className="flex-1"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Keep this ticket safe and bring it to the event.</p>
            <p>A copy has been sent to {purchase.customer_email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketPurchaseSuccess;