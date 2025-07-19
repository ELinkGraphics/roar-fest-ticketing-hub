import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, Flashlight, FlashlightOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
}

const QRScanner = ({ onScan, isActive }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    const getDevices = async () => {
      try {
        const videoDevices = await readerRef.current?.listVideoInputDevices();
        if (videoDevices) {
          setDevices(videoDevices);
          // Prefer back camera for mobile
          const backCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedDevice(backCamera?.deviceId || videoDevices[0]?.deviceId || "");
        }
      } catch (error) {
        console.error("Error getting devices:", error);
        toast({
          title: "Camera Error",
          description: "Unable to access camera devices",
          variant: "destructive"
        });
      }
    };

    getDevices();

    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanning();
    } else if (!isActive && isScanning) {
      stopScanning();
    }
  }, [isActive]);

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current || !selectedDevice) return;

    try {
      setIsScanning(true);
      
      // Request camera with torch capability
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevice,
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Check for flash capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setHasFlash(!!(capabilities as any).torch);

      await readerRef.current.decodeFromVideoDevice(
        selectedDevice,
        videoRef.current,
        (result, error) => {
          if (result) {
            onScan(result.getText());
            // Don't stop scanning automatically - let user control it
          }
          if (error && !(error.name === 'NotFoundException')) {
            console.error("Scan error:", error);
          }
        }
      );
    } catch (error) {
      console.error("Failed to start scanning:", error);
      setIsScanning(false);
      toast({
        title: "Camera Error",
        description: "Failed to start camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
    setFlashOn(false);
  };

  const toggleFlash = async () => {
    if (!hasFlash) return;
    
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        await track.applyConstraints({
          advanced: [{ torch: !flashOn } as any]
        });
        setFlashOn(!flashOn);
      }
    } catch (error) {
      console.error("Flash toggle error:", error);
      toast({
        title: "Flash Error",
        description: "Unable to control camera flash",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg">QR Code Scanner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '75%' }}>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Camera not active</p>
              </div>
            </div>
          )}
          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                <div className="h-px bg-red-500 shadow-lg animate-pulse"></div>
              </div>
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-red-500"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-red-500"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-red-500"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-red-500"></div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={isScanning ? stopScanning : startScanning}
            variant={isScanning ? "destructive" : "default"}
            size="lg"
            className="flex-1"
          >
            {isScanning ? (
              <>
                <CameraOff className="h-5 w-5 mr-2" />
                Stop Scanner
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Start Scanner
              </>
            )}
          </Button>
          
          {hasFlash && (
            <Button
              onClick={toggleFlash}
              variant="outline"
              size="lg"
              disabled={!isScanning}
            >
              {flashOn ? (
                <FlashlightOff className="h-5 w-5" />
              ) : (
                <Flashlight className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {devices.length > 1 && (
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={isScanning}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>Position QR code within the frame to scan</p>
          <p className="text-xs mt-1">Make sure there's good lighting</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;