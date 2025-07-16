
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  DollarSign, 
  Ticket, 
  TrendingUp, 
  Download, 
  Calendar,
  MapPin,
  Clock
} from "lucide-react";
import TicketDesign from "./TicketDesign";

const AdminDashboard = () => {
  const [ticketData, setTicketData] = useState({
    eventName: "Roar Fest 2024",
    date: "2024-08-15",
    time: "10:00 AM",
    venue: "Central Park Carnival Grounds",
    price: 25
  });

  const [purchasedTickets] = useState([
    { id: "RF001", name: "Sarah Johnson", email: "sarah@email.com", purchaseDate: "2024-07-15", amount: 25 },
    { id: "RF002", name: "Mike Chen", email: "mike@email.com", purchaseDate: "2024-07-14", amount: 25 },
    { id: "RF003", name: "Emma Davis", email: "emma@email.com", purchaseDate: "2024-07-13", amount: 25 },
    { id: "RF004", name: "Alex Wilson", email: "alex@email.com", purchaseDate: "2024-07-12", amount: 25 },
    { id: "RF005", name: "Lisa Brown", email: "lisa@email.com", purchaseDate: "2024-07-11", amount: 25 },
  ]);

  const totalRevenue = purchasedTickets.reduce((sum, ticket) => sum + ticket.amount, 0);
  const totalTickets = purchasedTickets.length;

  const downloadTicket = (ticketId: string, customerName: string) => {
    // Create a temporary link to download the ticket
    const link = document.createElement('a');
    link.href = '#';
    link.download = `RoarFest_Ticket_${ticketId}.pdf`;
    
    // In a real app, this would generate and download an actual PDF
    alert(`Downloading ticket ${ticketId} for ${customerName}`);
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-white shadow-md">
        <TabsTrigger value="overview" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
          Overview
        </TabsTrigger>
        <TabsTrigger value="tickets" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
          Tickets
        </TabsTrigger>
        <TabsTrigger value="settings" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue}</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalTickets}</div>
              <p className="text-xs text-muted-foreground">+5 new today</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendees</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalTickets}</div>
              <p className="text-xs text-muted-foreground">Expected attendance</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">68%</div>
              <p className="text-xs text-muted-foreground">+3% improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-orange-600" />
              Recent Ticket Purchases
            </CardTitle>
            <CardDescription>Latest ticket sales and customer information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchasedTickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {ticket.id}
                    </Badge>
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      <p className="text-sm text-gray-500">{ticket.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${ticket.amount}</p>
                    <p className="text-sm text-gray-500">{ticket.purchaseDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tickets" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Purchased Tickets</CardTitle>
            <CardDescription>Manage and download tickets for attendees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchasedTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-orange-600">{ticket.id}</Badge>
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      <p className="text-sm text-gray-500">{ticket.email}</p>
                      <p className="text-xs text-gray-400">Purchased: {ticket.purchaseDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${ticket.amount}</p>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Paid
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => downloadTicket(ticket.id, ticket.name)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Design Preview</CardTitle>
            <CardDescription>Preview of the downloadable ticket design</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketDesign 
              ticketId="RF001"
              customerName="Sample Customer"
              eventData={ticketData}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Event Configuration
            </CardTitle>
            <CardDescription>Manage event details and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input 
                  id="eventName"
                  value={ticketData.eventName}
                  onChange={(e) => setTicketData({...ticketData, eventName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="price">Ticket Price ($)</Label>
                <Input 
                  id="price"
                  type="number"
                  value={ticketData.price}
                  onChange={(e) => setTicketData({...ticketData, price: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="date">Event Date</Label>
                <Input 
                  id="date"
                  type="date"
                  value={ticketData.date}
                  onChange={(e) => setTicketData({...ticketData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="time">Event Time</Label>
                <Input 
                  id="time"
                  type="time"
                  value={ticketData.time}
                  onChange={(e) => setTicketData({...ticketData, time: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input 
                id="venue"
                value={ticketData.venue}
                onChange={(e) => setTicketData({...ticketData, venue: e.target.value})}
              />
            </div>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboard;
