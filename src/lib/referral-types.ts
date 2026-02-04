'use client';

/** Reward types for referral tiers */
export type ReferralRewardType = 'monetary' | 'medical_test' | 'gift_coupon' | 'other';

export type ReferralTier = {
  threshold: number; // e.g. 5, 10, 20
  rewardType: ReferralRewardType;
  rewardDescription: string; // e.g. "Rs 500", "Free health checkup", "Children's gift voucher"
};

export type ReferralConfig = {
  tiers: ReferralTier[];
  enabled?: boolean;
  updatedAt?: { _seconds: number };
};

export type ReferralRecord = {
  referrerId: string;
  refereeId: string;
  refereeEmail?: string;
  createdAt: { _seconds: number } | unknown;
};

export const REFERRAL_REWARD_TYPES: { value: ReferralRewardType; label: string }[] = [
  { value: 'monetary', label: 'Monetary (cash/UPI)' },
  { value: 'medical_test', label: 'Medical test / Health checkup' },
  { value: 'gift_coupon', label: 'Gift coupon (children/other)' },
  { value: 'other', label: 'Other' },
];
