'use client';

import { GuardianDashboard } from '@/components/features/guardian-dashboard';
import { SeniorDashboard } from '@/components/features/senior-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  if (isUserLoading || isProfileLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    )
  }

  if (userProfile?.userType === 'senior') {
    return <SeniorDashboard userProfile={userProfile} />;
  }
  
  if (userProfile?.userType === 'guardian') {
      return <GuardianDashboard userProfile={userProfile} />
  }

  // Fallback for other roles or if profile is not loaded
  return (
    <div>
        <h1 className="mb-4 text-3xl font-bold text-foreground">
            Welcome to ElderLink
        </h1>
        <p className="text-muted-foreground">Your profile is being set up. Please wait a moment.</p>
    </div>
  );
}
