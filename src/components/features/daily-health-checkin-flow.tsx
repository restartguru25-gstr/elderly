'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  hasCompletedTodayCheckin,
  getTodaysQuestions,
  submitHealthCheckinAnswers,
  skipHealthCheckin,
  hasGivenHealthConsent,
  getTodayDateString,
} from '@/lib/health-checkin-actions';
import type { HealthQuestion } from '@/lib/health-checkin-types';
import { useFirestore, useUser } from '@/firebase';
import { Loader2, Heart, Smile } from 'lucide-react';

const CONSENT_TEXT =
  'These questions are for general wellness understanding only and do not replace medical advice.';

type Step = 'loading' | 'consent' | 'question' | 'thankyou' | 'done';

type Props = {
  onComplete: () => void;
};

export function DailyHealthCheckinFlow({ onComplete }: Props) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [step, setStep] = useState<Step>('loading');
  const [questions, setQuestions] = useState<HealthQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !firestore) return;
    let cancelled = false;
    (async () => {
      const completed = await hasCompletedTodayCheckin(firestore, user.uid);
      if (cancelled) return;
      if (completed) {
        setStep('done');
        onComplete();
        return;
      }
      const qList = await getTodaysQuestions(firestore, user.uid);
      const hasConsent = await hasGivenHealthConsent(firestore, user.uid);
      if (cancelled) return;
      setNeedsConsent(!hasConsent);
      if (qList.length === 0) {
        setStep('done');
        onComplete();
        return;
      }
      setQuestions(qList);
      setStep(!hasConsent ? 'consent' : 'question');
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, firestore, onComplete]);

  const handleConsentContinue = () => {
    setStep('question');
  };

  const handleAnswer = (answer: string) => {
    const q = questions[currentIndex];
    if (!q) return;
    const newAnswers = [...answers, { questionId: q.id, answer }];
    setAnswers(newAnswers);
    if (currentIndex + 1 >= questions.length) {
      handleSubmit(newAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async (finalAnswers: { questionId: string; answer: string }[]) => {
    if (!user || !firestore || finalAnswers.length === 0) return;
    setIsSubmitting(true);
    try {
      await submitHealthCheckinAnswers(firestore, user.uid, finalAnswers);
      setStep('thankyou');
    } catch {
      setStep('question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user || !firestore) return;
    setIsSubmitting(true);
    try {
      await skipHealthCheckin(firestore, user.uid);
      setStep('thankyou');
    } catch {
      setStep(questions.length > 0 ? 'question' : 'done');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThankYouContinue = () => {
    setStep('done');
    onComplete();
  };

  if (step === 'loading' || step === 'done') {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        {step === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
      </div>
    );
  }

  if (step === 'consent') {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-6 sm:p-10">
        <div className="rounded-full bg-primary/10 p-4">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Daily Health Check-in</h2>
        <p className="max-w-md text-center text-lg text-muted-foreground" style={{ lineHeight: 1.7 }}>
          {CONSENT_TEXT}
        </p>
        <Button size="lg" className="min-h-[56px] px-10 text-lg" onClick={handleConsentContinue}>
          I Understand, Continue
        </Button>
      </div>
    );
  }

  if (step === 'question') {
    const q = questions[currentIndex];
    if (!q) return null;
    const opts = q.options && q.options.length > 0 ? q.options : getDefaultOptions(q.type);

    return (
      <div className="flex flex-col gap-8 p-6 sm:p-10">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <h2
          className="text-center text-2xl font-bold leading-tight sm:text-3xl"
          style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
        >
          {q.questionText}
        </h2>
        <div className="flex flex-col gap-4">
          {opts.map((opt) => (
            <Button
              key={opt}
              size="lg"
              variant="outline"
              className="min-h-[56px] border-2 text-lg font-semibold"
              onClick={() => handleAnswer(opt)}
              disabled={isSubmitting}
            >
              {opt}
            </Button>
          ))}
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
            Skip for today
          </Button>
        </div>
        {isSubmitting && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    );
  }

  if (step === 'thankyou') {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-6 sm:p-10">
        <div className="rounded-full bg-green-500/20 p-4">
          <Smile className="h-14 w-14 text-green-600" />
        </div>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Thank You!</h2>
        <p className="max-w-md text-center text-lg text-muted-foreground">
          Your responses help us understand your wellness better. You&apos;re all set for today.
        </p>
        <Button size="lg" className="min-h-[56px] px-10 text-lg" onClick={handleThankYouContinue}>
          Continue
        </Button>
      </div>
    );
  }

  return null;
}

function getDefaultOptions(type: string): string[] {
  switch (type) {
    case 'yes_no_sometimes':
      return ['Yes', 'No', 'Sometimes'];
    case 'emoji_scale':
      return ['🙂', '😐', '🙁'];
    default:
      return ['Option 1', 'Option 2', 'Option 3'];
  }
}
