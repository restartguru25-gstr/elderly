import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact | ElderLink — Your Happiness Club',
  description: 'Get in touch with ElderLink. We’re here to help seniors and families.',
};

export default function ContactPage() {
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

      <main id="main-content" className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="mb-8 text-muted-foreground">
          Have a question or need support? Reach out and we’ll get back to you soon.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-2">
            <CardContent className="p-6">
              <Mail className="mb-3 h-8 w-8 text-primary" />
              <h2 className="mb-1 font-semibold">Email</h2>
              <a
                href="mailto:support@elderlink.in"
                className="text-primary hover:underline"
              >
                support@elderlink.in
              </a>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="p-6">
              <MessageCircle className="mb-3 h-8 w-8 text-primary" />
              <h2 className="mb-1 font-semibold">In-app support</h2>
              <p className="text-sm text-muted-foreground">
                Log in and use the Support option in your profile menu for help.
              </p>
            </CardContent>
          </Card>
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
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/help" className="hover:text-primary">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
