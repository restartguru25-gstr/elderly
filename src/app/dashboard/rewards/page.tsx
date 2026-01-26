'use client';

import { RewardsCoins } from '@/components/features/rewards-coins';

export default function RewardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">
          Rewards & <span className="text-gradient-primary">Coins</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Earn coins by staying active, log your vitals, join events, and redeem amazing rewards!
        </p>
      </div>
      <RewardsCoins totalCoins={1250} />
    </div>
  );
}
