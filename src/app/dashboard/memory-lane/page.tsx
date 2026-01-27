'use client';

import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ImageIcon, Sparkles, Share2, Heart, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const PhotoRestorer = dynamic(
  () => import('@/components/features/photo-restorer').then((m) => ({ default: m.PhotoRestorer })),
  {
    loading: () => (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    ),
    ssr: false,
  }
);

const BADGE_DELAY_MS = 80;
const TIP_DELAY_MS = 100;

export default function MemoryLanePage() {
  const t = useTranslations('memoryLane');

  const badges = [
    { icon: Sparkles, key: 'oneClickRestore' as const },
    { icon: Heart, key: 'preserveForever' as const },
    { icon: Share2, key: 'shareWithFamily' as const },
  ] as const;

  const tips = [
    { emoji: '📷', titleKey: 'tip1Title' as const, descKey: 'tip1Desc' as const },
    { emoji: '✨', titleKey: 'tip2Title' as const, descKey: 'tip2Desc' as const },
    { emoji: '👨‍👩‍👧‍👦', titleKey: 'tip3Title' as const, descKey: 'tip3Desc' as const },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Story-style header — dynamic i18n + staggered animations */}
      <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 sm:p-10">
        <div className="relative z-10">
          <div
            className={cn(
              'flex items-center gap-2 mb-4 opacity-0 animate-fade-in-up'
            )}
            style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
          >
            <div className="rounded-xl bg-gradient-primary p-2">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-primary">{t('badge')}</span>
          </div>
          <h1
            className={cn(
              'mb-3 text-4xl font-bold text-foreground opacity-0 animate-fade-in-up'
            )}
            style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}
          >
            {t('title')}
          </h1>
          <p
            className={cn(
              'max-w-2xl text-lg text-muted-foreground mb-6 opacity-0 animate-fade-in-up'
            )}
            style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
          >
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap gap-3">
            {badges.map(({ icon: Icon, key }, i) => (
              <div
                key={key}
                className={cn(
                  'flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 border opacity-0 animate-fade-in-up'
                )}
                style={{
                  animationDelay: `${180 + i * BADGE_DELAY_MS}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery-style restore card */}
      <Card className="border-2 shadow-soft-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {t('cardTitle')}
              </CardTitle>
              <CardDescription>{t('cardDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PhotoRestorer />
        </CardContent>
      </Card>

      {/* Tips — dynamic i18n + staggered animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map(({ emoji, titleKey, descKey }, i) => (
          <Card
            key={titleKey}
            variant="bordered"
            className={cn(
              'hover:border-primary/50 transition-colors opacity-0 animate-fade-in-up'
            )}
            style={{
              animationDelay: `${i * TIP_DELAY_MS}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <CardContent className="pt-6">
              <div className="rounded-xl bg-primary/10 w-fit p-3 mb-4">
                <span className="text-2xl">{emoji}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(descKey)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
