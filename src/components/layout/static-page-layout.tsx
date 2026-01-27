import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ArrowLeft } from 'lucide-react';

export function StaticPageLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo showTagline href="/" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mb-8 text-muted-foreground">{description}</p>}
        {children}
      </main>

      <footer className="border-t bg-background/50 py-6">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 px-4 text-sm text-muted-foreground sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} ElderLink. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/help" className="hover:text-primary">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
