'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Gift, Trophy, ArrowRight } from 'lucide-react';

const featureKeys = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'] as const;
const benefitKeys = ['benefit1', 'benefit2', 'benefit3', 'benefit4', 'benefit5', 'benefit6'] as const;

export default function MembershipPage() {
  const t = useTranslations('membership');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">
          <span className="text-gradient-primary">{t('joinClub')}</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Single Membership Card */}
      <div className="flex justify-center">
        <Card className="relative w-full max-w-md border-2 overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-warm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent p-4 w-fit mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{t('planName')}</CardTitle>
            <div className="mt-4">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold">₹99</span>
                <span className="text-muted-foreground">/ {t('perYear')}</span>
              </div>
              <CardDescription className="mt-1">{t('simpleAffordable')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {featureKeys.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm flex-1">{t(key)}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="default"
              className="w-full mt-6 bg-gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              {tCommon('buyMembership')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            {t('benefitsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grid-mobile-fix w-full">
            {benefitKeys.map((key) => (
              <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{t(key)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
