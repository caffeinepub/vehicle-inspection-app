import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'initializing';

  // Show profile setup modal only when authenticated, profile is fetched, and no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
            <div className="max-w-2xl text-center">
              <img
                src="/assets/generated/insurance-logo.dim_200x200.png"
                alt="Insurance Logo"
                className="mx-auto mb-8 h-32 w-32"
              />
              <h1 className="mb-4 text-4xl font-bold tracking-tight">Vehicle Inspection App</h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Secure vehicle inspection management for insurance purposes. Login to create and review inspection
                reports.
              </p>
              <div className="rounded-lg border bg-card p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Get Started</h2>
                <p className="mb-6 text-muted-foreground">
                  Please login to access the vehicle inspection system. Your identity is secured using Internet
                  Identity.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {showProfileSetup && <ProfileSetupModal />}
            {!showProfileSetup && userProfile && <Dashboard />}
          </>
        )}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
