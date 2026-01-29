'use client';

import Link from 'next/link';
import { Users, Trophy, Briefcase, LayoutDashboard } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/dashboard/admin/users', label: 'Users', desc: 'Manage user roles and admin flags.', icon: Users },
  { href: '/dashboard/50above50/admin', label: '50Above50 — Approvals', desc: 'Approve or reject contest submissions.', icon: Trophy },
  { href: '/dashboard/admin/skills', label: 'Skill listings', desc: 'Moderate and remove marketplace listings.', icon: Briefcase },
];

export default function AdminHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="text-muted-foreground">Approvals, user management, and data maintenance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label, desc, icon: Icon }) => (
          <Card key={href} className="border-2 transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{desc}</p>
              <Button asChild variant="outline" size="sm">
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
