'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WithId } from '@/firebase/firestore/use-collection';
import { Briefcase, HeartPulse, Pill, Siren, Users, ArrowRight, TrendingUp, Calendar, Bell, Sparkles, Coins } from 'lucide-react';
import Link from 'next/link';
import { DailyCheckinCard } from './daily-checkin-card';
import { MoodTracker } from './mood-tracker';
import { RewardsCoins } from './rewards-coins';
import { HealthInsightsCard } from './health-insights-card';
import { GamificationCard } from './gamification-card';
import { RemindersCard } from './reminders-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mainTiles = [
    { 
        href: '/dashboard/medications', 
        icon: Pill, 
        label: 'Medicines', 
        description: 'Track your daily medication and never miss a dose.',
        gradient: 'from-green-400 to-emerald-500',
        color: 'text-green-600'
    },
    { 
        href: '/dashboard/vitals', 
        icon: HeartPulse, 
        label: 'Health & Vitals', 
        description: 'Log your vital signs and monitor your health.',
        gradient: 'from-red-400 to-pink-500',
        color: 'text-red-600'
    },
    { 
        href: '/dashboard/emergency', 
        icon: Siren, 
        label: 'Emergency SOS', 
        description: 'Send an emergency alert to family and services.',
        gradient: 'from-orange-400 to-red-500',
        color: 'text-orange-600'
    },
    { 
        href: '/dashboard/community', 
        icon: Users, 
        label: 'Family & Community', 
        description: 'Connect with loved ones and join community events.',
        gradient: 'from-blue-400 to-cyan-500',
        color: 'text-blue-600'
    },
];

const quickStats = [
    { label: 'Health Score', value: '95%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Medications Today', value: '3/3', icon: Pill, color: 'text-primary' },
    { label: 'Activities', value: '5', icon: Calendar, color: 'text-blue-600' },
];

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

    const getGreetingEmoji = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅';
        if (hour < 18) return '☀️';
        return '🌙';
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Dashboard Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">
                        {getGreeting()}, {userProfile.firstName} {getGreetingEmoji()}
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Here&apos;s what&apos;s happening today. Let&apos;s make it a great day!
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {quickStats.map((stat, index) => (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} aria-hidden />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Daily Check-in */}
                    <DailyCheckinCard />

                    {/* Feature Tiles */}
                    <div>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold">Quick Access</h2>
                            <Badge variant="outline" className="text-xs sm:text-sm">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Explore all features
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                            {mainTiles.map((tile, index) => (
                                <Link href={tile.href} key={tile.label}>
                                    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-warm h-full animate-fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <CardContent className="p-5 sm:p-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`rounded-xl bg-gradient-to-br ${tile.gradient} p-3 sm:p-4 shadow-soft transition-transform group-hover:scale-110`}>
                                                    <tile.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{tile.label}</h3>
                                                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                                                        {tile.description}
                                                    </p>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        className="group-hover:text-primary p-0 h-auto font-semibold"
                                                    >
                                                        Explore now
                                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <Card className="border-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl">Recent Activity</CardTitle>
                                    <CardDescription>Your latest updates and reminders</CardDescription>
                                </div>
                                <Bell className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Pill className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm sm:text-base">Morning medications taken</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">2 hours ago</p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Completed
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <HeartPulse className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm sm:text-base">Vital signs logged</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Yesterday at 6:00 PM</p>
                                </div>
                                <Badge variant="outline">Done</Badge>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm sm:text-base">New community event</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Yoga session tomorrow at 9:00 AM</p>
                                </div>
                                <Badge className="bg-primary text-white">New</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                    <RemindersCard />
                    <HealthInsightsCard />
                    <GamificationCard />
                    <MoodTracker />

                    {/* Rewards & Coins */}
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Your Coins
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-1">1,250</div>
                                <p className="text-xs text-muted-foreground mb-4">ElderLink Coins</p>
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link href="/dashboard/rewards">
                                        View Rewards
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Upcoming Reminders */}
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Upcoming</CardTitle>
                            <CardDescription>Your reminders for today</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="rounded-full bg-primary p-2">
                                    <Pill className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Evening Medication</p>
                                    <p className="text-xs text-muted-foreground">In 2 hours</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <div className="rounded-full bg-muted p-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Doctor Appointment</p>
                                    <p className="text-xs text-muted-foreground">Tomorrow at 10:00 AM</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
