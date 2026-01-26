'use client';

import { Button } from '@/components/ui/button';
import { Siren } from 'lucide-react';
import Link from 'next/link';

export function SOSButton() {
  return (
    <Button asChild variant="destructive" size="default" className="flex items-center gap-2 rounded-full animate-pulse">
        <Link href="/dashboard/emergency">
            <Siren className="h-5 w-5" />
            <span className="hidden sm:inline">SOS</span>
        </Link>
    </Button>
  );
}
