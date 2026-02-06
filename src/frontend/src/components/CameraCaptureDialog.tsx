import { useState, useEffect } from 'react';
import { useCamera } from '../camera/useCamera';
import { ExternalBlob } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Loader2, SwitchCamera, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCameraPreferences, saveCameraPreferences, getQualityConfig } from '../utils/cameraSettings';

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: ExternalBlob) => void;
}

export default function CameraCaptureDialog({ open, onOpenChange, onCapture }: CameraCaptureDialogProps) {
  const [preferences, setPreferences] = useState(getCameraPreferences());
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [hasEnumeratedDevices, setHasEnumeratedDevices] = useState(false);

  const qualityConfig = getQualityConfig(preferences.quality);

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: preferences.facingMode,
    ...qualityConfig,
    format: 'image/jpeg',
  });

  // Enumerate devices after camera permission is granted
  useEffect(() => {
    if (isActive && !hasEnumeratedDevices) {
      enumerateDevices();
    }
  }, [isActive, hasEnumeratedDevices]);

  // Start camera when dialog opens
  useEffect(() => {
    if (open && isSupported) {
      startCamera();
    }
    return () => {
      if (open) {
        stopCamera();
      }
    };
  }, [open, isSupported]);

  // Stop camera when dialog closes
  useEffect(() => {
    if (!open) {
      stopCamera();
      setHasEnumeratedDevices(false);
    }
  }, [open]);

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      setHasEnumeratedDevices(true);
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        onCapture(blob);
        onOpenChange(false);
      } catch (err) {
        console.error('Failed to process captured photo:', err);
      }
    }
  };

  const handleSwitchCamera = async () => {
    const newFacingMode: 'user' | 'environment' = currentFacingMode === 'user' ? 'environment' : 'user';
    const success = await switchCamera(newFacingMode);
    if (success) {
      setPreferences((prev) => {
        const updated = { ...prev, facingMode: newFacingMode };
        saveCameraPreferences(updated);
        return updated;
      });
    }
  };

  const handleQualityChange = (quality: 'standard' | 'high') => {
    setPreferences((prev) => {
      const updated = { ...prev, quality };
      saveCameraPreferences(updated);
      return updated;
    });
  };

  const handleClose = () => {
    stopCamera();
    onOpenChange(false);
  };

  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.type) {
      case 'permission':
        return 'Camera permission denied. Please allow camera access in your browser settings and try again.';
      case 'not-supported':
        return 'Camera is not supported in your browser. Please use a modern browser or upload photos instead.';
      case 'not-found':
        return 'No camera found on your device. Please upload photos instead.';
      case 'unknown':
        return 'An error occurred while accessing the camera. Please try again or upload photos instead.';
      default:
        return 'An error occurred while accessing the camera. Please try again or upload photos instead.';
    }
  };

  if (isSupported === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Camera Not Supported</DialogTitle>
            <DialogDescription>
              Your browser does not support camera access. Please upload photos using the file input instead.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Capture Photo</DialogTitle>
          <DialogDescription>Take a photo of the vehicle for the inspection report</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Settings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quality">Photo Quality</Label>
              <Select value={preferences.quality} onValueChange={handleQualityChange} disabled={isLoading}>
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (1280x720)</SelectItem>
                  <SelectItem value="high">High (1920x1080)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {availableDevices.length > 1 && (
              <div className="space-y-2">
                <Label>Camera</Label>
                <div className="text-sm text-muted-foreground">
                  {availableDevices.length} camera(s) available
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorMessage()}</AlertDescription>
            </Alert>
          )}

          {/* Camera Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ minHeight: '300px' }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCapture} disabled={!isActive || isLoading} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Capture Photo
            </Button>

            <Button
              variant="outline"
              onClick={handleSwitchCamera}
              disabled={!isActive || isLoading}
              title="Switch camera"
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>

            {error && (
              <Button variant="outline" onClick={retry} disabled={isLoading}>
                Retry
              </Button>
            )}

            <Button variant="outline" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>

          {/* Fallback Message */}
          {error && (
            <p className="text-center text-sm text-muted-foreground">
              Having trouble? You can close this dialog and use the file upload option instead.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
