import type { Metadata, Viewport } from 'next';
import './globals.css';
import Script from 'next/script';
import { ClientOnlyToaster } from '@/components/ui/client-only-toaster';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase';
import { ErrorBoundary } from '@/components/error-boundary';
import { SkipToContent } from '@/components/skip-to-content';
import { WebVitalsReport } from '@/components/web-vitals-report';
import { OfflineBanner } from '@/components/features/offline-banner';
import { PWAInstallBanner } from '@/components/features/pwa-install-banner';
import { OfflineQueueProcessor } from '@/components/features/offline-queue-processor';
import { ChunkRecovery } from '@/components/features/chunk-recovery';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';

export const metadata: Metadata = {
  title: 'ElderLink — Your Happiness Club',
  description: "India's most trusted digital companion for seniors and their families. Care, even from afar.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://elderlink.in'),
  openGraph: {
    title: 'ElderLink — Your Happiness Club',
    description: "India's most trusted digital companion for seniors and their families. Care, even from afar.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ElderLink — Your Happiness Club',
    description: "India's most trusted digital companion for seniors and their families.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF7A00' },
    { media: '(prefers-color-scheme: dark)', color: '#FF7A00' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Modern PWA meta for non-Apple browsers */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* iOS PWA meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Poppins:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background prevent-pull-refresh')}>
        <Script id="elderlink-chunk-recovery" strategy="beforeInteractive">
          {`
(function () {
  try {
    var KEY = '__elderlink_chunk_recover_attempted__';
    function reloadOnce() {
      try {
        var attempted = sessionStorage.getItem(KEY) === '1';
        if (attempted) return;
        sessionStorage.setItem(KEY, '1');
      } catch (e) {}
      window.location.reload();
    }
    function looksLikeChunkCrash(msg) {
      if (!msg) return false;
      return (
        msg.indexOf('ChunkLoadError') !== -1 ||
        msg.indexOf('Loading chunk') !== -1 ||
        msg.indexOf("reading 'call'") !== -1 ||
        msg.indexOf('Cannot read properties of undefined (reading') !== -1 ||
        msg.indexOf('Unexpected token') !== -1 ||
        msg.indexOf('Invalid or unexpected token') !== -1
      );
    }
    window.addEventListener(
      'error',
      function (ev) {
        try {
          // Resource load errors (script/link) can come as Event with a target.
          var t = ev && (ev.target || ev.srcElement);
          var src = (t && (t.src || t.href)) ? String(t.src || t.href) : '';
          if (src && src.indexOf('/_next/') !== -1) {
            reloadOnce();
            return;
          }
          var m = ev && ev.message;
          if (looksLikeChunkCrash(m)) reloadOnce();
        } catch (e) {}
      },
      true
    );
    window.addEventListener('unhandledrejection', function (ev) {
      try {
        var r = ev && ev.reason;
        var m = (r && r.message) ? String(r.message) : String(r || '');
        if (looksLikeChunkCrash(m)) reloadOnce();
      } catch (e) {}
    });
  } catch (e) {}
})();
          `}
        </Script>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ChunkRecovery />
          <SkipToContent />
          <OfflineBanner />
          <PWAInstallBanner />
          <WebVitalsReport />
          <ReactQueryProvider>
            <FirebaseClientProvider>
              <SidebarProvider>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </SidebarProvider>
              <OfflineQueueProcessor />
              <ClientOnlyToaster />
            </FirebaseClientProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
