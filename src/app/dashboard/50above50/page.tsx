'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/** Temporary: 50Above50 page shows "Coming soon" toast and placeholder. Restore full page when ready. */
export default function FiftyAboveFiftyPage() {
  const { toast } = useToast();

  useEffect(() => {
    toast({ title: 'Coming soon', description: '50Above50 talent hunt will be back shortly. Stay tuned!' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md border-2">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-6">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">50Above50</h1>
            <p className="mt-2 text-muted-foreground">India&apos;s biggest talent hunt for seniors 50+ is coming soon.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
