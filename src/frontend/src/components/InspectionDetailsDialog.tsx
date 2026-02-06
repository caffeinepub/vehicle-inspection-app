import { useState } from 'react';
import { useReviewInspection } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, Calendar, User, Car, Gauge, FileText, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { VehicleInspectionPublic, UserProfilePublic } from '../backend';
import { ReportStatus } from '../backend';
import FormalReportView from './FormalReportView';

interface InspectionDetailsDialogProps {
  inspection: VehicleInspectionPublic;
  open: boolean;
  onClose: () => void;
  userProfile: UserProfilePublic;
  isAdmin: boolean;
}

export default function InspectionDetailsDialog({
  inspection,
  open,
  onClose,
  userProfile,
  isAdmin,
}: InspectionDetailsDialogProps) {
  const [reviewComment, setReviewComment] = useState('');
  const [showFormalReport, setShowFormalReport] = useState(false);
  const { mutate: reviewInspection, isPending } = useReviewInspection();

  const isInsuranceOfficer = userProfile.role === 'insuranceOfficer';
  const canReview = isInsuranceOfficer && inspection.reportStatus === 'pending';

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
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReview = (status: ReportStatus) => {
    if (!reviewComment.trim() && status === ReportStatus.rejected) {
      toast.error('Please provide a comment when rejecting a report');
      return;
    }

    reviewInspection(
      {
        reportId: inspection.id,
        status,
        comment: reviewComment.trim() || (status === ReportStatus.approved ? 'Approved' : ''),
      },
      {
        onSuccess: () => {
          toast.success(`Report ${status === ReportStatus.approved ? 'approved' : 'rejected'} successfully`);
          setReviewComment('');
          onClose();
        },
        onError: (error) => {
          toast.error(`Failed to review report: ${error.message}`);
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  {inspection.make} {inspection.model} ({inspection.year})
                </DialogTitle>
                <DialogDescription>Inspection Report Details</DialogDescription>
              </div>
              {getStatusBadge(inspection.reportStatus)}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Formal Report Button */}
              <div className="rounded-lg border bg-accent/50 p-4">
                <Button
                  onClick={() => setShowFormalReport(true)}
                  className="w-full"
                  variant="default"
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  View Formal Report with Letterhead
                </Button>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </h3>
                <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">VIN</span>
                    <p className="font-mono text-sm">{inspection.vin}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">License Plate</span>
                    <p className="font-mono text-sm">{inspection.licensePlate}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Mileage</span>
                    <p className="flex items-center gap-1 text-sm">
                      <Gauge className="h-4 w-4" />
                      {inspection.mileage.toString()} miles
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Condition</span>
                    <p className="text-sm">{inspection.condition}</p>
                  </div>
                </div>
              </div>

              {/* Inspection Details */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5" />
                  Inspection Details
                </h3>
                <div className="space-y-3 rounded-lg border p-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Visible Damages</span>
                    <p className="mt-1 text-sm">{inspection.damages || 'No damages reported'}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Additional Notes</span>
                    <p className="mt-1 text-sm">{inspection.notes || 'No additional notes'}</p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              {inspection.photos.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Vehicle Photos ({inspection.photos.length})</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {inspection.photos.map((photo, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={photo.getDirectURL()}
                          alt={`Vehicle photo ${index + 1}`}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspector Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <User className="h-5 w-5" />
                  Inspector Information
                </h3>
                <div className="rounded-lg border p-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Inspector Name</span>
                    <p className="text-sm">{inspection.inspectorName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Inspection Date</span>
                    <p className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(inspection.timestamp)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval History */}
              {inspection.approvalComments.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Review History</h3>
                  <div className="space-y-3">
                    {inspection.approvalComments.map((comment, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">{comment.officerName}</span>
                          {getStatusBadge(comment.status)}
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">{comment.comment}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Section for Insurance Officers */}
              {canReview && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Review Report</h3>
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewComment">Review Comment</Label>
                      <Textarea
                        id="reviewComment"
                        placeholder="Add your review comments here..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            {canReview ? (
              <>
                <Button variant="outline" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReview(ReportStatus.rejected)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
                <Button onClick={() => handleReview(ReportStatus.approved)} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FormalReportView
        inspection={inspection}
        open={showFormalReport}
        onClose={() => setShowFormalReport(false)}
        isAdmin={isAdmin}
      />
    </>
  );
}
