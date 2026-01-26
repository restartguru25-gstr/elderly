
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WithId } from '@/firebase/firestore/use-collection';
import { Briefcase, HeartPulse, Pill, Siren, Users } from 'lucide-react';
import Link from 'next/link';
import { DailyCheckinCard } from './daily-checkin-card';
import { MoodTracker } from './mood-tracker';

const mainTiles = [
    { href: '/dashboard/medications', icon: Pill, label: 'Medicines', description: 'Track your daily medication.' },
    { href: '/dashboard/vitals', icon: HeartPulse, label: 'Health', description: 'Log your vital signs.' },
    { href: '/dashboard/emergency', icon: Siren, label: 'Need Help', description: 'Send an emergency alert.' },
    { href: '/dashboard/community', icon: Users, label: 'Family & Community', description: 'Connect with loved ones.' },
]

type UserProfile = {
    firstName: string;
    lastName: string;
    // other properties
}

export function SeniorDashboard({ userProfile }: { userProfile: WithId<UserProfile>}) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="p-0">
                        <CardTitle className="text-4xl font-bold">
                            {getGreeting()}, {userProfile.firstName} 🌸
                        </CardTitle>
                        <CardDescription className="text-lg">
                           Here are your tasks for today.
                        </CardDescription>
                    </CardHeader>
                </Card>
                
                <DailyCheckinCard />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {mainTiles.map(link => (
                    <Link href={link.href} key={link.label}>
                        <Card className="hover:shadow-xl hover:border-primary transition-all duration-200 h-full flex flex-col">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <link.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">{link.label}</CardTitle>
                                        <CardDescription>{link.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
                </div>
            </div>
            <div className="lg:col-span-1">
                <MoodTracker />
            </div>
        </div>
    )
}
