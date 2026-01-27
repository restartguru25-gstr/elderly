'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GuardianProvider } from '@/hooks/use-linked-senior';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <GuardianProvider>
        <MainLayout>{children}</MainLayout>
      </GuardianProvider>
    </AuthGuard>
  );
}
