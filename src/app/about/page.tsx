import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'About | ElderLink — Your Happiness Club',
  description: 'Learn about ElderLink, India’s trusted digital companion for seniors and their families.',
};

export default function AboutPage() {
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
        <h1 className="mb-6 text-4xl font-bold tracking-tight">About ElderLink</h1>
        <p className="mb-4 text-lg text-muted-foreground">
          ElderLink is India’s most trusted digital companion for seniors and their families. We help
          older adults stay healthy, connected, and independent while giving families peace of mind.
        </p>
        <p className="mb-6 text-muted-foreground">
          Our platform brings together health tracking, medication reminders, community events,
          tours, rewards, and emergency support — all designed with seniors in mind. We support
          English, Hindi, Telugu, Tamil, Kannada, and Malayalam so more families across India can
          benefit.
        </p>
        <Button asChild>
          <Link href="/">Explore ElderLink</Link>
        </Button>
      </main>

      <footer className="border-t bg-background/50 py-6">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 px-4 text-sm text-muted-foreground sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} ElderLink. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/help" className="hover:text-primary">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
