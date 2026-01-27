'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { createMedication, logMedication } from '@/lib/medication-actions';
import { withRetry } from '@/lib/retry';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Pill, CalendarClock, History } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { ParentSelector } from '@/components/features/parent-selector';
import { useLinkedSenior } from '@/hooks/use-linked-senior';
import { Badge } from '@/components/ui/badge';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  schedule: z.string().min(1, 'Schedule is required.'),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

type Medication = {
  name: string;
  dosage: string;
  schedule: string;
  userId: string;
  createdAt: any;
};

type MedicationLog = {
  medicationId: string;
  userId: string;
  taken: boolean;
  date: string;
  timestamp: any;
}

function MedicationCard({
  medication,
  todayLog,
  readOnly,
}: {
  medication: WithId<Medication>;
  todayLog: WithId<MedicationLog> | undefined;
  readOnly?: boolean;
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  const [optimisticLog, setOptimisticLog] = useState<{ taken: boolean } | null>(null);

  const handleLogMedication = (taken: boolean) => {
    if (!user) return;
    setOptimisticLog({ taken });
    setIsLogging(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    withRetry(() => logMedication(firestore, user.uid, medication.id, { taken, date: today }), { attempts: 3, delayMs: 800 })
      .then(() => {
        toast({
          title: `Medication ${taken ? 'Logged' : 'Marked as Skipped'}`,
          description: `${medication.name} has been updated for today.`,
        });
        setOptimisticLog(null);
      })
      .catch(() => {
        setOptimisticLog(null);
        toast({ variant: 'destructive', title: 'Update failed', description: 'Could not save. Check connection and try again.' });
      })
      .finally(() => setIsLogging(false));
  };

  const wasTakenToday = optimisticLog ? optimisticLog.taken === true : todayLog?.taken === true;
  const wasSkippedToday = optimisticLog ? optimisticLog.taken === false : todayLog?.taken === false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Pill className="text-primary" /> {medication.name}
            </CardTitle>
            <CardDescription>{medication.dosage}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            <span>{medication.schedule}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {readOnly ? (
          <p className="text-sm text-muted-foreground">
            Today: {wasTakenToday ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Taken</Badge>
            ) : wasSkippedToday ? (
              <Badge variant="secondary">Skipped</Badge>
            ) : (
              <Badge variant="outline">Not logged</Badge>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Log today&apos;s dose.</p>
        )}
      </CardContent>
      {!readOnly && (
        <CardFooter className="flex gap-2">
          <Button
            className="w-full"
            onClick={() => handleLogMedication(true)}
            disabled={isLogging || wasTakenToday}
            variant={wasTakenToday ? 'default' : 'outline'}
          >
            {isLogging ? <Loader2 className="animate-spin" /> : 'Taken'}
          </Button>
          <Button
            className="w-full"
            onClick={() => handleLogMedication(false)}
            disabled={isLogging || wasSkippedToday}
            variant={wasSkippedToday ? 'destructive' : 'outline'}
          >
            {isLogging ? <Loader2 className="animate-spin" /> : 'Skipped'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function MedicationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc(userDocRef);
  const { linkedSeniors, selectedSeniorId } = useLinkedSenior();

  const isGuardian = userProfile?.userType === 'guardian';
  const viewUserId = isGuardian && linkedSeniors.length > 0 && selectedSeniorId ? selectedSeniorId : user?.uid ?? null;
  const isGuardianView = isGuardian && !!selectedSeniorId;

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { name: '', dosage: '', schedule: '' },
  });

  const medicationsQuery = useMemoFirebase(
    () =>
      viewUserId
        ? query(collection(firestore, `users/${viewUserId}/medications`), orderBy('createdAt', 'desc'))
        : null,
    [firestore, viewUserId]
  );
  const { data: medications, isLoading: medicationsLoading } = useCollection<Medication>(medicationsQuery);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const logsQuery = useMemoFirebase(
    () =>
      viewUserId
        ? query(collection(firestore, `users/${viewUserId}/medication_logs`), where('date', '==', todayStr))
        : null,
    [firestore, viewUserId, todayStr]
  );
  const { data: medicationLogs, isLoading: logsLoading } = useCollection<MedicationLog>(logsQuery);

  const getLogForMedication = (medicationId: string) => {
    if (!medicationLogs) return undefined;
    return medicationLogs.find((log) => log.medicationId === medicationId);
  };

  const onSubmit = (values: MedicationFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    createMedication(firestore, user.uid, values)
      .then(() => {
        toast({
          title: 'Medication Added',
          description: `${values.name} has been added to your schedule.`,
        });
        form.reset();
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {!isGuardianView && (
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Medication</CardTitle>
              <CardDescription>Enter details for a new medication schedule.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Paracetamol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 500mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., After Breakfast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                    Add Medication
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className={isGuardianView ? 'md:col-span-3' : 'md:col-span-2'}>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
              <History className="h-8 w-8" /> {isGuardianView ? "Parent's Medications" : 'Your Medications'}
            </h1>
            <p className="text-muted-foreground">
              {isGuardianView ? "View and track your parent's medication schedule." : 'Manage and track your medication schedule.'}
            </p>
          </div>
          {isGuardian && <ParentSelector />}
        </div>
        <div className="space-y-4">
          {medicationsLoading || logsLoading ? (
            <>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </>
          ) : medications && medications.length > 0 ? (
            medications.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                todayLog={getLogForMedication(med.id)}
                readOnly={isGuardianView}
              />
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {isGuardianView ? "No medications added yet for this parent." : 'No medications added yet. Add one to get started.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

    