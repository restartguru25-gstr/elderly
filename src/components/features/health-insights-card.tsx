'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { getHealthInsights } from '@/app/actions/health-insights';
import { Sparkles, Loader2 } from 'lucide-react';
import { withTimeout } from '@/lib/timeout';

type Vital = { type: string; value: string; timestamp?: { toDate: () => Date } };

export function HealthInsightsCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [insights, setInsights] = useState<{ summary: string; recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const vitalsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'vitals'),
            orderBy('timestamp', 'desc'),
            limit(14)
          )
        : null,
    [firestore, user]
  );
  const { data: vitals } = useCollection<Vital>(vitalsQuery);

  const buildSummary = () => {
    if (!vitals?.length) return '';
    return vitals
      .map((v) => {
        const date = v.timestamp?.toDate ? format(v.timestamp.toDate(), 'yyyy-MM-dd') : '';
        return `${v.type} ${v.value} on ${date}`;
      })
      .join('\n');
  };

  const handleGetInsights = async () => {
    const summary = buildSummary();
    setLoading(true);
    try {
      const result = await withTimeout(getHealthInsights(summary), 20_000, 'AI insights timed out. Please try again.');
      setInsights(result);
    } catch {
      setInsights({
        summary: 'Unable to generate insights right now.',
        recommendations: ['Try again later or log more vitals.'],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Health Insights
        </CardTitle>
        <CardDescription>
          Get a friendly summary and simple recommendations from your recent vitals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!insights ? (
          <Button
            onClick={handleGetInsights}
            disabled={loading || !vitals?.length}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? 'Thinking…' : 'Get AI insights'}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">{insights.summary}</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {insights.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <Button variant="outline" size="sm" onClick={handleGetInsights} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh insights
            </Button>
          </div>
        )}
        {!vitals?.length && (
          <p className="text-xs text-muted-foreground">Log vitals first to use AI insights.</p>
        )}
      </CardContent>
    </Card>
  );
}
