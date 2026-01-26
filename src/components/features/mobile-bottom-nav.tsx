'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, HeartPulse, Users, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/vitals', icon: HeartPulse, label: 'Health' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/skills-marketplace', icon: Briefcase, label: 'Skills' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 bg-background/95 backdrop-blur-sm md:hidden safe-area-inset-bottom"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname.startsWith(item.href) &&
            (item.href !== '/dashboard' || pathname === '/dashboard');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon
                className={cn(
                  'h-6 w-6 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
