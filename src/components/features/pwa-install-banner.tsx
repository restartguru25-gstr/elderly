'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

const PWA_INSTALL_DISMISSED = 'elderlink-pwa-install-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
};

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(typeof localStorage !== 'undefined' && localStorage.getItem(PWA_INSTALL_DISMISSED) === '1');
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as unknown as BeforeInstallPromptEvent;
      evt.preventDefault();
      setDeferredPrompt(evt);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
    setDismissed(true);
    try { localStorage.setItem(PWA_INSTALL_DISMISSED, '1'); } catch { /* ignore */ }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(PWA_INSTALL_DISMISSED, '1'); } catch { /* ignore */ }
  };

  if (!mounted || dismissed || !deferredPrompt) return null;

  return (
    <div
      role="region"
      aria-label="Install app"
      className="flex items-center justify-between gap-4 border-b bg-primary/10 px-4 py-2 text-sm"
    >
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-primary" aria-hidden />
        <span>Install ElderLink on your device for a better experience.</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
