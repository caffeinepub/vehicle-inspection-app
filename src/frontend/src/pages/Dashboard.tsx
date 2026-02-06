import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllInspections, useGetCallerUserProfile } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import InspectionForm from '../components/InspectionForm';
import InspectionsList from '../components/InspectionsList';
import ReviewQueue from '../components/ReviewQueue';
import { Loader2, ClipboardList, FileText, CheckSquare } from 'lucide-react';

export default function Dashboard() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: inspections, isLoading: inspectionsLoading, refetch: refetchInspections } = useGetAllInspections();
  const { actor } = useActor();

  const [isAdminResolved, setIsAdminResolved] = useState(false);
  const [adminStatus, setAdminStatus] = useState(false);

  useEffect(() => {
    if (actor) {
      actor.isCallerAdmin()
        .then((result) => {
          setAdminStatus(result);
          setIsAdminResolved(true);
        })
        .catch(() => {
          setAdminStatus(false);
          setIsAdminResolved(true);
        });
    }
  }, [actor]);

  if (profileLoading || inspectionsLoading || !isAdminResolved) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Unable to load user profile</p>
      </div>
    );
  }

  const isInspector = userProfile.role === 'inspector';

  const handleInspectionSuccess = () => {
    refetchInspections();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile.name}
        </p>
      </div>

      <Tabs defaultValue={isInspector ? 'my-reports' : 'all-reports'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
          {isInspector ? (
            <>
              <TabsTrigger value="my-reports" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                My Reports
              </TabsTrigger>
              <TabsTrigger value="new-inspection" className="gap-2">
                <FileText className="h-4 w-4" />
                New Inspection
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="all-reports" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                All Reports
              </TabsTrigger>
              <TabsTrigger value="review-queue" className="gap-2">
                <CheckSquare className="h-4 w-4" />
                Review Queue
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {isInspector ? (
          <>
            <TabsContent value="my-reports">
              <InspectionsList
                inspections={inspections || []}
                userProfile={userProfile}
                isAdmin={adminStatus}
              />
            </TabsContent>
            <TabsContent value="new-inspection">
              <InspectionForm onSuccess={handleInspectionSuccess} />
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="all-reports">
              <InspectionsList
                inspections={inspections || []}
                userProfile={userProfile}
                isAdmin={adminStatus}
              />
            </TabsContent>
            <TabsContent value="review-queue">
              <ReviewQueue userProfile={userProfile} isAdmin={adminStatus} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
