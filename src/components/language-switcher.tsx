'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const locales = [
  { code: 'en' as const, labelKey: 'locale.en' },
  { code: 'hi' as const, labelKey: 'locale.hi' },
  { code: 'te' as const, labelKey: 'locale.te' },
  { code: 'ta' as const, labelKey: 'locale.ta' },
  { code: 'kn' as const, labelKey: 'locale.kn' },
  { code: 'ml' as const, labelKey: 'locale.ml' },
] as const;

function setLocaleCookie(code: string) {
  document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setLocaleCookie(code);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className={cn('relative', className)} ref={ref}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Choose language"
      >
        <Globe className="h-4 w-4" />
      </Button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] rounded-xl border-2 bg-background py-1 shadow-lg"
          role="listbox"
        >
          {locales.map(({ code, labelKey }) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                locale === code && 'bg-primary/10 font-medium text-primary'
              )}
              onClick={() => handleSelect(code)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
