'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuizzesPage() {
  const firestore = useFirestore();
  const quizzesQuery = useMemoFirebase(
    () =>
      query(
        collection(firestore, 'quizzes'),
        where('status', '==', 'live'),
        orderBy('quizDate', 'desc'),
        limit(20)
      ),
    [firestore]
  );
  const { data: quizzes, isLoading } = useCollection(quizzesQuery);

  const quizList = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.map((q: any) => ({ id: q.id, ...q }));
  }, [quizzes]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">
          ElderLink <span className="text-gradient-primary">Quizzes</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Knowledge, fun, and awareness quizzes. Complete a quick daily health check-in before each quiz.
        </p>
      </div>

      {isLoading && quizList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 grid-mobile-fix w-full">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !quizList || quizList.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No quizzes available yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              New quizzes will appear here soon. Check back later for fun knowledge and awareness quizzes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 grid-mobile-fix w-full">
          {quizList.map((quiz: any) => (
            <Link key={quiz.id} href={`/dashboard/quizzes/${quiz.id}`}>
              <Card className="h-full border-2 transition-all hover:border-primary hover:shadow-warm overflow-hidden">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold line-clamp-2">{quiz.title}</h3>
                    <Badge variant={quiz.status === 'live' ? 'default' : 'secondary'}>
                      {quiz.status}
                    </Badge>
                  </div>
                  {(quiz.sponsorBrandName || quiz.sponsorName) && (
                    <div className="flex items-center gap-2 mb-2">
                      {quiz.sponsorBrandImageUrl && (
                        <img
                          src={quiz.sponsorBrandImageUrl}
                          alt={quiz.sponsorBrandName || quiz.sponsorName || 'Sponsor'}
                          className="h-6 w-6 rounded object-contain"
                        />
                      )}
                      <p className="text-sm text-muted-foreground">
                        by {quiz.sponsorBrandName || quiz.sponsorName}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto pt-4">
                    <Calendar className="h-4 w-4" />
                    <span>{quiz.questionCount} questions</span>
                  </div>
                  <Button className="mt-4 w-full" asChild>
                    <span>
                      Start Quiz
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
