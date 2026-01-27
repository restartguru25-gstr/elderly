
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, type EmergencyContact } from '@/lib/user-actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';

const emergencyContactSchema = z.object({
  name: z.string().optional(),
  mobile: z.string().optional().refine((s) => !s?.trim() || /^[0-9+\s-]{10,}$/.test(s.trim()), 'Enter a valid 10+ digit number.'),
  relation: z.string().optional(),
});

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  age: z.coerce.number().optional(),
  phone: z.string().optional(),
  language: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema),
  healthConditions: z.string().optional(),
  permissions: z.object({
    vitals: z.boolean().default(true),
    location: z.boolean().default(true),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const RELATION_OPTIONS = [
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'In-laws', label: 'In-laws' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Grandchild', label: 'Grandchild' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Neighbour', label: 'Neighbour' },
  { value: 'Caretaker', label: 'Caretaker' },
  { value: 'Other', label: 'Other' },
] as const;

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
      emergencyContacts: [],
      healthConditions: '',
      permissions: {
        vitals: true,
        location: true,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'emergencyContacts',
  });

  useEffect(() => {
    if (!userProfile) return;
    const raw = userProfile.emergencyContacts;
    const contacts: EmergencyContact[] = Array.isArray(raw)
      ? raw.filter((c): c is EmergencyContact => typeof c === 'object' && c !== null && 'mobile' in c && 'relation' in c)
      : [];
    form.reset({
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      age: userProfile.age || undefined,
      phone: userProfile.phone || '',
      language: userProfile.language || 'en',
      emergencyContacts: contacts.length > 0 ? contacts : [],
      healthConditions: userProfile.healthConditions?.join('\n') || '',
      permissions: userProfile.permissions || { vitals: true, location: true },
    });
  }, [userProfile, form]);

  function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSaving(true);
    const contacts = data.emergencyContacts
      .filter((c) => (c.mobile?.trim() ?? '') !== '' && (c.relation?.trim() ?? '') !== '')
      .map((c) => ({
        name: c.name?.trim() || undefined,
        mobile: c.mobile!.trim(),
        relation: c.relation!.trim(),
      }));
    const updateData = {
      ...data,
      emergencyContacts: contacts,
      healthConditions: data.healthConditions?.split('\n').filter((c) => c.trim() !== '') || [],
    };
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
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="kn">Kannada</SelectItem>
                      <SelectItem value="ml">Malayalam</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>This will be used for notifications and in-app text.</FormDescription>
                  <FormMessage />
                </FormItem>
            )}
        />

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-lg font-medium">Emergency Contacts</h3>
            <p className="text-sm text-muted-foreground">
              Add people to notify in an emergency. Include mobile number and relation.
            </p>
          </div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-4 rounded-xl border-2 border-border bg-muted/30 p-4 sm:grid-cols-12"
            >
              <FormField
                control={form.control}
                name={`emergencyContacts.${index}.name`}
                render={({ field: f }) => (
                  <FormItem className="sm:col-span-12 md:col-span-4">
                    <FormLabel>Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ramesh" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergencyContacts.${index}.mobile`}
                render={({ field: f }) => (
                  <FormItem className="sm:col-span-12 md:col-span-4">
                    <FormLabel>Mobile number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 9876543210" type="tel" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergencyContacts.${index}.relation`}
                render={({ field: f }) => (
                  <FormItem className="sm:col-span-12 md:col-span-3">
                    <FormLabel>Relation</FormLabel>
                    <Select onValueChange={f.onChange} value={f.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RELATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end sm:col-span-12 md:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label="Remove contact"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-dashed"
            onClick={() => append({ name: '', mobile: '', relation: '' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add emergency contact
          </Button>
        </div>

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
