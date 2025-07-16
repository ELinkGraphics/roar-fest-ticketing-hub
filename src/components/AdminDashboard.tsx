
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
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
import { useTicketData } from "@/hooks/useTicketData";
import TicketDesign from "./TicketDesign";

const AdminDashboard = () => {
  const { tickets, purchases, loading, updateTicket } = useTicketData();
  const [editingTicket, setEditingTicket] = useState<any>(null);

  const currentTicket = tickets[0];

  const handleUpdateTicket = async () => {
    if (!editingTicket || !currentTicket) return;

    try {
      await updateTicket(currentTicket.id, {
        event_name: editingTicket.event_name,
        date: editingTicket.date,
        time: editingTicket.time,
        venue: editingTicket.venue,
        price: editingTicket.price
      });

      toast({
        title: "Event Updated",
        description: "Event details have been updated successfully.",
      });
      setEditingTicket(null);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update event details.",
        variant: "destructive"
      });
    }
  };

  const downloadTicket = (ticketId: string, customerName: string) => {
    toast({
      title: "Ticket Downloaded",
      description: `Downloading ticket ${ticketId} for ${customerName}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = purchases.reduce((sum, purchase) => sum + Number(purchase.total_amount), 0);
  const totalTickets = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const todayPurchases = purchases.filter(purchase => {
    const today = new Date().toDateString();
    const purchaseDate = new Date(purchase.purchase_date).toDateString();
    return today === purchaseDate;
  }).length;

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
              <div className="text-2xl font-bold text-green-600">{totalRevenue} ETB</div>
              <p className="text-xs text-muted-foreground">
                {purchases.length} total purchase{purchases.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                {todayPurchases} sold today
              </p>
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
              <CardTitle className="text-sm font-medium">Average Order</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {purchases.length > 0 ? Math.round(totalRevenue / purchases.length) : 0} ETB
              </div>
              <p className="text-xs text-muted-foreground">Per purchase</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-orange-600" />
              Recent Ticket Purchases
              <Badge variant="secondary" className="bg-green-100 text-green-700 ml-auto">
                Live Updates
              </Badge>
            </CardTitle>
            <CardDescription>Latest ticket sales and customer information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchases.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No purchases yet</p>
              ) : (
                purchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        {purchase.ticket_id}
                      </Badge>
                      <div>
                        <p className="font-medium">{purchase.customer_name}</p>
                        <p className="text-sm text-gray-500">{purchase.customer_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Number(purchase.total_amount)} ETB</p>
                      <div className="text-sm text-gray-500">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          purchase.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 
                          purchase.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {purchase.payment_status || 'completed'}
                        </span>
                        {purchase.payment_method && (
                          <div className="text-xs text-gray-400">
                            via {purchase.payment_method}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
              {purchases.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tickets purchased yet</p>
              ) : (
                purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-orange-600">{purchase.ticket_id}</Badge>
                      <div>
                        <p className="font-medium">{purchase.customer_name}</p>
                        <p className="text-sm text-gray-500">{purchase.customer_email}</p>
                        <p className="text-xs text-gray-400">
                          Purchased: {new Date(purchase.purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{Number(purchase.total_amount)} ETB</p>
                        <p className="text-sm text-gray-500">Qty: {purchase.quantity}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          {purchase.transaction_reference && (
                            <div>Ref: {purchase.transaction_reference}</div>
                          )}
                          {purchase.chapa_transaction_id && (
                            <div>Chapa ID: {purchase.chapa_transaction_id}</div>
                          )}
                        </div>
                        <Badge variant="outline" className={`${
                          purchase.payment_status === 'completed' ? 'text-green-600 border-green-200' : 
                          purchase.payment_status === 'pending' ? 'text-yellow-600 border-yellow-200' : 
                          'text-red-600 border-red-200'
                        }`}>
                          {purchase.payment_status || 'completed'}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => downloadTicket(purchase.ticket_id, purchase.customer_name)}
                        disabled={purchase.payment_status !== 'completed'}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Preview */}
        {currentTicket && (
          <Card>
            <CardHeader>
              <CardTitle>Ticket Design Preview</CardTitle>
              <CardDescription>Preview of the downloadable ticket design</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketDesign 
                ticketId="SAMPLE"
                customerName="Sample Customer"
                eventData={{
                  eventName: currentTicket.event_name,
                  date: currentTicket.date,
                  time: currentTicket.time,
                  venue: currentTicket.venue,
                  price: Number(currentTicket.price)
                }}
              />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        {currentTicket && (
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
                    value={editingTicket?.event_name || currentTicket.event_name}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      event_name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Ticket Price (ETB)</Label>
                  <Input 
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingTicket?.price || currentTicket.price}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      price: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Event Date</Label>
                  <Input 
                    id="date"
                    type="date"
                    value={editingTicket?.date || currentTicket.date}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      date: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Event Time</Label>
                  <Input 
                    id="time"
                    type="time"
                    value={editingTicket?.time || currentTicket.time}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      time: e.target.value
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input 
                  id="venue"
                  value={editingTicket?.venue || currentTicket.venue}
                  onChange={(e) => setEditingTicket({
                    ...editingTicket,
                    venue: e.target.value
                  })}
                />
              </div>
              <Button 
                onClick={handleUpdateTicket}
                disabled={!editingTicket}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboard;
