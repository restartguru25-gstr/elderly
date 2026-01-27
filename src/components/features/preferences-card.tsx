'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePersonalization } from '@/hooks/use-personalization';
import { useOnboarding } from '@/hooks/use-onboarding';
import { LayoutGrid, RotateCcw } from 'lucide-react';

export function PreferencesCard() {
  const router = useRouter();
  const { compact, setCompactLayout, mounted } = usePersonalization();
  const { reset: resetOnboarding } = useOnboarding();

  if (!mounted) return null;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          Preferences
        </CardTitle>
        <CardDescription>Customize your dashboard and experience.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="compact">Compact dashboard</Label>
            <p className="text-sm text-muted-foreground">Use a denser layout with smaller cards.</p>
          </div>
          <Switch
            id="compact"
            checked={compact}
            onCheckedChange={setCompactLayout}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Onboarding</Label>
            <p className="text-sm text-muted-foreground">Show the welcome tour again on your next dashboard visit.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { resetOnboarding(); router.push('/dashboard'); }}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Replay tour
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
