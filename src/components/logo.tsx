import { cn } from '@/lib/utils';
import { HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'group flex items-center gap-2.5 text-xl font-bold text-foreground group-data-[collapsible=icon]:justify-center',
        className
      )}
    >
      <div className="rounded-xl bg-gradient-primary p-2 flex items-center justify-center shadow-soft ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105 group-data-[collapsible=icon]:p-1.5">
        <HeartHandshake className="h-6 w-6 text-primary-foreground group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
      </div>
      <div className="flex flex-col gap-0 group-data-[collapsible=icon]:hidden">
        <span className="font-display font-bold tracking-tight leading-none">ElderLink</span>
        {showTagline && (
          <span className="text-xs font-body font-normal text-muted-foreground">
            Your Happiness Club
          </span>
        )}
      </div>
    </Link>
  );
}
