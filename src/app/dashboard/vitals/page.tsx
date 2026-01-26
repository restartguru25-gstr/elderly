'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { createVital } from '@/lib/vitals-actions';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  PlusCircle,
  HeartPulse,
  Droplets,
  Wind,
  Weight,
  History,
  Trophy,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { WithId } from '@/firebase/firestore/use-collection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const vitalSchema = z.object({
  type: z.enum(['blood_pressure', 'blood_sugar', 'spo2', 'weight'], {
    required_error: 'Please select a vital type.',
  }),
  value: z.string().min(1, 'Value is required.'),
});

type VitalFormValues = z.infer<typeof vitalSchema>;

type Vital = {
  type: string;
  value: string;
  userId: string;
  timestamp: any;
};

const vitalIcons = {
  blood_pressure: HeartPulse,
  blood_sugar: Droplets,
  spo2: Wind,
  weight: Weight,
};

const vitalLabels = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  spo2: 'SpO2 (%)',
  weight: 'Weight (kg)',
};

const vitalColors = {
  blood_pressure: 'from-red-400 to-pink-500',
  blood_sugar: 'from-orange-400 to-amber-500',
  spo2: 'from-blue-400 to-cyan-500',
  weight: 'from-slate-400 to-slate-600',
};

export default function VitalsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VitalFormValues>({
    resolver: zodResolver(vitalSchema),
    defaultValues: { value: '' },
  });

  const vitalsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, `users/${user.uid}/vitals`),
            orderBy('timestamp', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: vitals, isLoading } = useCollection<Vital>(vitalsQuery);

  const onSubmit = (values: VitalFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    createVital(firestore, user.uid, values as any)
      .then(() => {
        toast({
          title: 'Vital Logged! 🎉',
          description: `Your ${vitalLabels[values.type]} has been saved. Keep winning every day!`,
        });
        form.reset();
      })
      .finally(() => setIsSubmitting(false));
  };

  const todayCount = vitals?.filter((v) => {
    if (!v.timestamp) return false;
    const d = v.timestamp.toDate();
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length ?? 0;

  const streak = 7; // Placeholder - could be computed from actual data
  const healthScore = 95;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-4xl font-bold text-foreground flex items-center gap-2">
          <HeartPulse className="h-10 w-10 text-primary" />
          Health & Vitals
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your vitals, build healthy habits, and win every day.
        </p>
      </div>

      {/* Win Everyday - Gamification */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-primary p-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Win every day
                  <Sparkles className="h-6 w-6 text-primary" />
                </h2>
                <p className="text-muted-foreground">
                  Log your vitals daily. Stay active & healthy — get rewarded!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-xl border-2 bg-background px-5 py-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{todayCount}</div>
                  <div className="text-xs text-muted-foreground">Logged today</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border-2 bg-background px-5 py-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{streak} days</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border-2 bg-background px-5 py-3">
                <div className="rounded-full bg-green-500 p-2">
                  <span className="text-lg font-bold text-white">{healthScore}%</span>
                </div>
                <div>
                  <div className="font-bold">Health Score</div>
                  <div className="text-xs text-muted-foreground">Great job!</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log New Vital */}
        <div className="lg:col-span-1">
          <Card className="border-2 shadow-soft sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Log New Vital</CardTitle>
              <CardDescription>
                Enter a new reading. Every log counts toward your streak!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vital Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a vital" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                            <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                            <SelectItem value="spo2">SpO2</SelectItem>
                            <SelectItem value="weight">Weight</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 120/80 or 95" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    variant="gradient"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Log Vital
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Vitals History</h2>
          </div>
          <Card className="border-2 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-6 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-6 w-32 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : vitals && vitals.length > 0 ? (
                    vitals.map((vital: WithId<Vital>) => {
                      const Icon = vitalIcons[vital.type as keyof typeof vitalIcons];
                      const gradient = vitalColors[vital.type as keyof typeof vitalColors];
                      return (
                        <TableRow
                          key={vital.id}
                          className="group hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className={`rounded-lg bg-gradient-to-br ${gradient} p-1.5`}
                              >
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              {vitalLabels[vital.type as keyof typeof vitalLabels]}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {vital.value}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {vital.timestamp
                              ? format(vital.timestamp.toDate(), 'PPp')
                              : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center h-32 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <HeartPulse className="h-12 w-12 opacity-30" />
                          <p>No vitals logged yet.</p>
                          <p className="text-sm">Log your first vital to start your streak!</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
