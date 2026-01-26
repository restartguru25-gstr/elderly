'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Gift, Star, ArrowRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const membershipPlans = [
  {
    id: 'discovery',
    name: 'Discovery',
    price: 999,
    originalPrice: 3999,
    period: 'per year',
    icon: Sparkles,
    gradient: 'from-blue-400 to-cyan-500',
    features: [
      'Khyaal Club Membership Card',
      'Online event access - UNLIMITED',
      'Earn Khyaal Coins on Khyaal Shop purchases - 1X',
      'Earn Khyaal Coins on online events - 1X',
      'Rewards worth ₹1L+',
    ],
    popular: false,
  },
  {
    id: 'experia',
    name: 'Experia',
    price: 1499,
    originalPrice: 5999,
    period: 'per year',
    icon: Star,
    gradient: 'from-primary to-accent',
    features: [
      'Everything in Discovery',
      'Khyaal Smart Payment Card',
      'Earn Khyaal Coins on adding money to Smart Payment Card',
      'Earn Khyaal Coins on Khyaal Shop purchases - 2X',
      'Earn Khyaal Coins on online events - 2X',
      'Priority customer support',
    ],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime (5 Yrs)',
    price: 4995,
    originalPrice: 19995,
    period: 'one-time',
    icon: Crown,
    gradient: 'from-yellow-400 to-orange-500',
    features: [
      'Everything in Experia',
      'Lifetime access (5 years)',
      'Best value - Save 75%',
      'Exclusive lifetime member badge',
      'Early access to new features',
      'VIP event invitations',
    ],
    popular: false,
  },
];

export default function MembershipPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">
          Join the <span className="text-gradient-primary">ElderLink Club</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore different plans & choose the best that suits your needs. 
          Get unlimited access, earn rewards, and enjoy exclusive benefits.
        </p>
      </div>

      {/* Membership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {membershipPlans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative border-2 overflow-hidden transition-all duration-300',
                plan.popular
                  ? 'border-primary shadow-warm scale-105 md:scale-110'
                  : 'hover:border-primary/50 hover:shadow-soft-lg'
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-primary text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} p-4 w-fit mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold">₹{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground line-through">
                      ₹{plan.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <CardDescription className="mt-1">{plan.period}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  className={cn(
                    'w-full mt-6',
                    plan.popular && 'bg-gradient-primary text-white hover:opacity-90'
                  )}
                  size="lg"
                >
                  Buy Membership
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Be a ElderLink Club Member & get
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Unlimited access to ElderLink app',
              'Best deals on ElderLink Tours',
              'Super discounts on ElderLink Store',
              'A chance to WIN ElderLink Digi-Gold everyday',
              'FREE entry in ElderLink 50above50',
              'Earn twice the usual ElderLink coins',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
