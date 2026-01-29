'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Briefcase, Loader2 } from 'lucide-react';

const APPLICATION_TYPES = [
  { value: 'doctor', label: 'Doctor / Telemedicine' },
  { value: 'service_provider', label: 'Service provider (nursing, physio, etc.)' },
  { value: 'shop', label: 'Shop / Product seller' },
  { value: 'other', label: 'Other' },
] as const;

type AppType = (typeof APPLICATION_TYPES)[number]['value'];

const initial = {
  type: '' as AppType | '',
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  message: '',
};

export function PartnerApplicationForm() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.businessName.trim() || !form.contactName.trim() || !form.email.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in type, business name, contact name, and email.' });
      return;
    }
    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ variant: 'destructive', title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(firestore, 'partnerApplications'), {
        type: form.type,
        businessName: form.businessName.trim(),
        contactName: form.contactName.trim(),
        email,
        phone: (form.phone || '').trim() || null,
        message: (form.message || '').trim() || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Application submitted', description: "We'll review your application and get back to you soon." });
      setForm(initial);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      toast({ variant: 'destructive', title: 'Could not submit', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">List your business on ElderLink</h2>
            <p className="text-sm text-muted-foreground">
              Doctors, service providers, and shops — apply here. Our team will review and add approved listings.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="partner-type">Application type *</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as AppType }))}
            >
              <SelectTrigger id="partner-type" className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="partner-business">Business / Organization name *</Label>
            <Input
              id="partner-business"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              placeholder="e.g. ABC Clinic"
              className="mt-1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="partner-contact">Contact name *</Label>
              <Input
                id="partner-contact"
                value={form.contactName}
                onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="partner-email">Email *</Label>
              <Input
                id="partner-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="partner-phone">Phone (optional)</Label>
            <Input
              id="partner-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+91..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="partner-message">Message (optional)</Label>
            <Textarea
              id="partner-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Brief description of your services or products..."
              rows={4}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit application'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
