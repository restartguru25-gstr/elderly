
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/user-actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  age: z.coerce.number().optional(),
  phone: z.string().optional(),
  language: z.string().optional(),
  emergencyContacts: z.string().optional(),
  healthConditions: z.string().optional(),
  permissions: z.object({
    vitals: z.boolean().default(true),
    location: z.boolean().default(true),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: undefined,
      phone: '',
      language: 'en',
      emergencyContacts: '',
      healthConditions: '',
      permissions: {
        vitals: true,
        location: true,
      }
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        age: userProfile.age || undefined,
        phone: userProfile.phone || '',
        language: userProfile.language || 'en',
        emergencyContacts: userProfile.emergencyContacts?.join('\n') || '',
        healthConditions: userProfile.healthConditions?.join('\n') || '',
        permissions: userProfile.permissions || { vitals: true, location: true },
      });
    }
  }, [userProfile, form]);

  function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSaving(true);
    
    const updateData = {
        ...data,
        emergencyContacts: data.emergencyContacts?.split('\n').filter(c => c.trim() !== '') || [],
        healthConditions: data.healthConditions?.split('\n').filter(c => c.trim() !== '') || [],
    }

    updateUserProfile(firestore, user.uid, updateData)
      .then(() => {
        toast({
          title: 'Profile Updated',
          description: 'Your information has been saved successfully.',
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-px w-full" />
         <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
         </div>
         <Skeleton className="h-px w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
                 <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </div>
         </div>


        <Skeleton className="h-10 w-24 mt-4" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Your age" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
         <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>This will be used for notifications and in-app text.</FormDescription>
                  <FormMessage />
                </FormItem>
            )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="emergencyContacts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contacts</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Jane Doe (Daughter) - 555-1234, Mike Smith (Neighbor) - 555-5678. Add one contact per line."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                List your emergency contacts, one per line. Include their name, relationship, and phone number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="healthConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pre-existing Health Conditions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Hypertension, Diabetes Type 2, Allergic to Penicillin. Add one condition per line."
                  {...field}
                  rows={4}
                />
              </FormControl>
               <FormDescription>
                List any important health information or allergies, one per line.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        
        <div>
            <h3 className="mb-4 text-lg font-medium">Privacy Controls</h3>
            <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="permissions.vitals"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Share Vitals Data</FormLabel>
                            <FormDescription>
                            Allow your guardian to view your vitals history (e.g., blood pressure, blood sugar).
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="permissions.location"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Share Location Data</FormLabel>
                            <FormDescription>
                            Allow your guardian to see your location during an emergency (SOS).
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
            </div>
        </div>


        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
