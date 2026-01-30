'use client';

import { useEffect, useRef } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { Home, Image, Stethoscope, Users, UsersRound, Briefcase, LogOut, User, Pill, HeartPulse, FileText, Siren, Crown, Plane, Trophy, ShoppingBag, Coins, Shield, ShieldCheck, MessageSquare, Smartphone, Wrench, ClipboardList, ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/logo';
import { SOSButton } from '../features/sos-button';
import { QuickActionsBar } from '../features/quick-actions-bar';
import { MobileBottomNav } from '../features/mobile-bottom-nav';
import { CommunityQuickChat } from '../features/community-quick-chat';
import { HeaderSearch } from '../features/header-search';
import { LanguageSwitcher } from '../language-switcher';
import { A11yToolbar } from '../features/a11y-toolbar';
import { ConnectionIndicator } from '../features/connection-indicator';
import { NotificationCenter } from '../features/notification-center';
import { FCMBanner } from '../features/fcm-banner';
import { FCMForegroundToaster } from '../features/fcm-foreground-toaster';
import Link from 'next/link';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { isSuperAdmin } from '@/lib/constants';
import { updateUserProfile } from '@/lib/user-actions';

const MEDICAL_PATHS = ['/dashboard/telemedicine', '/dashboard/medications', '/dashboard/vitals', '/dashboard/medical-records'];

const medicalSubItems = [
  { href: '/dashboard/telemedicine', icon: Stethoscope, key: 'telemedicine' },
  { href: '/dashboard/medications', icon: Pill, key: 'medications' },
  { href: '/dashboard/vitals', icon: HeartPulse, key: 'vitals' },
  { href: '/dashboard/medical-records', icon: FileText, key: 'medicalRecords' },
];

const ACCOUNT_PATHS = ['/dashboard/rewards', '/dashboard/membership', '/dashboard/security'];

const accountSubItems = [
  { href: '/dashboard/rewards', icon: Coins, key: 'rewards' },
  { href: '/dashboard/membership', icon: Crown, key: 'membership' },
  { href: '/dashboard/security', icon: Shield, key: 'security' },
];

const navItems = [
  { href: '/dashboard', icon: Home, key: 'dashboard' },
  { href: '/dashboard/profile', icon: User, key: 'profile' },
  { href: '/dashboard/family', icon: UsersRound, key: 'family' },
  { href: '/dashboard/memory-lane', icon: Image, key: 'memoryLane' },
  { href: '/dashboard/community', icon: Users, key: 'community' },
  { href: '/dashboard/messages', icon: MessageSquare, key: 'messages' },
  { href: '/dashboard/skills-marketplace', icon: Briefcase, key: 'skillsMarketplace' },
  { href: '/dashboard/services', icon: Wrench, key: 'services' },
  { href: '/dashboard/tours', icon: Plane, key: 'tours' },
  { href: '/dashboard/shop', icon: ShoppingBag, key: 'shop' },
  { href: '/dashboard/50above50', icon: Trophy, key: '50above50' },
  { href: '/apply', icon: ClipboardList, key: 'partnerApply' },
  { href: '/dashboard/connected-devices', icon: Smartphone, key: 'connectedDevices' },
  { href: '/dashboard/emergency', icon: Siren, key: 'sos' },
  { href: '/dashboard/admin', icon: ShieldCheck, key: 'admin' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ isAdmin?: boolean; userType?: string }>(userRef);
  const isAdmin = isSuperAdmin(user?.uid) || !!(userProfile?.isAdmin || userProfile?.userType === 'admin');
  const superAdminSyncDone = useRef(false);

  useEffect(() => {
    if (!user?.uid || !firestore || !isSuperAdmin(user.uid)) return;
    if (superAdminSyncDone.current) return;
    if (isProfileLoading) return;
    const p = userProfile as { isAdmin?: boolean; userType?: string } | null | undefined;
    if (p != null) {
      if (p.isAdmin === true && p.userType === 'admin') {
        superAdminSyncDone.current = true;
        return;
      }
      superAdminSyncDone.current = true;
      updateUserProfile(firestore, user.uid, { isAdmin: true, userType: 'admin' }).catch(() => {});
      return;
    }
    superAdminSyncDone.current = true;
    const userDocRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(userDocRef, { id: user.uid, isAdmin: true, userType: 'admin', updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
  }, [user, firestore, userProfile, isProfileLoading]);

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
            {navItems.slice(0, 4).map((item) => {
              if (item.key === 'admin' && !isAdmin) return null;
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
                    <Link href={item.href} prefetch>
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
            <Collapsible
              defaultOpen={MEDICAL_PATHS.some((p) => pathname.startsWith(p))}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={MEDICAL_PATHS.some((p) => pathname.startsWith(p))}
                    tooltip={{
                      children: tNav('medical'),
                      className: 'bg-primary text-primary-foreground'
                    }}
                    className={cn(
                      MEDICAL_PATHS.some((p) => pathname.startsWith(p)) && 'bg-gradient-primary/10 text-primary-foreground border-l-4 border-primary',
                      'transition-all duration-200 hover:bg-sidebar-accent/50 w-full'
                    )}
                  >
                    <Stethoscope className={cn(
                      MEDICAL_PATHS.some((p) => pathname.startsWith(p)) && 'text-primary',
                      'transition-colors'
                    )} />
                    <span className={cn(MEDICAL_PATHS.some((p) => pathname.startsWith(p)) && 'font-semibold')}>
                      {tNav('medical')}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {medicalSubItems.map((sub) => {
                      const subLabel = tNav(sub.key);
                      const subActive = pathname.startsWith(sub.href);
                      return (
                        <SidebarMenuSubItem key={sub.key}>
                          <SidebarMenuSubButton asChild isActive={subActive}>
                            <Link href={sub.href} prefetch>
                              <sub.icon className={cn(
                                subActive && 'text-primary',
                                'transition-colors'
                              )} />
                              <span className={cn(subActive && 'font-semibold')}>{subLabel}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            {navItems.slice(4, 10).map((item) => {
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
                    <Link href={item.href} prefetch>
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
            <Collapsible
              defaultOpen={ACCOUNT_PATHS.some((p) => pathname.startsWith(p))}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={ACCOUNT_PATHS.some((p) => pathname.startsWith(p))}
                    tooltip={{
                      children: tNav('account'),
                      className: 'bg-primary text-primary-foreground'
                    }}
                    className={cn(
                      ACCOUNT_PATHS.some((p) => pathname.startsWith(p)) && 'bg-gradient-primary/10 text-primary-foreground border-l-4 border-primary',
                      'transition-all duration-200 hover:bg-sidebar-accent/50 w-full'
                    )}
                  >
                    <Coins className={cn(
                      ACCOUNT_PATHS.some((p) => pathname.startsWith(p)) && 'text-primary',
                      'transition-colors'
                    )} />
                    <span className={cn(ACCOUNT_PATHS.some((p) => pathname.startsWith(p)) && 'font-semibold')}>
                      {tNav('account')}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {accountSubItems.map((sub) => {
                      const subLabel = tNav(sub.key);
                      const subActive = pathname.startsWith(sub.href);
                      return (
                        <SidebarMenuSubItem key={sub.key}>
                          <SidebarMenuSubButton asChild isActive={subActive}>
                            <Link href={sub.href} prefetch>
                              <sub.icon className={cn(
                                subActive && 'text-primary',
                                'transition-colors'
                              )} />
                              <span className={cn(subActive && 'font-semibold')}>{subLabel}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            {navItems.slice(10).map((item) => {
              if (item.key === 'admin' && !isAdmin) return null;
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
                    <Link href={item.href} prefetch>
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
          <HeaderSearch />
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
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {tNav('admin')}
                  </Link>
                </DropdownMenuItem>
              )}
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
        <main id="main-content" className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden p-4 sm:px-6 sm:py-0 pb-20 md:pb-4" tabIndex={-1}>
          <div className="min-w-0 w-full">{children}</div>
        </main>
        <CommunityQuickChat />
        <QuickActionsBar />
        <MobileBottomNav />
      </SidebarInset>
    </>
  );
}
