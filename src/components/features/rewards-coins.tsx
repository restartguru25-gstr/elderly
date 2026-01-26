'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Gift, TrendingUp, Sparkles, ShoppingBag, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const recentActivities = [
  { action: 'Logged vitals', coins: 10, date: 'Today' },
  { action: 'Joined community event', coins: 25, date: 'Yesterday' },
  { action: 'Completed daily check-in', coins: 15, date: '2 days ago' },
  { action: 'Shared memory', coins: 20, date: '3 days ago' },
];

const redeemableRewards = [
  { id: '1', name: 'Health Checkup Voucher', coins: 500, icon: Gift },
  { id: '2', name: 'Community Event Pass', coins: 200, icon: Calendar },
  { id: '3', name: 'Premium Feature Access', coins: 1000, icon: Trophy },
  { id: '4', name: 'Store Discount (10%)', coins: 300, icon: ShoppingBag },
];

export function RewardsCoins({ totalCoins = 1250 }: { totalCoins?: number }) {
  return (
    <div className="space-y-6">
      {/* Coins Summary */}
      <Card className="border-2 bg-gradient-to-br from-accent/10 to-primary/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-primary p-4">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardDescription className="text-base">Your Balance</CardDescription>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold">{totalCoins.toLocaleString()}</span>
                  <span className="text-lg text-muted-foreground">ElderLink Coins</span>
                </div>
              </div>
            </div>
            <Badge className="bg-green-500 text-white text-base px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-1" />
              +150 this week
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recent Earnings
            </CardTitle>
            <CardDescription>Your latest coin rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +{activity.coins}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Redeemable Rewards */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Redeem Rewards
            </CardTitle>
            <CardDescription>Use your coins to unlock special benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {redeemableRewards.map((reward) => {
              const Icon = reward.icon;
              const canAfford = totalCoins >= reward.coins;
              return (
                <div
                  key={reward.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                    canAfford
                      ? 'border-primary/30 hover:border-primary hover:shadow-warm bg-primary/5'
                      : 'border-border opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'rounded-lg p-2',
                        canAfford ? 'bg-gradient-primary' : 'bg-muted'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', canAfford ? 'text-white' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{reward.name}</p>
                      <p className="text-xs text-muted-foreground">{reward.coins} coins</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={canAfford ? 'default' : 'outline'}
                    disabled={!canAfford}
                    className={canAfford ? 'bg-gradient-primary text-white' : ''}
                  >
                    Redeem
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* How to Earn */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>How to Earn More Coins</CardTitle>
          <CardDescription>Complete activities and stay active to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { action: 'Daily check-in', coins: '15', icon: Calendar },
              { action: 'Log vitals', coins: '10', icon: TrendingUp },
              { action: 'Join events', coins: '25', icon: Sparkles },
              { action: 'Shop purchases', coins: '50+', icon: ShoppingBag },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl border-2 bg-secondary/20 text-center hover:border-primary/50 transition-colors"
                >
                  <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold text-sm mb-1">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.coins} coins</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
