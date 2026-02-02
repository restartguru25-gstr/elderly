'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle, Trophy } from 'lucide-react';
import { HealthCheckinGate } from '@/components/features/health-checkin-gate';
import { getQuiz, getQuizQuestions } from '@/lib/quiz-actions';
import { useFirestore } from '@/firebase';
import type { QuizQuestion } from '@/lib/quiz-types';

export default function QuizPlayPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const firestore = useFirestore();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<(QuizQuestion & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!firestore || !quizId) return;
    (async () => {
      const [q, qs] = await Promise.all([
        getQuiz(firestore, quizId),
        getQuizQuestions(firestore, quizId),
      ]);
      setQuiz(q);
      setQuestions(qs || []);
      setLoading(false);
    })();
  }, [firestore, quizId]);

  const handleAnswer = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const q = questions[currentIndex];
    if (q && optionIndex === q.correctIndex) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      }
    }, 800);
  };

  const hasSponsorBrand = !!(quiz?.sponsorBrandName || quiz?.sponsorBrandImageUrl);
  const SponsorBrand = () =>
    hasSponsorBrand ? (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2">
        {quiz?.sponsorBrandImageUrl && (
          <img
            src={quiz.sponsorBrandImageUrl}
            alt={quiz?.sponsorBrandName || 'Sponsor'}
            className="h-10 w-10 rounded object-contain"
          />
        )}
        {quiz?.sponsorBrandName && (
          <span className="text-sm font-medium text-muted-foreground">{quiz.sponsorBrandName}</span>
        )}
      </div>
    ) : null;

  const content = (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/quizzes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold truncate">{quiz?.title || 'Quiz'}</h1>
        </div>
        <SponsorBrand />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : !quiz ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Quiz not found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/quizzes">Back to Quizzes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No questions in this quiz yet.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/quizzes">Back to Quizzes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : finished ? (
        <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="py-12 text-center">
            {hasSponsorBrand && (
              <div className="mb-4 flex justify-center">
                <SponsorBrand />
              </div>
            )}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-xl text-muted-foreground mb-6">
              You got {score} out of {questions.length} correct.
            </p>
            <Button asChild>
              <Link href="/dashboard/quizzes">Back to Quizzes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <SponsorBrand />
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <h2
              className="text-2xl font-bold sm:text-3xl"
              style={{ fontSize: 'clamp(1.25rem, 4vw, 1.875rem)' }}
            >
              {questions[currentIndex]?.questionText}
            </h2>
            <div className="grid gap-4">
              {questions[currentIndex]?.options.map((opt, i) => (
                <Button
                  key={i}
                  size="lg"
                  variant={selected === i ? 'default' : 'outline'}
                  className={`min-h-[56px] justify-start text-left text-lg ${
                    selected !== null && i === questions[currentIndex]?.correctIndex
                      ? 'border-green-500 bg-green-500/10 text-green-700'
                      : ''
                  }`}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                >
                  {selected === i && (
                    <CheckCircle className="mr-3 h-5 w-5 shrink-0" />
                  )}
                  {opt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <HealthCheckinGate active={true}>
      {content}
    </HealthCheckinGate>
  );
}
