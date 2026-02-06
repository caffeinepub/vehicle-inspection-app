import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Printer, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGetLetterheadInfo, useUpdateLetterheadInfo } from '../hooks/useQueries';
import type { VehicleInspectionPublic, LetterheadInfo } from '../backend';

interface FormalReportViewProps {
  inspection: VehicleInspectionPublic;
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export default function FormalReportView({
  inspection,
  open,
  onClose,
  isAdmin,
}: FormalReportViewProps) {
  const { data: letterheadInfo, isLoading: loadingLetterhead } = useGetLetterheadInfo();
  const { mutate: updateLetterhead, isPending: updatingLetterhead } = useUpdateLetterheadInfo();
  const [isEditingLetterhead, setIsEditingLetterhead] = useState(false);
  const [editedLetterhead, setEditedLetterhead] = useState<LetterheadInfo | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600 print:bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditLetterhead = () => {
    if (letterheadInfo) {
      setEditedLetterhead({ ...letterheadInfo });
      setIsEditingLetterhead(true);
    }
  };

  const handleSaveLetterhead = () => {
    if (editedLetterhead) {
      updateLetterhead(editedLetterhead, {
        onSuccess: () => {
          toast.success('Letterhead information updated successfully');
          setIsEditingLetterhead(false);
          setEditedLetterhead(null);
        },
        onError: (error) => {
          toast.error(`Failed to update letterhead: ${error.message}`);
        },
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditingLetterhead(false);
    setEditedLetterhead(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
    toast.info('Use your browser\'s print dialog to save as PDF');
  };

  if (loadingLetterhead) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentLetterhead = editedLetterhead || letterheadInfo;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] print:max-w-full print:max-h-full">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle>Formal Inspection Report</DialogTitle>
            <div className="flex gap-2">
              {isAdmin && !isEditingLetterhead && (
                <Button variant="outline" size="sm" onClick={handleEditLetterhead}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Letterhead
                </Button>
              )}
              {isEditingLetterhead && (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveLetterhead} disabled={updatingLetterhead}>
                    {updatingLetterhead ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </>
              )}
              {!isEditingLetterhead && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button size="sm" onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-8rem)] print:max-h-full">
          <div ref={reportRef} className="bg-white text-black p-8 print:p-12">
            {/* Company Letterhead */}
            <div className="mb-8 border-b-2 border-primary pb-6">
              <div className="flex items-start justify-between">
                <img
                  src="/assets/generated/insurance-logo.dim_200x200.png"
                  alt="Company Logo"
                  className="h-24 w-24 object-contain"
                />
                <div className="text-right">
                  {isEditingLetterhead && currentLetterhead ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="companyName" className="text-xs">Company Name</Label>
                        <Input
                          id="companyName"
                          value={currentLetterhead.companyName}
                          onChange={(e) =>
                            setEditedLetterhead({
                              ...currentLetterhead,
                              companyName: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-xs">Address</Label>
                        <Input
                          id="address"
                          value={currentLetterhead.address}
                          onChange={(e) =>
                            setEditedLetterhead({
                              ...currentLetterhead,
                              address: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactInfo" className="text-xs">Contact Information</Label>
                        <Input
                          id="contactInfo"
                          value={currentLetterhead.contactInfo}
                          onChange={(e) =>
                            setEditedLetterhead({
                              ...currentLetterhead,
                              contactInfo: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-primary">
                        {currentLetterhead?.companyName || 'Insurance Company'}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {currentLetterhead?.address || 'Company Address'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentLetterhead?.contactInfo || 'Contact Information'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Report Title */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-primary">Vehicle Inspection Report</h1>
              <p className="mt-2 text-sm text-gray-600">Report ID: {inspection.id}</p>
            </div>

            {/* Report Status */}
            <div className="mb-6 flex items-center justify-between rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
              <span className="font-semibold">Report Status:</span>
              {getStatusBadge(inspection.reportStatus)}
            </div>

            {/* Vehicle Information */}
            <div className="mb-6">
              <h3 className="mb-3 border-b border-gray-300 pb-2 text-xl font-bold text-primary">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Make:</span>
                  <span className="ml-2">{inspection.make}</span>
                </div>
                <div>
                  <span className="font-semibold">Model:</span>
                  <span className="ml-2">{inspection.model}</span>
                </div>
                <div>
                  <span className="font-semibold">Year:</span>
                  <span className="ml-2">{inspection.year}</span>
                </div>
                <div>
                  <span className="font-semibold">VIN:</span>
                  <span className="ml-2 font-mono text-sm">{inspection.vin}</span>
                </div>
                <div>
                  <span className="font-semibold">License Plate:</span>
                  <span className="ml-2 font-mono">{inspection.licensePlate}</span>
                </div>
                <div>
                  <span className="font-semibold">Mileage:</span>
                  <span className="ml-2">{inspection.mileage.toString()} miles</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Overall Condition:</span>
                  <span className="ml-2">{inspection.condition}</span>
                </div>
              </div>
            </div>

            {/* Inspector Information */}
            <div className="mb-6">
              <h3 className="mb-3 border-b border-gray-300 pb-2 text-xl font-bold text-primary">
                Inspector Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Inspector Name:</span>
                  <span className="ml-2">{inspection.inspectorName}</span>
                </div>
                <div>
                  <span className="font-semibold">Inspection Date:</span>
                  <span className="ml-2">{formatDate(inspection.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Inspection Details */}
            <div className="mb-6">
              <h3 className="mb-3 border-b border-gray-300 pb-2 text-xl font-bold text-primary">
                Inspection Details
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Visible Damages:</h4>
                  <p className="whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                    {inspection.damages || 'No damages reported'}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Additional Notes:</h4>
                  <p className="whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                    {inspection.notes || 'No additional notes'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Photos */}
            {inspection.photos.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 border-b border-gray-300 pb-2 text-xl font-bold text-primary">
                  Vehicle Photos ({inspection.photos.length})
                </h3>
                <div className="grid grid-cols-2 gap-4 print:grid-cols-3">
                  {inspection.photos.map((photo, index) => (
                    <div key={index} className="overflow-hidden rounded-lg border-2 border-gray-200">
                      <img
                        src={photo.getDirectURL()}
                        alt={`Vehicle photo ${index + 1}`}
                        className="h-48 w-full object-cover"
                      />
                      <p className="bg-gray-100 p-2 text-center text-xs font-medium">
                        Photo {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval History */}
            {inspection.approvalComments.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 border-b border-gray-300 pb-2 text-xl font-bold text-primary">
                  Review History
                </h3>
                <div className="space-y-3">
                  {inspection.approvalComments.map((comment, index) => (
                    <div key={index} className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold">{comment.officerName}</span>
                        {getStatusBadge(comment.status)}
                      </div>
                      <p className="mb-2 text-sm">{comment.comment}</p>
                      <p className="text-xs text-gray-600">{formatDate(comment.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 border-t-2 border-gray-300 pt-4 text-center text-xs text-gray-600">
              <p>This is an official vehicle inspection report.</p>
              <p className="mt-1">
                Generated on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
