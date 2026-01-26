'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithId } from '@/firebase/firestore/use-collection';
import { ArrowUpRight, Phone, Send } from 'lucide-react';
import Link from 'next/link';

type UserProfile = {
    firstName: string;
    // other properties...
}

export function GuardianDashboard({ userProfile }: { userProfile: WithId<UserProfile> }) {

    return (
        <div className="space-y-8">
            <div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                    Hello, {userProfile.firstName}!
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                    Here&apos;s a summary of your loved one&apos;s well-being and activities.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Parent Status</CardTitle>
                    <CardDescription>Updates from your parent&apos;s activity.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div>
                            <p className="font-semibold">Medicine Taken</p>
                            <p className="text-sm text-muted-foreground">Last taken: 8:00 AM</p>
                        </div>
                        <div className="text-2xl">✅</div>
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div>
                            <p className="font-semibold">Last Activity</p>
                            <p className="text-sm text-muted-foreground">Logged mood at 11:30 AM</p>
                        </div>
                         <p className="text-sm font-medium">2 hours ago</p>
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div>
                            <p className="font-semibold">Current Mood</p>
                            <p className="text-sm text-muted-foreground">Feeling positive</p>
                        </div>
                        <div className="text-3xl">😊</div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button size="lg">
                        <Phone className="mr-2" /> Call Parent
                    </Button>
                     <Button size="lg" variant="outline">
                        <Send className="mr-2" /> Send Reminder
                    </Button>
                     <Button size="lg" variant="outline" asChild>
                        <Link href="/dashboard/telemedicine">
                            Book Doctor <ArrowUpRight className="ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
