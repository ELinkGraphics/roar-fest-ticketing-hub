
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  Ticket, 
  TrendingUp, 
  Download, 
  Share2, 
  Eye,
  Calendar,
  MapPin,
  Clock,
  Star
} from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import TicketPurchase from "@/components/TicketPurchase";
import TicketDesign from "@/components/TicketDesign";

const Index = () => {
  const [currentView, setCurrentView] = useState("admin");
  const [shareableLink, setShareableLink] = useState("");

  const generateShareableLink = () => {
    const link = `${window.location.origin}/?view=purchase`;
    setShareableLink(link);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Shareable ticket purchase link has been copied to clipboard.",
    });
  };

  // Check if we're in purchase view from URL
  const urlParams = new URLSearchParams(window.location.search);
  const viewFromUrl = urlParams.get('view');
  
  if (viewFromUrl === 'purchase' && currentView === 'admin') {
    setCurrentView('purchase');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {currentView === "admin" ? (
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <img 
                  src="/lovable-uploads/58f80963-5fd4-4b66-ae01-836925499cab.png" 
                  alt="Roar Fest Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Roar Fest Admin
                </h1>
                <p className="text-gray-600">Event Management Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={generateShareableLink}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Generate Share Link
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentView("purchase")}
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Purchase
              </Button>
            </div>
          </div>

          {shareableLink && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Label className="text-green-700 font-medium">Shareable Link:</Label>
                  <code className="bg-white px-3 py-1 rounded border text-sm flex-1">
                    {shareableLink}
                  </code>
                </div>
              </CardContent>
            </Card>
          )}

          <AdminDashboard />
        </div>
      ) : (
        <TicketPurchase onBackToAdmin={() => setCurrentView("admin")} />
      )}
    </div>
  );
};

export default Index;
