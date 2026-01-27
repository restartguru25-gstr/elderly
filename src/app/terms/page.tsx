import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | ElderLink — Your Happiness Club',
  description: 'ElderLink terms of service and conditions of use.',
};

export default function TermsPage() {
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
        <h1 className="mb-6 text-4xl font-bold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mb-6 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">1. Acceptance</h2>
            <p>
              By using ElderLink, you agree to these terms. If you do not agree, please do not use
              our services.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">2. Use of the service</h2>
            <p>
              ElderLink is provided for personal, non-commercial use. You agree to use it lawfully,
              to keep your account secure, and not to misuse or harm the platform or other users.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">3. Health information</h2>
            <p>
              Health-related features are for convenience and support only. They do not replace
              professional medical advice. Always consult a healthcare provider for medical
              decisions.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">4. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of ElderLink after
              changes means you accept the updated terms.
            </p>
          </section>
          <p className="pt-4">
            For questions, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
          </p>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t bg-background/50 py-6">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 px-4 text-sm text-muted-foreground sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} ElderLink. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/help" className="hover:text-primary">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
