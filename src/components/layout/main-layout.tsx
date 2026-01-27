'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Home, Image, Stethoscope, Users, UsersRound, Briefcase, LogOut, User, Pill, HeartPulse, FileText, Siren, Crown, Plane, Trophy, ShoppingBag, Coins, Shield, MessageSquare, Smartphone } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/logo';
import { SOSButton } from '../features/sos-button';
import { QuickActionsBar } from '../features/quick-actions-bar';
import { MobileBottomNav } from '../features/mobile-bottom-nav';
import { LanguageSwitcher } from '../language-switcher';
import { A11yToolbar } from '../features/a11y-toolbar';
import { ConnectionIndicator } from '../features/connection-indicator';
import { NotificationCenter } from '../features/notification-center';
import { FCMBanner } from '../features/fcm-banner';
import { FCMForegroundToaster } from '../features/fcm-foreground-toaster';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, key: 'dashboard' },
  { href: '/dashboard/profile', icon: User, key: 'profile' },
  { href: '/dashboard/family', icon: UsersRound, key: 'family' },
  { href: '/dashboard/memory-lane', icon: Image, key: 'memoryLane' },
  { href: '/dashboard/telemedicine', icon: Stethoscope, key: 'telemedicine' },
  { href: '/dashboard/medications', icon: Pill, key: 'medications' },
  { href: '/dashboard/vitals', icon: HeartPulse, key: 'vitals' },
  { href: '/dashboard/medical-records', icon: FileText, key: 'medicalRecords' },
  { href: '/dashboard/community', icon: Users, key: 'community' },
  { href: '/dashboard/messages', icon: MessageSquare, key: 'messages' },
  { href: '/dashboard/skills-marketplace', icon: Briefcase, key: 'skillsMarketplace' },
  { href: '/dashboard/tours', icon: Plane, key: 'tours' },
  { href: '/dashboard/shop', icon: ShoppingBag, key: 'shop' },
  { href: '/dashboard/rewards', icon: Coins, key: 'rewards' },
  { href: '/dashboard/membership', icon: Crown, key: 'membership' },
  { href: '/dashboard/50above50', icon: Trophy, key: '50above50' },
  { href: '/dashboard/security', icon: Shield, key: 'security' },
  { href: '/dashboard/connected-devices', icon: Smartphone, key: 'connectedDevices' },
  { href: '/dashboard/emergency', icon: Siren, key: 'sos' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: t('loggedOut'), description: t('loggedOutDesc') });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: t('logoutFailed'), description: t('logoutFailedDesc') });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const label = tNav(item.key);
              const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{
                      children: label,
                      className: 'bg-primary text-primary-foreground'
                    }}
                    className={cn(
                      isActive && 'bg-gradient-primary/10 text-primary-foreground border-l-4 border-primary',
                      'transition-all duration-200 hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn(
                        isActive && 'text-primary',
                        'transition-colors'
                      )} />
                      <span className={cn(isActive && 'font-semibold')}>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
          <SidebarTrigger className="sm:hidden" aria-label={tCommon('navigation')} />
          <div className="flex-1" />
          <ConnectionIndicator />
          <LanguageSwitcher />
          <NotificationCenter />
          <A11yToolbar />
          <SOSButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full" aria-label={tCommon('profile')}>
                 {isUserLoading ? (
                  <Skeleton className="h-full w-full rounded-full" />
                ) : (
                  <Avatar>
                    <AvatarImage src={user?.photoURL ?? undefined} alt="User Avatar" />
                    <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                  </Avatar>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.displayName || user?.email || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">{tCommon('settings')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact">{tCommon('support')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">Help</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/feedback">Send feedback</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {tCommon('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <FCMForegroundToaster />
        <FCMBanner />
        <main id="main-content" className="flex-1 p-4 sm:px-6 sm:py-0 pb-20 md:pb-4" tabIndex={-1}>{children}</main>
        <QuickActionsBar />
        <MobileBottomNav />
      </SidebarInset>
    </>
  );
}
