
'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { doctors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2, Search } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createAppointment } from '@/lib/telemedicine-actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type Doctor = (typeof doctors)[0];

function BookAppointmentButton({ doctor }: { doctor: Doctor }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleBooking = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to book an appointment.' });
      return;
    }
    setIsLoading(true);

    createAppointment(firestore, user.uid, {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
    })
      .then(() => {
        toast({
          title: 'Appointment Booked!',
          description: `Your appointment with ${doctor.name} has been confirmed.`,
        });
        setIsAlertOpen(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Book Appointment</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to book an appointment with {doctor.name} ({doctor.specialty})?
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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Telemedicine Services</h1>
        <p className="max-w-2xl text-muted-foreground">
          Book online, clinic, or home visit appointments with verified and trusted healthcare professionals.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search by doctor name or specialty..." className="w-full max-w-lg pl-10" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {doctors.map((doctor) => {
          const image = PlaceHolderImages.find((p) => p.id === doctor.imageId);
          return (
            <Card key={doctor.id} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  {image && <AvatarImage src={image.imageUrl} alt={doctor.name} data-ai-hint={image.imageHint} />}
                  <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{doctor.name}</CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end justify-center">
                <BookAppointmentButton doctor={doctor} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
