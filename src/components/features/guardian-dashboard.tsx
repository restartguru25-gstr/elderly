'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithId } from '@/firebase/firestore/use-collection';
import {
  ArrowUpRight,
  Phone,
  Send,
  HeartPulse,
  Pill,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, where } from 'firebase/firestore';
import { useLinkedSenior } from '@/hooks/use-linked-senior';
import { ParentSelector } from './parent-selector';
import { createReminder } from '@/lib/reminder-actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type UserProfile = WithId<{
  firstName: string;
  lastName?: string;
  userType?: string;
}>;

type Vital = { type: string; value: string; userId: string; timestamp: { toDate: () => Date } };
type Medication = { name: string; dosage: string; schedule: string; userId: string; createdAt: unknown };
type MedicationLog = { medicationId: string; userId: string; taken: boolean; date: string; timestamp?: { toDate: () => Date } };
type MoodCheckin = { userId: string; notes?: string; moodScore?: number; timestamp: { toDate: () => Date } };
type Appointment = {
  userId: string;
  doctorName: string;
  specialty: string;
  status: string;
  appointmentTime?: { toDate: () => Date };
  createdAt?: { toDate: () => Date };
};

export function GuardianDashboard({ userProfile }: { userProfile: UserProfile }) {
  const t = useTranslations('guardian');
  const tDash = useTranslations('dashboard');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { linkedSeniors, selectedSeniorId, selectedSenior, isLoading: linkLoading } = useLinkedSenior();
  const [remindOpen, setRemindOpen] = useState(false);
  const [remindMessage, setRemindMessage] = useState('');
  const [remindSending, setRemindSending] = useState(false);

  const parentDocRef = useMemoFirebase(
    () => (selectedSeniorId ? doc(firestore, 'users', selectedSeniorId) : null),
    [firestore, selectedSeniorId]
  );
  const { data: parentProfile } = useDoc(parentDocRef);

  const vitalsQuery = useMemoFirebase(
    () =>
      selectedSeniorId
        ? query(
            collection(firestore, 'users', selectedSeniorId, 'vitals'),
            orderBy('timestamp', 'desc')
          )
        : null,
    [firestore, selectedSeniorId]
  );
  const { data: vitals } = useCollection<Vital>(vitalsQuery);

  const medsQuery = useMemoFirebase(
    () =>
      selectedSeniorId
        ? query(
            collection(firestore, 'users', selectedSeniorId, 'medications'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, selectedSeniorId]
  );
  const { data: medications } = useCollection<Medication>(medsQuery);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const logsQuery = useMemoFirebase(
    () =>
      selectedSeniorId
        ? query(
            collection(firestore, 'users', selectedSeniorId, 'medication_logs'),
            where('date', '==', todayStr)
          )
        : null,
    [firestore, selectedSeniorId, todayStr]
  );
  const { data: medicationLogs } = useCollection<MedicationLog>(logsQuery);

  const moodQuery = useMemoFirebase(
    () =>
      selectedSeniorId
        ? query(
            collection(firestore, 'users', selectedSeniorId, 'moodCheckins'),
            orderBy('timestamp', 'desc')
          )
        : null,
    [firestore, selectedSeniorId]
  );
  const { data: moodCheckins } = useCollection<MoodCheckin>(moodQuery);

  const appointmentsQuery = useMemoFirebase(
    () =>
      selectedSeniorId
        ? query(
            collection(firestore, 'users', selectedSeniorId, 'telemedicineAppointments'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, selectedSeniorId]
  );
  const { data: appointments } = useCollection<Appointment>(appointmentsQuery);

  const takenToday = medicationLogs?.filter((l) => l.taken).length ?? 0;
  const totalMeds = medications?.length ?? 0;
  const medsStatus = totalMeds > 0 ? `${takenToday}/${totalMeds}` : '—';
  const latestMood = moodCheckins?.[0];
  const latestVital = vitals?.[0];
  const upcomingAppointments = appointments?.filter((a) => a.status === 'booked') ?? [];
  const healthScore = vitals && vitals.length > 0 ? 85 + Math.min(15, vitals.length) : null;

  const parentName = selectedSenior
    ? [selectedSenior.firstName, selectedSenior.lastName].filter(Boolean).join(' ').trim() || t('parent')
    : t('parent');
  const parentPhone = parentProfile && 'phone' in parentProfile ? (parentProfile as { phone?: string }).phone : selectedSenior?.phone;
  const canCall = !!parentPhone && /[0-9]/.test(String(parentPhone));

  const handleSendReminder = async () => {
    if (!user || !selectedSeniorId || !remindMessage.trim()) return;
    setRemindSending(true);
    try {
      await createReminder(firestore, selectedSeniorId, {
        fromGuardianId: user.uid,
        fromGuardianName: user.displayName || user.email || undefined,
        message: remindMessage.trim(),
      });
      toast({ title: t('reminderSent'), description: t('reminderSentDesc', { name: parentName }) });
      setRemindMessage('');
      setRemindOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: t('permissionDenied'), description: t('permissionDeniedDesc') });
    } finally {
      setRemindSending(false);
    }
  };

  if (linkLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (linkedSeniors.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          {tDash('hello')}, {userProfile.firstName}! 👋
        </h1>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{t('noParentLinked')}</CardTitle>
            <CardDescription>{t('linkParentFirst')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/family">Go to Family</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold sm:text-5xl lg:text-6xl">
              {tDash('hello')}, {userProfile.firstName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">{tDash('guardianSubtitle')}</p>
          </div>
          <ParentSelector />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
              </div>
              <div className="text-2xl font-bold sm:text-3xl">{healthScore ?? '—'}%</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{tDash('healthScore')}</div>
            </CardContent>
          </Card>
          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <Pill className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div className="text-2xl font-bold sm:text-3xl">{medsStatus}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{tDash('medications')}</div>
            </CardContent>
          </Card>
          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <HeartPulse className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
              </div>
              <div className="text-2xl font-bold sm:text-3xl">{vitals?.length ?? 0}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{tDash('activities')}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-2 shadow-soft-lg">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">{t('parentStatus')}</CardTitle>
              <CardDescription>{t('realTimeUpdates')}</CardDescription>
            </div>
            <Badge className="w-fit bg-green-500 text-white">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {t('allGood')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-950/30 dark:to-emerald-950/30 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500 p-3">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold sm:text-lg">{t('medicineTaken')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('lastTaken')}: {totalMeds > 0 ? (takenToday >= totalMeds ? 'All today' : `${takenToday} of ${totalMeds}`) : 'No medications'}
                </p>
              </div>
            </div>
            <span className="text-3xl sm:text-4xl">{takenToday >= totalMeds && totalMeds > 0 ? '✅' : '⏳'}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 bg-secondary/30 p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <HeartPulse className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold sm:text-lg">{t('lastActivity')}</p>
                <p className="text-sm text-muted-foreground">
                  {latestVital
                    ? `Vital logged ${format(latestVital.timestamp.toDate(), 'MMM d, h:mm a')}`
                    : latestMood
                      ? `Mood at ${format(latestMood.timestamp.toDate(), 'MMM d, h:mm a')}`
                      : 'No recent activity'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 dark:border-yellow-800 dark:from-yellow-950/30 dark:to-orange-950/30 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-400 p-3">
                <span className="text-2xl">
                  {latestMood?.moodScore != null
                    ? latestMood.moodScore >= 7
                      ? '😊'
                      : latestMood.moodScore >= 4
                        ? '😐'
                        : '😔'
                    : '😊'}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold sm:text-lg">{t('currentMood')}</p>
                <p className="text-sm text-muted-foreground">
                  {latestMood?.notes || (latestMood?.moodScore != null ? `Score: ${latestMood.moodScore}/10` : 'No mood logged recently')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Quick Actions</CardTitle>
          <CardDescription>Connect with your parent and manage their care</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {canCall ? (
            <Button size="lg" className="h-auto py-6 text-base font-semibold" asChild>
              <a href={`tel:${parentPhone}`}>
                <Phone className="mr-2 h-5 w-5" />
                {t('callParent')}
              </a>
            </Button>
          ) : (
            <Button size="lg" className="h-auto py-6 text-base font-semibold" disabled title={t('permissionDeniedDesc')}>
              <Phone className="mr-2 h-5 w-5" />
              {t('callParent')}
            </Button>
          )}
          <Dialog open={remindOpen} onOpenChange={setRemindOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="h-auto border-2 py-6 text-base font-semibold">
                <Send className="mr-2 h-5 w-5" />
                {t('sendReminder')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('sendReminder')}</DialogTitle>
                <DialogDescription>Send a reminder to {parentName}. They will see it in their dashboard.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="remind-msg">Message</Label>
                <Textarea
                  id="remind-msg"
                  placeholder="e.g. Please take your evening pills"
                  value={remindMessage}
                  onChange={(e) => setRemindMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemindOpen(false)} disabled={remindSending}>
                  Cancel
                </Button>
                <Button onClick={handleSendReminder} disabled={remindSending || !remindMessage.trim()}>
                  {remindSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="lg" variant="outline" className="h-auto border-2 py-6 text-base font-semibold" asChild>
            <Link href="/dashboard/telemedicine">
              {t('bookDoctor')}
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 sm:gap-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t('healthSummary')}</CardTitle>
            <CardDescription>{t('thisWeekMetrics')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vitals && vitals.length > 0 ? (
              vitals.slice(0, 4).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">
                      {v.type === 'blood_pressure' && 'Blood Pressure'}
                      {v.type === 'blood_sugar' && 'Blood Sugar'}
                      {v.type === 'spo2' && 'SpO2'}
                      {v.type === 'weight' && 'Weight'}
                      {!['blood_pressure', 'blood_sugar', 'spo2', 'weight'].includes(v.type) && v.type}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    {v.value}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No vitals logged yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t('upcomingEvents')}</CardTitle>
            <CardDescription>{t('importantDates')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="rounded-full bg-primary p-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{apt.doctorName} – {apt.specialty}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.appointmentTime ? format(apt.appointmentTime.toDate(), 'MMM d, h:mm a') : 'Booked'}
                    </p>
                  </div>
                </div>
              ))
            ) : null}
            <div className="flex items-center gap-4 rounded-lg bg-secondary/30 p-3">
              <div className="rounded-full bg-muted p-2">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Community</p>
                <p className="text-xs text-muted-foreground">Explore events</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/community">View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
