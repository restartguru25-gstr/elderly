'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithId } from '@/firebase/firestore/use-collection';
import { ArrowUpRight, Phone, Send, HeartPulse, Pill, Users, Calendar, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type UserProfile = {
    firstName: string;
    // other properties...
}

export function GuardianDashboard({ userProfile }: { userProfile: WithId<UserProfile> }) {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Dashboard Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">
                        Hello, {userProfile.firstName}! 👋
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Here&apos;s a summary of your loved one&apos;s well-being and activities.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <Card className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold">95%</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Health Score</div>
                        </CardContent>
                    </Card>
                    <Card className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold">3/3</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Medications</div>
                        </CardContent>
                    </Card>
                    <Card className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold">5</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Activities</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Parent Status Card */}
            <Card className="border-2 shadow-soft-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl sm:text-2xl">Parent Status</CardTitle>
                            <CardDescription>Real-time updates from your parent&apos;s activity</CardDescription>
                        </div>
                        <Badge className="bg-green-500 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            All Good
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-500 p-3">
                                <Pill className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-base sm:text-lg">Medicine Taken</p>
                                <p className="text-sm text-muted-foreground">Last taken: 8:00 AM today</p>
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl">✅</div>
                    </div>
                    <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-secondary/30 border-2">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-3">
                                <HeartPulse className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-base sm:text-lg">Last Activity</p>
                                <p className="text-sm text-muted-foreground">Logged mood at 11:30 AM</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">2 hours ago</p>
                    </div>
                    <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-yellow-400 p-3">
                                <span className="text-2xl">😊</span>
                            </div>
                            <div>
                                <p className="font-semibold text-base sm:text-lg">Current Mood</p>
                                <p className="text-sm text-muted-foreground">Feeling positive and happy</p>
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl">😊</div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Quick Actions</CardTitle>
                    <CardDescription>Connect with your parent and manage their care</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button 
                        size="lg" 
                        className="bg-gradient-primary text-white hover:opacity-90 h-auto py-6 text-base font-semibold"
                    >
                        <Phone className="mr-2 h-5 w-5" /> 
                        Call Parent
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-2 h-auto py-6 text-base font-semibold"
                    >
                        <Send className="mr-2 h-5 w-5" /> 
                        Send Reminder
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-2 h-auto py-6 text-base font-semibold"
                        asChild
                    >
                        <Link href="/dashboard/telemedicine">
                            Book Doctor 
                            <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Recent Updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Health Summary</CardTitle>
                        <CardDescription>This week&apos;s health metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                                <HeartPulse className="h-5 w-5 text-red-500" />
                                <span className="text-sm font-medium">Blood Pressure</span>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Normal
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium">Activity Level</span>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Active
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Upcoming Events</CardTitle>
                        <CardDescription>Important dates and reminders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="rounded-full bg-primary p-2">
                                <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Doctor Appointment</p>
                                <p className="text-xs text-muted-foreground">Tomorrow at 10:00 AM</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                            <div className="rounded-full bg-muted p-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Community Event</p>
                                <p className="text-xs text-muted-foreground">Yoga session on Friday</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
