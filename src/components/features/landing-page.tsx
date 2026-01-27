'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { LoginDialog } from './login-dialog';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  HeartPulse,
  Users,
  Pill,
  Siren,
  Stethoscope,
  Image,
  Sparkles,
  TrendingUp,
  Award,
  ArrowRight,
  Play,
  Menu,
} from 'lucide-react';

const featureKeys = ['health', 'family', 'meds', 'emergency', 'telemedicine', 'memory'] as const;
const featureMeta = [
  { icon: HeartPulse, color: 'from-red-400 to-pink-500' },
  { icon: Users, color: 'from-blue-400 to-cyan-500' },
  { icon: Pill, color: 'from-green-400 to-emerald-500' },
  { icon: Siren, color: 'from-orange-400 to-red-500' },
  { icon: Stethoscope, color: 'from-purple-400 to-indigo-500' },
  { icon: Image, color: 'from-yellow-400 to-orange-500' },
];

const statsMeta = [
  { value: '10,000+', key: 'happySeniors' as const, icon: Users },
  { value: '50,000+', key: 'familiesConnected' as const, icon: HeartPulse },
  { value: '24/7', key: 'supportAvailable' as const, icon: Siren },
  { value: '100+', key: 'featuresAndTools' as const, icon: Sparkles },
];

const testimonials = [
  { name: 'Ramesh Kumar', location: 'Mumbai', text: 'ElderLink has been a blessing for our family. My mother feels more connected and independent.', role: 'Son' },
  { name: 'Kamala Devi', location: 'Delhi', text: 'I love how easy it is to track my medications and connect with my community. It makes me feel safe.', role: 'Senior Member' },
  { name: 'Priya Sharma', location: 'Bangalore', text: 'The emergency SOS feature gives me peace of mind knowing help is just one tap away.', role: 'Daughter' },
];

export function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('landing');
  const tFeat = useTranslations('landingFeatures');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo showTagline href="/" />
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <Button variant="ghost" asChild>
                <Link href="#features">{tCommon('features')}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#testimonials">{tCommon('stories')}</Link>
              </Button>
              <Button variant="outline" onClick={() => setLoginOpen(true)}>
                {tCommon('signIn')}
              </Button>
              <Button asChild className="bg-gradient-primary text-white hover:opacity-90">
                <Link href="/signup">{tCommon('getStarted')}</Link>
              </Button>
            </div>
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-4 mt-8">
                    <Button variant="ghost" asChild className="justify-start" onClick={() => setMobileMenuOpen(false)}>
                      <Link href="#features">{tCommon('features')}</Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start" onClick={() => setMobileMenuOpen(false)}>
                      <Link href="#testimonials">{tCommon('stories')}</Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { setLoginOpen(true); setMobileMenuOpen(false); }}>
                      {tCommon('signIn')}
                    </Button>
                    <Button asChild className="w-full bg-gradient-primary text-white hover:opacity-90" onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/signup">{tCommon('getStarted')}</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 sm:mb-6 inline-block rounded-full bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary">
              {t('badge')}
            </div>
            <h1 className="mb-4 sm:mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="text-gradient-primary">{t('heroTitle1')}</span>
              <br />
              <span className="text-foreground">{t('heroTitle2')}</span>
            </h1>
            <p className="mb-6 sm:mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
              {t('heroSubtitle')}
              <br className="hidden sm:block" />
              <span className="text-base sm:text-lg">{t('heroCare')}</span>
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-primary text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 text-white hover:opacity-90 h-auto"
                asChild
              >
                <Link href="/signup">
                  {tCommon('getStartedFree')}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto border-2"
                onClick={() => setLoginOpen(true)}
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {tCommon('watchDemo')}
              </Button>
            </div>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span>{t('trustedBy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span>{t('rating')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 sm:py-16 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {statsMeta.map((stat, index) => (
              <div
                key={stat.key}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-3 sm:mb-4 flex justify-center">
                  <div className="rounded-full bg-gradient-primary p-3 sm:p-4">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-muted-foreground">{t(`stats.${stat.key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 sm:mb-16 text-center">
            <h2 className="mb-3 sm:mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              {t('featuresTitle')}
              <br className="hidden sm:block" />
              <span className="text-gradient-primary">{t('featuresTitleHighlight')}</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
              {t('featuresSubtitle')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key, index) => {
              const meta = featureMeta[index];
              const Icon = meta.icon;
              return (
                <Card
                  key={key}
                  className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-warm animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${meta.color} p-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{tFeat(`${key}Title`)}</h3>
                    <p className="text-muted-foreground">{tFeat(`${key}Desc`)}</p>
                    <Button variant="ghost" className="mt-4 group-hover:text-primary" asChild>
                      <Link href="/signup">
                        {tCommon('exploreNow')}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-20 lg:py-32 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 sm:mb-16 text-center">
            <h2 className="mb-3 sm:mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              <span className="text-gradient-primary">{t('storiesTitle')}</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
              {t('storiesSubtitle')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 transition-all duration-300 hover:border-primary hover:shadow-soft-lg animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 text-4xl text-primary">"</div>
                  <p className="mb-6 text-muted-foreground">{testimonial.text}</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup">
                {tCommon('readAllStories')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 lg:py-32 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 sm:mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
              {t('ctaTitle')}
            </h2>
            <p className="mb-6 sm:mb-8 text-lg sm:text-xl opacity-90">
              {t('ctaSubtitle')}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto"
                asChild
              >
                <Link href="/signup">
                  {tCommon('getStartedFree')}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto"
                onClick={() => setLoginOpen(true)}
              >
                {tCommon('signIn')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4">
            <div>
              <Logo showTagline href="/" />
              <p className="mt-4 text-sm text-muted-foreground">
                {t('footerTagline')}
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">{t('footerFeatures')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary">{t('footerHealth')}</Link></li>
                <li><Link href="#features" className="hover:text-primary">{t('footerCommunity')}</Link></li>
                <li><Link href="#features" className="hover:text-primary">{t('footerSOS')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">{t('footerCompany')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">{t('footerAbout')}</Link></li>
                <li><Link href="/contact" className="hover:text-primary">{t('footerContact')}</Link></li>
                <li><Link href="/contact" className="hover:text-primary">{tCommon('support')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">{t('footerLegal')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">{t('footerPrivacy')}</Link></li>
                <li><Link href="/terms" className="hover:text-primary">{t('footerTerms')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            {t('copyright')}
          </div>
        </div>
      </footer>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
