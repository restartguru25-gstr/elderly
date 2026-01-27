'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Contrast, Type, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

const TEXT_SIZE_KEY = 'elderlink-text-size';
const HIGH_CONTRAST_KEY = 'elderlink-high-contrast';

type TextSize = 'default' | 'large' | 'xlarge';

export function A11yToolbar() {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>('default');
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');

  useEffect(() => {
    setMounted(true);
    const hc = typeof window !== 'undefined' && localStorage.getItem(HIGH_CONTRAST_KEY) === 'true';
    const ts = (typeof window !== 'undefined' && localStorage.getItem(TEXT_SIZE_KEY)) as TextSize | null;
    setHighContrast(!!hc);
    setTextSize(ts && ['large', 'xlarge'].includes(ts) ? ts : 'default');
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    const html = document.documentElement;
    html.classList.toggle('high-contrast', highContrast);
    html.classList.remove('text-size-large', 'text-size-xlarge');
    if (textSize === 'large') html.classList.add('text-size-large');
    if (textSize === 'xlarge') html.classList.add('text-size-xlarge');
  }, [mounted, highContrast, textSize]);

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem(HIGH_CONTRAST_KEY, String(next));
  };

  const selectTextSize = (s: TextSize) => {
    setTextSize(s);
    localStorage.setItem(TEXT_SIZE_KEY, s);
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label={t('a11yOptions')}
        >
          <Contrast className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleHighContrast}>
          <Contrast className="mr-2 h-4 w-4" />
          High contrast
          {highContrast && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Text size
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => selectTextSize('default')}>
          Default {textSize === 'default' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectTextSize('large')}>
          Large {textSize === 'large' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectTextSize('xlarge')}>
          X-Large {textSize === 'xlarge' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
