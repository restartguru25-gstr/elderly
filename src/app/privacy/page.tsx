import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | ElderLink — Your Happiness Club',
  description: 'ElderLink privacy policy. How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
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
        <h1 className="mb-6 text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mb-6 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">1. Information we collect</h2>
            <p>
              We collect information you provide when you sign up, use our services, or contact us.
              This may include your name, email, phone number, health-related data you choose to
              log, and usage information to improve our app.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">2. How we use it</h2>
            <p>
              We use your information to deliver and improve ElderLink, personalize your
              experience, send important updates, and keep the platform secure. We do not sell your
              personal data.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">3. Data security</h2>
            <p>
              We use industry-standard practices to protect your data. Health and sensitive
              information is stored securely and accessed only as needed to provide our services.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">4. Your rights</h2>
            <p>
              You can access, update, or request deletion of your data through your account
              settings or by contacting us. We will respond to such requests in line with
              applicable law.
            </p>
          </section>
          <p className="pt-4">
            For questions about this policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
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
            <Link href="/terms" className="hover:text-primary">Terms</Link>
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
