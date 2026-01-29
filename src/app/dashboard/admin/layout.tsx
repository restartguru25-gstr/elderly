'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { isSuperAdmin } from '@/lib/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ isAdmin?: boolean; userType?: string }>(userRef);
  const isAdmin = isSuperAdmin(user?.uid) || !!(userProfile?.isAdmin || userProfile?.userType === 'admin');
  const loading = isUserLoading || (!isSuperAdmin(user?.uid) && isProfileLoading);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">You don&apos;t have access to the admin panel.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
