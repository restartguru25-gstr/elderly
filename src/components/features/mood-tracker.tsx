
'use client';

import { trackMoodWithNLP } from '@/ai/flows/track-mood-with-nlp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { createMoodCheckin } from '@/lib/mood-actions';

const formSchema = z.object({
  moodCheckIn: z.string().min(10, 'Please share a little more about your feelings.').max(500),
});

type FormValues = z.infer<typeof formSchema>;

export function MoodTracker() {
  const [analysis, setAnalysis] = useState<{ score: number; notified: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodCheckIn: '',
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
        toast({
            title: 'Not Logged In',
            description: 'You must be logged in to track your mood.',
            variant: 'destructive',
        });
        return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await trackMoodWithNLP({ moodCheckIn: values.moodCheckIn });
      
      await createMoodCheckin(firestore, user.uid, {
        notes: values.moodCheckIn,
        moodScore: result.sentimentScore,
      });

      setAnalysis({ score: result.sentimentScore, notified: result.notifyGuardian });

      if (result.notifyGuardian) {
        toast({
          title: 'Guardian Notified',
          description: 'A significant negative shift in mood was detected and the guardian has been alerted.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Mood Logged',
          description: 'Thank you for sharing. Your mood has been successfully logged.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not analyze mood. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      form.reset();
    }
  }
  
  const renderSentimentIcon = () => {
    if (!analysis) return null;

    if (analysis.score > 0.3) {
      return <Smile className="h-10 w-10 text-green-500" />;
    } else if (analysis.score < -0.3) {
      return <Frown className="h-10 w-10 text-red-500" />;
    } else {
      return <Meh className="h-10 w-10 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
        <CardDescription>Share your thoughts and feelings with us. This helps your loved ones understand your well-being.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="moodCheckIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your thoughts</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about your day, what's on your mind..." {...field} rows={5}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Analyzing...' : 'Log My Mood'}
            </Button>
          </form>
        </Form>
        {analysis && (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-lg border bg-secondary/50 p-4">
            <h3 className="text-lg font-semibold">Mood Analysis</h3>
            <div className="flex items-center gap-4">
              {renderSentimentIcon()}
              <div className="text-center">
                <p className="font-bold text-xl">
                  {(analysis.score * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground">Positive</p>
              </div>
            </div>
            {analysis.notified && (
              <p className="text-center text-sm font-medium text-destructive">A guardian has been notified due to a significant mood shift.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
