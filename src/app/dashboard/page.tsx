
import { DailyCheckinCard } from '@/components/features/daily-checkin-card';
import { MoodTracker } from '@/components/features/mood-tracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Image, Stethoscope, Users, Briefcase, Pill, HeartPulse } from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  { href: '/dashboard/memory-lane', icon: Image, label: 'Memory Lane', description: 'Rediscover cherished moments.' },
  { href: '/dashboard/telemedicine', icon: Stethoscope, label: 'Telemedicine', description: 'Consult with trusted doctors.' },
  { href: '/dashboard/medications', icon: Pill, label: 'Medications', description: 'Manage medication schedules.' },
  { href: '/dashboard/vitals', icon: HeartPulse, label: 'Vitals', description: 'Track important health metrics.' },
  { href: '/dashboard/community', icon: Users, label: 'Community', description: 'Connect with friends & peers.' },
  { href: '/dashboard/skills-marketplace', icon: Briefcase, label: 'Skills Marketplace', description: 'Share your expertise.' },
]

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="mb-4 text-3xl font-bold text-foreground">
            Hello, Welcome Back!
          </h1>
          <p className="mb-8 text-muted-foreground">Here&apos;s a summary of your loved one&apos;s well-being and activities.</p>
        </div>
        
        <DailyCheckinCard />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(link => (
            <Card key={link.label} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{link.label}</CardTitle>
                <link.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={link.href}>
                    View
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <MoodTracker />
      </div>
    </div>
  );
}
