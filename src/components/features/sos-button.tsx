'use client';

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
import { Button } from '@/components/ui/button';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createEmergencyAlert } from '@/lib/emergency-alert-actions';
import { Loader2, Siren } from 'lucide-react';
import React from 'react';

export function SOSButton() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to send an SOS alert.' });
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await createEmergencyAlert(firestore, user.uid, { latitude, longitude });
          toast({
            title: 'SOS Alert Sent!',
            description: 'Your emergency contacts have been notified with your location.',
          });
        } catch (error: any) {
          console.error('SOS Error:', error);
          toast({
            variant: 'destructive',
            title: 'SOS Failed',
            description: error.message || 'Could not send the alert. Please try again.',
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation Error:', error);
        toast({
          variant: 'destructive',
          title: 'Location Error',
          description: 'Could not get your location. Please enable location services.',
        });
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="default" className="flex items-center gap-2 rounded-full animate-pulse">
          <Siren className="h-5 w-5" />
          <span className="hidden sm:inline">SOS</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Emergency Alert?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately send an alert with your location to your emergency contacts and our response team. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Send Alert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
