'use client';

import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { doctors as fallbackDoctors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2, Search } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { createAppointment } from '@/lib/telemedicine-actions';
import type { Doctor } from '@/lib/doctors-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ParentSelector } from '@/components/features/parent-selector';
import { useLinkedSenior } from '@/hooks/use-linked-senior';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

function BookAppointmentButton({
  doctor,
  patientId,
  patientName,
}: {
  doctor: { id: string; name: string; specialty: string; imageId?: string | null };
  patientId?: string | null;
  patientName?: string;
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const t = useTranslations('guardian');
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleBooking = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to book an appointment.' });
      return;
    }
    const targetId = patientId || user.uid;
    setIsLoading(true);
    createAppointment(firestore, targetId, {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
    })
      .then(() => {
        toast({
          title: t('appointmentBooked'),
          description: patientName ? t('appointmentBookedDesc', { name: patientName }) : `Your appointment with ${doctor.name} has been confirmed.`,
        });
        setIsAlertOpen(false);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: t('permissionDenied'), description: t('permissionDeniedDesc') });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {patientId ? t('bookForParent') : 'Book Appointment'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            {patientName ? t('bookAppointmentFor', { name: patientName }) : 'Book for yourself'}
            {' — '}
            {doctor.name} ({doctor.specialty})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBooking} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function TelemedicinePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc(userDocRef);
  const { linkedSeniors, selectedSeniorId, selectedSenior } = useLinkedSenior();

  const doctorsQuery = useMemoFirebase(
    () => query(collection(firestore, 'doctors'), orderBy('createdAt', 'desc'), limit(50)),
    [firestore]
  );
  const { data: doctorsFromDb, isLoading: doctorsLoading } = useCollection<Doctor>(doctorsQuery);

  const doctors = (doctorsFromDb && doctorsFromDb.length > 0)
    ? doctorsFromDb
    : fallbackDoctors.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty, imageId: d.imageId }));

  const isGuardian = userProfile?.userType === 'guardian';
  const hasLinkedParent = isGuardian && linkedSeniors.length > 0 && selectedSeniorId;
  const parentName = selectedSenior
    ? [selectedSenior.firstName, selectedSenior.lastName].filter(Boolean).join(' ').trim() || 'Parent'
    : 'Parent';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Telemedicine Services</h1>
          <p className="max-w-2xl text-muted-foreground">
            Book online, clinic, or home visit appointments with verified and trusted healthcare professionals.
          </p>
        </div>
        {isGuardian && <ParentSelector />}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by doctor name or specialty..." className="max-w-lg pl-10" />
      </div>

      {doctorsLoading && doctorsFromDb === null ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {doctors.map((doctor) => {
            const image = PlaceHolderImages.find((p) => p.id === (doctor.imageId || 'doctor-avatar-1'));
            return (
              <Card key={doctor.id} className="flex flex-col">
                <CardHeader className="items-center text-center">
                  <Avatar className="mb-4 h-24 w-24">
                    {image && <AvatarImage src={image.imageUrl} alt={doctor.name} data-ai-hint={image.imageHint} />}
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialty}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-grow items-end justify-center">
                  <BookAppointmentButton
                    doctor={doctor}
                    patientId={hasLinkedParent ? selectedSeniorId : null}
                    patientName={hasLinkedParent ? parentName : undefined}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
