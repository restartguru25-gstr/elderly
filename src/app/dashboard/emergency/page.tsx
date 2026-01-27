'use client';

import { Button } from '@/components/ui/button';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createEmergencyAlert } from '@/lib/emergency-alert-actions';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

export default function EmergencyPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    
    const [isConfirming, setIsConfirming] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const SOS_COOLDOWN_MS = 60_000;

    useEffect(() => {
        let t: ReturnType<typeof setInterval>;
        const check = () => {
            try {
                const last = localStorage.getItem('elderlink-sos-last');
                if (!last) { setCooldownRemaining(0); return; }
                const elapsed = Date.now() - parseInt(last, 10);
                const left = Math.ceil((SOS_COOLDOWN_MS - elapsed) / 1000);
                setCooldownRemaining(left > 0 ? left : 0);
            } catch { setCooldownRemaining(0); }
        };
        check();
        t = setInterval(check, 1000);
        return () => clearInterval(t);
    }, []);

    const handleConfirm = useCallback(() => {
        setIsConfirming(false);
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to send an SOS alert.' });
            return;
        }
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                createEmergencyAlert(firestore, user.uid, { latitude, longitude })
                    .then(() => {
                        try { localStorage.setItem('elderlink-sos-last', String(Date.now())); } catch { /* ignore */ }
                        toast({
                            title: 'SOS Alert Sent!',
                            description: 'Your emergency contacts have been notified with your location.',
                        });
                        router.push('/dashboard');
                    })
                    .finally(() => setIsLoading(false));
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
    }, [user, firestore, toast, router]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isConfirming && countdown > 0) {
            timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        } else if (isConfirming && countdown === 0) {
            handleConfirm();
        }
        return () => clearTimeout(timer);
    }, [isConfirming, countdown, handleConfirm]);

    const handleInitialClick = () => { if (cooldownRemaining > 0) return; setIsConfirming(true); };
    const handleCancel = () => {
        setIsConfirming(false);
        setCountdown(5);
    };

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
            {isConfirming ? (
                <div className="space-y-6">
                    <h1 className="text-6xl font-bold text-destructive animate-pulse">{countdown}</h1>
                    <p className="text-xl text-muted-foreground">Sending alert in...</p>
                    <Button variant="outline" size="lg" onClick={handleCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                </div>
            ) : (
                <div className="space-y-6 flex flex-col items-center">
                     <h1 className="text-4xl font-bold">Need Immediate Help?</h1>
                     <p className="max-w-md text-muted-foreground">
                        Pressing this button will send an emergency alert with your location to your family and our response team. Use only in a genuine emergency.
                    </p>
                    {cooldownRemaining > 0 && (
                        <p className="text-sm text-amber-600 font-medium">Please wait {cooldownRemaining}s before sending another alert.</p>
                    )}
                    <Button 
                        variant="destructive" 
                        className="rounded-full w-64 h-64 text-4xl flex-col gap-2"
                        onClick={handleInitialClick}
                        disabled={isLoading || cooldownRemaining > 0}
                    >
                        {isLoading ? (
                            <Loader2 className="h-16 w-16 animate-spin" />
                        ) : (
                            <>
                                <span className="text-7xl">🚨</span>
                                HELP ME
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
