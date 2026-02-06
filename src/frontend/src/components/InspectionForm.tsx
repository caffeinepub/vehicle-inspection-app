import { useState } from 'react';
import { useSubmitInspection } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import CameraCaptureDialog from './CameraCaptureDialog';

interface InspectionFormProps {
  onSuccess: () => void;
}

export default function InspectionForm({ onSuccess }: InspectionFormProps) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');
  const [glassOption, setGlassOption] = useState('');
  const [damages, setDamages] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<ExternalBlob[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);

  const { mutate: submitInspection, isPending } = useSubmitInspection();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    const newPhotos: ExternalBlob[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        newPhotos.push(blob);
      }
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} photo(s) added`);
    } catch (error) {
      toast.error('Failed to upload photos');
      console.error(error);
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleCameraCapture = (blob: ExternalBlob) => {
    setPhotos([...photos, blob]);
    toast.success('Photo captured successfully');
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!make || !model || !year || !vin || !licensePlate || !mileage || !condition || !glassOption) {
      toast.error('Please fill in all required fields');
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      toast.error('Please enter a valid year');
      return;
    }

    const mileageNum = parseInt(mileage);
    if (isNaN(mileageNum) || mileageNum < 0) {
      toast.error('Please enter a valid mileage');
      return;
    }

    const id = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    submitInspection(
      {
        id,
        make,
        model,
        year: yearNum,
        vin,
        licensePlate,
        mileage: BigInt(mileageNum),
        condition,
        damages,
        notes,
        photos,
        glassOption: { __kind__: 'other', other: glassOption },
      },
      {
        onSuccess: () => {
          toast.success('Inspection report submitted successfully!');
          // Reset form
          setMake('');
          setModel('');
          setYear('');
          setVin('');
          setLicensePlate('');
          setMileage('');
          setCondition('');
          setGlassOption('');
          setDamages('');
          setNotes('');
          setPhotos([]);
          onSuccess();
        },
        onError: (error) => {
          toast.error(`Failed to submit inspection: ${error.message}`);
        },
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>New Vehicle Inspection</CardTitle>
          <CardDescription>Complete the form below to create a new inspection report</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  placeholder="e.g., Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="e.g., Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="e.g., 2020"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN *</Label>
                <Input
                  id="vin"
                  placeholder="Vehicle Identification Number"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate *</Label>
                <Input
                  id="licensePlate"
                  placeholder="e.g., ABC-1234"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage *</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="e.g., 45000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Vehicle Condition *</Label>
              <Select value={condition} onValueChange={setCondition} required>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="glassOption">Glass Option *</Label>
              <Select value={glassOption} onValueChange={setGlassOption} required>
                <SelectTrigger id="glassOption">
                  <SelectValue placeholder="Select glass option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rear Wind Shield Glass">Rear Wind Shield Glass</SelectItem>
                  <SelectItem value="Front Wind Shield Glass">Front Wind Shield Glass</SelectItem>
                  <SelectItem value="Left Front Door Glass">Left Front Door Glass</SelectItem>
                  <SelectItem value="Right Front Door Glass">Right Front Door Glass</SelectItem>
                  <SelectItem value="Left Rear Door Glass">Left Rear Door Glass</SelectItem>
                  <SelectItem value="Right Rear Door Glass">Right Rear Door Glass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="damages">Visible Damages</Label>
              <Textarea
                id="damages"
                placeholder="Describe any visible damages, scratches, dents, etc."
                value={damages}
                onChange={(e) => setDamages(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional observations or comments"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Vehicle Photos</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                  className="flex-1 cursor-pointer"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCameraDialogOpen(true)}
                  disabled={uploadingPhotos}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
                {uploadingPhotos && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border">
                      <img
                        src={photo.getDirectURL()}
                        alt={`Vehicle photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending || uploadingPhotos}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Inspection Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <CameraCaptureDialog
        open={cameraDialogOpen}
        onOpenChange={setCameraDialogOpen}
        onCapture={handleCameraCapture}
      />
    </>
  );
}
