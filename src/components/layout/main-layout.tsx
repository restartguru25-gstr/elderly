
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
import { Home, Image, Stethoscope, Users, Briefcase, LogOut, User, Pill, HeartPulse, FileText } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { SOSButton } from '../features/sos-button';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/memory-lane', icon: Image, label: 'Memory Lane' },
  { href: '/dashboard/telemedicine', icon: Stethoscope, label: 'Telemedicine' },
  { href: '/dashboard/medications', icon: Pill, label: 'Medications' },
  { href: '/dashboard/vitals', icon: HeartPulse, label: 'Vitals' },
  { href: '/dashboard/medical-records', icon: FileText, label: 'Medical Records' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/skills-marketplace', icon: Briefcase, label: 'Skills Marketplace' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log you out. Please try again.' });
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
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={{
                    children: item.label,
                    className: 'bg-primary text-primary-foreground'
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1" />
          <SOSButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
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
                <Link href="/dashboard/profile">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </>
  );
}
