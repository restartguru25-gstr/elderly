'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback } from '@/lib/feedback-actions';
import { Loader2, MessageSquare, Star } from 'lucide-react';

const schema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Please write at least 10 characters').max(2000),
});

type FormValues = z.infer<typeof schema>;

export default function FeedbackPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, comment: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      await submitFeedback(firestore, {
        userId: user.uid,
        email: user.email ?? undefined,
        rating: values.rating,
        comment: values.comment,
        page: 'dashboard/feedback',
      });
      setSubmitted(true);
      toast({ title: 'Thank you!', description: 'Your feedback helps us improve ElderLink.' });
      form.reset();
    } catch {
      toast({ variant: 'destructive', title: 'Could not send', description: 'Please try again later.' });
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Feedback</h1>
        <Card className="border-2 max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <Star className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Thank you!</h2>
                <p className="text-muted-foreground mt-1">Your feedback has been sent. We appreciate it.</p>
              </div>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Send more feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Send feedback
        </h1>
        <p className="text-muted-foreground mt-1">
          Tell us what you like or what we can improve. We read every message.
        </p>
      </div>

      <Card className="border-2 max-w-xl">
        <CardHeader>
          <CardTitle>Your feedback</CardTitle>
          <CardDescription>Rate your experience and optionally leave a comment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1–5 stars)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => field.onChange(n)}
                            className={`rounded-lg border-2 p-2 transition-colors ${
                              field.value >= n
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-muted hover:border-primary/50'
                            }`}
                            aria-label={`${n} star${n > 1 ? 's' : ''}`}
                          >
                            <Star className={`h-6 w-6 ${field.value >= n ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What worked well? What could be better?"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send feedback
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
