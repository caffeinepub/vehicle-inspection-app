import { useState } from 'react';
import { useGetInspectionsByStatus } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Car, Eye, Loader2 } from 'lucide-react';
import InspectionDetailsDialog from './InspectionDetailsDialog';
import { ReportStatus } from '../backend';
import type { VehicleInspectionPublic, UserProfilePublic } from '../backend';

interface ReviewQueueProps {
  userProfile: UserProfilePublic;
  isAdmin: boolean;
}

export default function ReviewQueue({ userProfile, isAdmin }: ReviewQueueProps) {
  const { data: pendingInspections, isLoading } = useGetInspectionsByStatus(ReportStatus.pending);
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspectionPublic | null>(null);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!pendingInspections || pendingInspections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <Car className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No Pending Reviews</h3>
        <p className="text-sm text-muted-foreground">
          All inspection reports have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Pending Reviews</h2>
        <p className="text-sm text-muted-foreground">
          {pendingInspections.length} report{pendingInspections.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingInspections.map((inspection) => (
          <Card key={inspection.id} className="border-2 border-yellow-200 bg-yellow-50/50 transition-shadow hover:shadow-lg dark:border-yellow-900 dark:bg-yellow-950/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {inspection.make} {inspection.model}
                </CardTitle>
                <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                  Pending
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Year: {inspection.year}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="h-4 w-4" />
                  <span className="font-mono">{inspection.licensePlate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(inspection.timestamp)}</span>
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium">Inspector:</span> {inspection.inspectorName}
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => setSelectedInspection(inspection)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Review Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedInspection && (
        <InspectionDetailsDialog
          inspection={selectedInspection}
          open={!!selectedInspection}
          onClose={() => setSelectedInspection(null)}
          userProfile={userProfile}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
