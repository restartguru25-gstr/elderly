'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { useFirestore, useUser } from '@/firebase';
import { makeSearchTokens } from '@/lib/search-tokens';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Forum = { name: string; description: string };
type Skill = { title: string; category: string; description: string };
type MedicalDoc = { fileName: string; fileType: string; fileUrl: string };

async function runSearch(opts: {
  firestore: ReturnType<typeof useFirestore>;
  userId: string | null;
  tokens: string[];
}) {
  const { firestore, userId, tokens } = opts;
  if (tokens.length === 0) {
    return { forums: [], skills: [], medicalDocs: [] };
  }

  const t = tokens.slice(0, 10);

  const forumsQ = query(
    collection(firestore, 'communityForums'),
    where('searchTokens', 'array-contains-any', t),
    limit(10)
  );
  const skillsQ = query(
    collection(firestore, 'skillListings'),
    where('searchTokens', 'array-contains-any', t),
    limit(10)
  );

  const forumsSnapP = getDocs(forumsQ);
  const skillsSnapP = getDocs(skillsQ);

  const medicalDocsSnapP = userId
    ? getDocs(
        query(
          collection(firestore, 'users', userId, 'medical_docs'),
          where('searchTokens', 'array-contains-any', t),
          limit(10)
        )
      )
    : Promise.resolve(null);

  const [forumsSnap, skillsSnap, medicalSnap] = await Promise.all([
    forumsSnapP,
    skillsSnapP,
    medicalDocsSnapP,
  ]);

  const forums = forumsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Forum) }));
  const skills = skillsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Skill) }));
  const medicalDocs = medicalSnap
    ? medicalSnap.docs.map((d) => ({ id: d.id, ...(d.data() as MedicalDoc) }))
    : [];

  return { forums, skills, medicalDocs };
}

export default function GlobalSearchPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [q, setQ] = useState('');
  const tokens = useMemo(() => makeSearchTokens(q), [q]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['global-search', user?.uid ?? null, tokens.join('|')],
    queryFn: () =>
      runSearch({
        firestore,
        userId: user?.uid ?? null,
        tokens,
      }),
    enabled: tokens.length >= 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Search community forums, skills, and your medical records.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to search…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={tokens.length === 0}>
          Search
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : tokens.length === 0 ? (
        <Card className="border-2">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Start typing to search.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>Forums matching your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.forums?.length ? (
                data.forums.map((f: any) => (
                  <Link key={f.id} href={`/dashboard/community/${f.id}`} className="block rounded-lg border p-3 hover:bg-primary/5">
                    <div className="font-semibold">{f.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{f.description}</div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No matches.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Listings matching your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.skills?.length ? (
                data.skills.map((s: any) => (
                  <Link key={s.id} href={`/dashboard/skills-marketplace`} className="block rounded-lg border p-3 hover:bg-primary/5">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.category}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{s.description}</div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No matches.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Medical records</CardTitle>
              <CardDescription>Your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!user ? (
                <div className="text-sm text-muted-foreground">Log in to search your documents.</div>
              ) : data?.medicalDocs?.length ? (
                data.medicalDocs.map((d: any) => (
                  <a
                    key={d.id}
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border p-3 hover:bg-primary/5"
                  >
                    <div className="font-semibold">{d.fileName}</div>
                    <div className="text-xs text-muted-foreground">{d.fileType}</div>
                  </a>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No matches.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

