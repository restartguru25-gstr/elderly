'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Siren, Pill, Phone, MessageSquare, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const quickActions = [
  {
    icon: Siren,
    label: 'Emergency SOS',
    href: '/dashboard/emergency',
    color: 'bg-red-500 hover:bg-red-600',
    tooltip: 'Send emergency alert',
  },
  {
    icon: Pill,
    label: 'Add Medication',
    href: '/dashboard/medications',
    color: 'bg-primary hover:opacity-90',
    tooltip: 'Log medication',
  },
  {
    icon: Phone,
    label: 'Call Family',
    href: '/dashboard/community',
    color: 'bg-blue-500 hover:bg-blue-600',
    tooltip: 'Contact family',
  },
  {
    icon: MessageSquare,
    label: 'Quick Check-in',
    href: '/dashboard',
    color: 'bg-green-500 hover:bg-green-600',
    tooltip: 'Daily check-in',
  },
];

export function QuickActionsBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    if (!isExpanded) return;
    // Focus the first action when menu opens
    const t = window.setTimeout(() => itemRefs.current[0]?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isExpanded]);

  const closeMenu = () => {
    setIsExpanded(false);
    // Return focus to the FAB
    window.setTimeout(() => fabRef.current?.focus(), 0);
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!isExpanded) return;
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'];
    if (!keys.includes(e.key)) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    const focusables = itemRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (focusables.length === 0) return;
    const activeIndex = focusables.findIndex((el) => el === document.activeElement);
    const current = activeIndex >= 0 ? activeIndex : 0;

    let next = current;
    if (e.key === 'ArrowDown') next = (current + 1) % focusables.length;
    if (e.key === 'ArrowUp') next = (current - 1 + focusables.length) % focusables.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = focusables.length - 1;

    e.preventDefault();
    focusables[next]?.focus();
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 sm:gap-3 md:bottom-6">
      {isExpanded && (
        <div
          className="flex flex-col gap-2 animate-fade-in-up"
          role="menu"
          aria-label="Quick actions"
          onKeyDown={handleMenuKeyDown}
        >
          {quickActions.map((action, index) => (
            <TooltipProvider key={action.label} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={action.href}
                    prefetch
                    role="menuitem"
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => setIsExpanded(false)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
                  >
                    <Card className="border-2 shadow-soft-lg hover:shadow-warm transition-all hover:scale-105 w-48 sm:w-auto">
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={cn('rounded-lg p-1.5 sm:p-2 text-white', action.color)}>
                            <action.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                          </div>
                          <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">{action.label}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={fabRef}
              size="lg"
              className={cn(
                'rounded-full h-12 w-12 sm:h-14 sm:w-14 shadow-soft-lg hover:shadow-warm transition-all',
                isExpanded
                  ? 'bg-gradient-primary text-white'
                  : 'bg-gradient-primary text-white hover:scale-110'
              )}
              onClick={() => (isExpanded ? closeMenu() : setIsExpanded(true))}
              aria-label={isExpanded ? 'Close quick actions' : 'Open quick actions'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
              ) : (
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isExpanded ? 'Close quick actions' : 'Open quick actions'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
