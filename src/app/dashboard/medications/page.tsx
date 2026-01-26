
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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { createMedication, logMedication } from '@/lib/medication-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Pill, CalendarClock, History } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

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
  timestamp: any;
}

function MedicationCard({ medication, todayLog }: { medication: WithId<Medication>, todayLog: WithId<MedicationLog> | undefined }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);

  const handleLogMedication = (taken: boolean) => {
    if (!user) return;
    setIsLogging(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    logMedication(firestore, user.uid, medication.id, { taken, date: today })
      .then(() => {
        toast({
          title: `Medication ${taken ? 'Logged' : 'Marked as Skipped'}`,
          description: `${medication.name} has been updated for today.`,
        });
      })
      .finally(() => setIsLogging(false));
  };
  
  const wasTakenToday = todayLog?.taken === true;
  const wasSkippedToday = todayLog?.taken === false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2"><Pill className="text-primary"/> {medication.name}</CardTitle>
            <CardDescription>{medication.dosage}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>{medication.schedule}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Log today's dose.</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          className="w-full"
          onClick={() => handleLogMedication(true)}
          disabled={isLogging || wasTakenToday}
          variant={wasTakenToday ? 'default': 'outline'}
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
    </Card>
  )
}

export default function MedicationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { name: '', dosage: '', schedule: '' },
  });

  const medicationsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, `users/${user.uid}/medications`), orderBy('createdAt', 'desc')) : null,
    [firestore, user]
  );
  const { data: medications, isLoading: medicationsLoading } = useCollection<Medication>(medicationsQuery);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const medicationLogIds = useMemo(() => medications?.map(m => `${m.id}_${todayStr}`) || [], [medications, todayStr]);

  const logsQuery = useMemoFirebase(() => {
    if (!user || medicationLogIds.length === 0) return null;
    return query(collection(firestore, `users/${user.uid}/medication_logs`), where('__name__', 'in', medicationLogIds));
  }, [firestore, user, medicationLogIds]);

  const { data: medicationLogs, isLoading: logsLoading } = useCollection<MedicationLog>(logsQuery);
  
  const getLogForMedication = (medicationId: string) => {
    if (!medicationLogs) return undefined;
    return medicationLogs.find(log => log.medicationId === medicationId);
  }

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
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add New Medication</CardTitle>
            <CardDescription>
              Enter details for a new medication schedule.
            </CardDescription>
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

      <div className="md:col-span-2">
         <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><History className="h-8 w-8" /> Your Medications</h1>
          <p className="text-muted-foreground">Manage and track your medication schedule.</p>
        </div>
        <div className="space-y-4">
           {medicationsLoading || logsLoading ? (
            <>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </>
          ) : medications && medications.length > 0 ? (
            medications.map((med) => <MedicationCard key={med.id} medication={med} todayLog={getLogForMedication(med.id)} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No medications added yet. Add one to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}
