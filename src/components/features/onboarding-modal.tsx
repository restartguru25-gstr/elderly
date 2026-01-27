'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';
import { HeartPulse, Users, LayoutDashboard, Sparkles } from 'lucide-react';

const slides = [
  {
    icon: Sparkles,
    title: 'Welcome to ElderLink',
    description: 'Your digital companion for health, family, and community. We’re glad you’re here.',
  },
  {
    icon: LayoutDashboard,
    title: 'Your dashboard',
    description: 'Track vitals, medications, book telemedicine, join events, and manage everything in one place.',
  },
  {
    icon: Users,
    title: 'Stay connected',
    description: 'Link with family so they can support you. Share your invite code from the Family page.',
  },
  {
    icon: HeartPulse,
    title: "You're all set",
    description: 'Explore the app at your pace. Use the Help center or FAQ if you need a hand.',
  },
];

export function OnboardingModal() {
  const { show, complete } = useOnboarding();
  const [step, setStep] = useState(0);

  const isLast = step === slides.length - 1;
  const Icon = slides[step].icon;

  const handleNext = () => {
    if (isLast) complete();
    else setStep((s) => s + 1);
  };

  const handleSkip = () => complete();

  if (!show) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          handleSkip();
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle>{slides[step].title}</DialogTitle>
          <DialogDescription>{slides[step].description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-1 py-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i === step ? 'bg-primary' : 'bg-muted'
              }`}
              aria-hidden
            />
          ))}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={handleSkip}>
            Skip
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleNext}>
            {isLast ? 'Get started' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
