import type { Metadata, Viewport } from 'next';
import './globals.css';
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
        <NextIntlClientProvider locale={locale} messages={messages}>
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
