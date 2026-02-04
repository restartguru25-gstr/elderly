'use client';

import { useEffect, useState, useCallback } from 'react';
import { Gift, Link2, Users, Copy, Loader2, Check } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  getOrCreateReferralCode,
  getReferralConfig,
  getUserReferralCount,
} from '@/lib/referral-actions';
import type { ReferralTier } from '@/lib/referral-types';

export default function ReferralPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [config, setConfig] = useState<{ tiers: ReferralTier[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [c, cnt, cfg] = await Promise.all([
        getOrCreateReferralCode(firestore, user.uid),
        getUserReferralCount(firestore, user.uid),
        getReferralConfig(firestore),
      ]);
      setCode(c);
      setCount(cnt);
      setConfig(cfg || { tiers: [] });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message });
    } finally {
      setLoading(false);
    }
  }, [firestore, user?.uid, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const referralLink = typeof window !== 'undefined' && code
    ? `${window.location.origin}/signup?ref=${code}`
    : '';
  const shortLink = typeof window !== 'undefined' && code
    ? `${window.location.origin}/r/${code}`
    : '';

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tiers = config?.tiers ?? [];
  const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
  const nextTier = sortedTiers.find((t) => t.threshold > (count ?? 0));
  const earnedTiers = sortedTiers.filter((t) => (count ?? 0) >= t.threshold);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">
          Referral <span className="text-gradient-primary">Program</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Share ElderLink with friends and family. Earn rewards when they join!
        </p>
      </div>

      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Your referral link
          </CardTitle>
          <p className="text-sm text-muted-foreground">Share this link. When someone signs up using it, they count as your referral.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              readOnly
              value={referralLink}
              className="font-mono text-sm"
            />
            <Button onClick={copyLink} className="shrink-0">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Short link: <strong>{shortLink}</strong> — Your code: <strong>{code}</strong>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{count ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">people joined using your link</p>
          </CardContent>
        </Card>

        {nextTier && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Next reward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{nextTier.rewardDescription}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {nextTier.threshold - (count ?? 0)} more referrals to go
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((count ?? 0) / nextTier.threshold) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {sortedTiers.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Reward tiers</CardTitle>
            <p className="text-sm text-muted-foreground">Reach these milestones to earn rewards. Admin will disburse them.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedTiers.map((tier) => {
                const reached = (count ?? 0) >= tier.threshold;
                return (
                  <div
                    key={tier.threshold}
                    className={`flex items-center justify-between rounded-lg border p-4 ${reached ? 'border-primary/50 bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {reached && <Check className="h-5 w-5 text-primary" />}
                      <div>
                        <p className="font-medium">{tier.rewardDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          {tier.threshold} referrals {reached ? '— Earned!' : `(${(count ?? 0)}/${tier.threshold})`}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm ${reached ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {tier.rewardType}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {sortedTiers.length === 0 && (
        <Card className="border-2">
          <CardContent className="py-8 text-center text-muted-foreground">
            No reward tiers configured yet. Check back later!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
