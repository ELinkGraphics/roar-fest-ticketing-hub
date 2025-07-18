
import { QrCode, Calendar, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TicketDesignProps {
  ticketId: string;
  customerName: string;
  eventData: {
    eventName: string;
    date: string;
    time: string;
    venue: string;
    price: number;
  };
  qrCode?: string | null;
}

const TicketDesign = ({ ticketId, customerName, eventData, qrCode }: TicketDesignProps) => {
  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden relative">
        {/* Main Ticket Section */}
        <div className="relative">
          {/* Banner Background */}
          <div className="h-48 relative overflow-hidden">
            <img 
              src="/lovable-uploads/e48b0098-8372-4d7e-af4d-f99de18763c0.png"
              alt="Roar Fest Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          {/* Ticket Content */}
          <div className="p-6 bg-white">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {eventData.eventName}
                </h2>
                <p className="text-gray-600 font-medium">{customerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-600">Aug 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-600">{eventData.time}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 mt-1" />
                <div>
                  <p className="font-medium text-sm">Venue</p>
                  <p className="text-gray-600 text-sm">{eventData.venue}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Ticket ID</p>
                  <p className="font-mono font-bold text-orange-600">{ticketId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-bold text-green-600">${eventData.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Edge */}
        <div className="h-4 bg-gray-100 relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-white"></div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white"></div>
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-400 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Tear-off Check-in Section */}
        <div className="bg-white p-4 border-t-2 border-dashed border-gray-300">
          <div className="text-center space-y-3">
            <h3 className="font-bold text-gray-800">EVENT CHECK-IN</h3>
            
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-10 h-10 text-orange-600" />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Scan QR Code for Entry</p>
              <p className="font-mono text-sm font-bold">{ticketId}</p>
              <p className="text-xs text-gray-500">Keep this section for admission</p>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>✓ Present this ticket at gate</p>
              <p>✓ Valid for event date only</p>
              <p>✓ Non-transferable</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Ticket Instructions */}
      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <h4 className="font-medium text-orange-800 mb-2">Important Instructions:</h4>
        <ul className="text-xs text-orange-700 space-y-1">
          <li>• Bring this ticket (printed or digital) to the event</li>
          <li>• Present the check-in section for entry verification</li>
          <li>• Keep the main ticket as a souvenir</li>
          <li>• Gates open 30 minutes before event start time</li>
        </ul>
      </div>
    </div>
  );
};

export default TicketDesign;
