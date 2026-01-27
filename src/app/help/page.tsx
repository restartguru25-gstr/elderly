import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaticPageLayout } from '@/components/layout/static-page-layout';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  HeartPulse,
  Users,
  Shield,
  Bell,
  HelpCircle,
  FileQuestion,
  MessageCircle,
  LayoutDashboard,
} from 'lucide-react';

export const metadata = {
  title: 'Help Center | ElderLink — Your Happiness Club',
  description: 'Get started, manage your account, and use ElderLink with confidence.',
};

const categories = [
  {
    title: 'Getting started',
    description: 'Create an account, complete your profile, and connect with family.',
    icon: LayoutDashboard,
    links: [
      { label: 'How to sign up', href: '/signup' },
      { label: 'Complete your profile', href: '/dashboard/profile' },
      { label: 'Link with family', href: '/dashboard/family' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Health & wellness',
    description: 'Track vitals, medications, and stay on top of your health.',
    icon: HeartPulse,
    links: [
      { label: 'Log vitals', href: '/dashboard/vitals' },
      { label: 'Medications', href: '/dashboard/medications' },
      { label: 'Medical records', href: '/dashboard/medical-records' },
      { label: 'Telemedicine', href: '/dashboard/telemedicine' },
    ],
  },
  {
    title: 'Family & community',
    description: 'Connect with loved ones and join community events.',
    icon: Users,
    links: [
      { label: 'Family linking', href: '/dashboard/family' },
      { label: 'Community forums', href: '/dashboard/community' },
      { label: 'Skills marketplace', href: '/dashboard/skills-marketplace' },
    ],
  },
  {
    title: 'Safety & privacy',
    description: 'Emergency SOS, permissions, and your data.',
    icon: Shield,
    links: [
      { label: 'Emergency SOS', href: '/dashboard/emergency' },
      { label: 'Privacy settings', href: '/dashboard/profile' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
    ],
  },
  {
    title: 'Notifications & support',
    description: 'Push notifications, reminders, and how to get help.',
    icon: Bell,
    links: [
      { label: 'Notification center', href: '/dashboard' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Send feedback', href: '/dashboard/feedback' },
    ],
  },
];

export default function HelpPage() {
  return (
    <StaticPageLayout
      title="Help Center"
      description="Find guides, tips, and links to get the most out of ElderLink."
    >
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.title} className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{cat.title}</CardTitle>
                </div>
                <CardDescription>{cat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cat.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-primary hover:underline font-medium"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/faq">
            <FileQuestion className="mr-2 h-4 w-4" />
            FAQ
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact support
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/feedback">
            <HelpCircle className="mr-2 h-4 w-4" />
            Send feedback
          </Link>
        </Button>
      </div>
    </StaticPageLayout>
  );
}
