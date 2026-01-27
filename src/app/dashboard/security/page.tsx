'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Shield,
  Smartphone,
  LogOut,
  Lock,
  Eye,
  ChevronRight,
} from 'lucide-react';

export default function SecurityPage() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOutEverywhere = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Signed out', description: 'You have been signed out on this device.' });
      router.push('/');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not sign out.' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <Shield className="h-8 w-8 text-primary" />
          Security
        </h1>
        <p className="text-muted-foreground">
          Manage two-factor authentication, sessions, and privacy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Two-factor authentication (2FA)
            </CardTitle>
            <CardDescription>
              Add an extra layer of security. You’ll need your password and a code from an app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use an authenticator app (e.g. Google Authenticator) to generate codes. 2FA must be enabled for your account by support.
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact support to enable 2FA</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Sessions & devices
            </CardTitle>
            <CardDescription>
              You’re signed in on this device. Sign out everywhere to require login again on all devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium">This device</p>
              <p className="text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOutEverywhere}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out everywhere
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy settings
            </CardTitle>
            <CardDescription>
              Control what linked family members can see (vitals, location). Managed in your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">
                Open profile & permissions
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
