'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Trash2, Gift, Save } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getReferralConfig,
  updateReferralConfig,
  ensureReferralConfig,
  listUsersWithReferrals,
} from '@/lib/referral-actions';
import { REFERRAL_REWARD_TYPES } from '@/lib/referral-types';
import type { ReferralConfig, ReferralTier } from '@/lib/referral-types';

export default function AdminReferralsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [users, setUsers] = useState<{ id: string; email?: string; firstName?: string; referralCode?: string; referralCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftTiers, setDraftTiers] = useState<ReferralTier[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await ensureReferralConfig(firestore);
      const [cfg, userList] = await Promise.all([
        getReferralConfig(firestore),
        listUsersWithReferrals(firestore),
      ]);
      setConfig(cfg || null);
      setDraftTiers(cfg?.tiers?.length ? [...cfg.tiers] : [
        { threshold: 5, rewardType: 'monetary', rewardDescription: 'Rs 500' },
        { threshold: 10, rewardType: 'medical_test', rewardDescription: 'Free health checkup' },
        { threshold: 20, rewardType: 'gift_coupon', rewardDescription: 'Children gift voucher' },
      ]);
      setUsers(userList);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Load failed', description: e?.message });
    } finally {
      setLoading(false);
    }
  }, [firestore, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const addTier = () => {
    setDraftTiers((t) => [...t, { threshold: 5, rewardType: 'monetary', rewardDescription: '' }]);
  };

  const updateTier = (i: number, patch: Partial<ReferralTier>) => {
    setDraftTiers((t) => t.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  const removeTier = (i: number) => {
    setDraftTiers((t) => t.filter((_, j) => j !== i));
  };

  const handleSave = async () => {
    const sorted = [...draftTiers].sort((a, b) => a.threshold - b.threshold);
    if (sorted.some((t) => !t.rewardDescription.trim())) {
      toast({ variant: 'destructive', title: 'Validation', description: 'All reward descriptions are required.' });
      return;
    }
    setSaving(true);
    try {
      await updateReferralConfig(firestore, { tiers: sorted });
      setConfig((c) => (c ? { ...c, tiers: sorted } : { tiers: sorted }));
      toast({ title: 'Saved', description: 'Referral tiers updated.' });
      await load();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save failed', description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">Configure tiers and rewards. Users earn rewards when their referrals reach thresholds.</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Tiers & Rewards
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addTier}>
              <Plus className="mr-1 h-4 w-4" />
              Add tier
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When a user refers N members (e.g. 5, 10, 20), they earn the reward for that tier. Admin will disburse rewards manually.
          </p>
          <div className="space-y-3">
            {draftTiers.map((tier, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <div className="w-24">
                  <Label className="text-xs">Threshold</Label>
                  <Input
                    type="number"
                    min={1}
                    value={tier.threshold}
                    onChange={(e) => updateTier(i, { threshold: Number(e.target.value) || 1 })}
                  />
                </div>
                <div className="w-40">
                  <Label className="text-xs">Reward type</Label>
                  <Select
                    value={tier.rewardType}
                    onValueChange={(v: ReferralTier['rewardType']) => updateTier(i, { rewardType: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REFERRAL_REWARD_TYPES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <Label className="text-xs">Reward description</Label>
                  <Input
                    placeholder="e.g. Rs 500, Free health checkup"
                    value={tier.rewardDescription}
                    onChange={(e) => updateTier(i, { rewardDescription: e.target.value })}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeTier(i)} className="shrink-0">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          {draftTiers.length === 0 && (
            <p className="text-sm text-muted-foreground">No tiers. Add one to enable rewards.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Top referrers</CardTitle>
          <p className="text-sm text-muted-foreground">Users with the most referrals. Use this to disburse rewards.</p>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground py-4">No referral data yet.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {users.filter((u) => u.referralCount > 0).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <span className="font-medium">{u.firstName || u.email || u.id}</span>
                    {u.email && <span className="text-muted-foreground text-sm ml-2">{u.email}</span>}
                    <p className="text-xs text-muted-foreground">Code: {u.referralCode || '—'}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                    {u.referralCount} referrals
                  </span>
                </div>
              ))}
              {users.filter((u) => u.referralCount > 0).length === 0 && (
                <p className="text-muted-foreground">No one has referrals yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
