
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { createVital } from '@/lib/vitals-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, HeartPulse, Droplets, Wind, Weight, History } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { WithId } from '@/firebase/firestore/use-collection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

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
  blood_pressure: <HeartPulse className="h-5 w-5 text-red-500" />,
  blood_sugar: <Droplets className="h-5 w-5 text-orange-500" />,
  spo2: <Wind className="h-5 w-5 text-blue-500" />,
  weight: <Weight className="h-5 w-5 text-gray-500" />,
};

const vitalLabels = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  spo2: 'SpO2 (%)',
  weight: 'Weight (kg)',
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
    () => user ? query(collection(firestore, `users/${user.uid}/vitals`), orderBy('timestamp', 'desc')) : null,
    [firestore, user]
  );
  const { data: vitals, isLoading } = useCollection<Vital>(vitalsQuery);

  const onSubmit = (values: VitalFormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    createVital(firestore, user.uid, values as any)
      .then(() => {
        toast({
          title: 'Vital Logged',
          description: `Your ${vitalLabels[values.type]} reading has been saved.`,
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
            <CardTitle>Log New Vital</CardTitle>
            <CardDescription>
              Enter a new reading for a health metric.
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                  Log Vital
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
         <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><History className="h-8 w-8" /> Vitals History</h1>
          <p className="text-muted-foreground">View your recent health readings.</p>
        </div>
        <Card>
          <CardContent className="p-0">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : vitals && vitals.length > 0 ? (
                  vitals.map((vital: WithId<Vital>) => (
                    <TableRow key={vital.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {vitalIcons[vital.type as keyof typeof vitalIcons]}
                        {vitalLabels[vital.type as keyof typeof vitalLabels]}
                      </TableCell>
                      <TableCell>{vital.value}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {vital.timestamp ? format(vital.timestamp.toDate(), 'PPpp') : '...'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                            No vitals logged yet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
