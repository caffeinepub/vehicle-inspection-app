import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Car, Eye } from 'lucide-react';
import InspectionDetailsDialog from './InspectionDetailsDialog';
import type { VehicleInspectionPublic, UserProfilePublic } from '../backend';

interface InspectionsListProps {
  inspections: VehicleInspectionPublic[];
  userProfile: UserProfilePublic;
  isAdmin: boolean;
}

export default function InspectionsList({ inspections, userProfile, isAdmin }: InspectionsListProps) {
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspectionPublic | null>(null);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  if (inspections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <Car className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No Inspections Found</h3>
        <p className="text-sm text-muted-foreground">
          {userProfile.role === 'inspector'
            ? 'Create your first inspection report to get started.'
            : 'No inspection reports available for review.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inspections.map((inspection) => (
          <Card key={inspection.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {inspection.make} {inspection.model}
                </CardTitle>
                {getStatusBadge(inspection.reportStatus)}
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
                variant="outline"
                onClick={() => setSelectedInspection(inspection)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
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
