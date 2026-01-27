'use client';

import { useTranslations } from 'next-intl';

/**
 * Skip-to-content link for keyboard and screen reader users.
 * Visually hidden off-screen until focused; moves focus to #main-content.
 */
export function SkipToContent() {
  const t = useTranslations('common');
  return (
    <a
      href="#main-content"
      className="fixed left-0 top-0 z-[100] -translate-x-full rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform focus:left-4 focus:top-4 focus:translate-x-0 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {t('skipToContent')}
    </a>
  );
}
