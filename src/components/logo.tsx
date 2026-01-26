import { cn } from '@/lib/utils';
import { HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'flex items-center gap-2 text-xl font-bold text-foreground group-data-[collapsible=icon]:justify-center',
        className
      )}
    >
      <div className="rounded-lg bg-primary p-2 flex items-center justify-center">
         <HeartHandshake className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="group-data-[collapsible=icon]:hidden font-headline">ElderLink</span>
    </Link>
  );
}
