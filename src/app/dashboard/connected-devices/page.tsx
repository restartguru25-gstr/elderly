'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Watch, Activity } from 'lucide-react';

const PLACEHOLDERS = [
  { id: 'fitbit', name: 'Fitbit', icon: Watch, desc: 'Steps, heart rate, sleep' },
  { id: 'apple', name: 'Apple Health', icon: Activity, desc: 'Steps, workouts, vitals' },
  { id: 'garmin', name: 'Garmin', icon: Watch, desc: 'Activity, heart rate' },
];

export default function ConnectedDevicesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <Smartphone className="h-8 w-8 text-primary" />
          Connected devices
        </h1>
        <p className="text-muted-foreground">
          Link wearables and health apps to sync your activity and vitals. More integrations coming soon.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDERS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id} className="border-2 opacity-75">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <CardDescription>{p.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-2 border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Have a device you’d like to connect? Let us know via{' '}
            <a href="mailto:support@elderlink.in" className="text-primary hover:underline">
              support@elderlink.in
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
