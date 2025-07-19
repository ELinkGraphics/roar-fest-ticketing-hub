import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Clock, CheckCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UsherData {
  name: string;
  id: string;
  loginTime: string;
  checkInsToday: number;
}

interface UsherProfileProps {
  onUsherChange: (usher: UsherData | null) => void;
}

const UsherProfile = ({ onUsherChange }: UsherProfileProps) => {
  const [usher, setUsher] = useState<UsherData | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usherName, setUsherName] = useState("");
  const [usherId, setUsherId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved usher session
    const savedUsher = localStorage.getItem('checkin_usher');
    if (savedUsher) {
      const usherData = JSON.parse(savedUsher);
      setUsher(usherData);
      onUsherChange(usherData);
    }
  }, [onUsherChange]);

  const handleLogin = () => {
    if (!usherName.trim() || !usherId.trim()) {
      toast({
        title: "Login Failed",
        description: "Please enter both name and ID",
        variant: "destructive"
      });
      return;
    }

    const newUsher: UsherData = {
      name: usherName.trim(),
      id: usherId.trim(),
      loginTime: new Date().toISOString(),
      checkInsToday: 0
    };

    setUsher(newUsher);
    localStorage.setItem('checkin_usher', JSON.stringify(newUsher));
    onUsherChange(newUsher);
    setIsLoginOpen(false);
    setUsherName("");
    setUsherId("");
    
    toast({
      title: "Login Successful",
      description: `Welcome, ${newUsher.name}!`,
    });
  };

  const handleLogout = () => {
    setUsher(null);
    localStorage.removeItem('checkin_usher');
    onUsherChange(null);
    
    toast({
      title: "Logged Out",
      description: "Usher session ended",
    });
  };

  const incrementCheckIns = () => {
    if (usher) {
      const updatedUsher = {
        ...usher,
        checkInsToday: usher.checkInsToday + 1
      };
      setUsher(updatedUsher);
      localStorage.setItem('checkin_usher', JSON.stringify(updatedUsher));
      onUsherChange(updatedUsher);
    }
  };

  // Expose the increment function
  useEffect(() => {
    (window as any).incrementUsherCheckIns = incrementCheckIns;
    return () => {
      delete (window as any).incrementUsherCheckIns;
    };
  }, [usher]);

  if (!usher) {
    return (
      <Card className="mb-4 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">No Usher Logged In</p>
                <p className="text-sm text-gray-500">Please log in to start checking in guests</p>
              </div>
            </div>
            
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Usher Login</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="usher-name">Full Name</Label>
                    <Input
                      id="usher-name"
                      placeholder="Enter your full name"
                      value={usherName}
                      onChange={(e) => setUsherName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && document.getElementById('usher-id')?.focus()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usher-id">Usher ID</Label>
                    <Input
                      id="usher-id"
                      placeholder="Enter your ID number"
                      value={usherId}
                      onChange={(e) => setUsherId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                  <Button onClick={handleLogin} className="w-full bg-orange-500 hover:bg-orange-600">
                    Start Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-green-800">{usher.name}</p>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  ID: {usher.id}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-green-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Since {new Date(usher.loginTime).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{usher.checkInsToday} check-ins today</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleLogout}
            size="sm" 
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsherProfile;