'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const OnboardingModal = dynamic(
  () => import('@/components/features/onboarding-modal').then((m) => ({ default: m.OnboardingModal })),
  { ssr: false }
);

const SeniorDashboard = dynamic(
  () => import('@/components/features/senior-dashboard').then((m) => ({ default: m.SeniorDashboard })),
  {
    loading: () => (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64 max-w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

const GuardianDashboard = dynamic(
  () => import('@/components/features/guardian-dashboard').then((m) => ({ default: m.GuardianDashboard })),
  {
    loading: () => (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64 max-w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48 max-w-full" />
        <Skeleton className="h-5 w-72 max-w-full" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (userProfile?.userType === 'senior') {
    return (
      <>
        <OnboardingModal />
        <SeniorDashboard userProfile={userProfile} />
      </>
    );
  }

  if (userProfile?.userType === 'guardian') {
    return (
      <>
        <OnboardingModal />
        <GuardianDashboard userProfile={userProfile} />
      </>
    );
  }

  // Fallback for other roles or if profile is not loaded
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-foreground">Welcome to ElderLink</h1>
      <p className="text-muted-foreground">
        Complete your profile to unlock your personalised dashboard.
      </p>
      <Button asChild>
        <Link href="/dashboard/profile">Complete profile</Link>
      </Button>
    </div>
  );
}
