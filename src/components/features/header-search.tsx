'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { Search, X, Users, Briefcase, FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { useFirestore, useUser } from '@/firebase';
import { makeSearchTokens } from '@/lib/search-tokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Forum = { id: string; name: string; description: string };
type Skill = { id: string; title: string; category: string; description: string };
type MedicalDoc = { id: string; fileName: string; fileType: string; fileUrl: string };

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
    limit(5)
  );
  const skillsQ = query(
    collection(firestore, 'skillListings'),
    where('searchTokens', 'array-contains-any', t),
    limit(5)
  );

  const forumsSnapP = getDocs(forumsQ);
  const skillsSnapP = getDocs(skillsQ);

  const medicalDocsSnapP = userId
    ? getDocs(
        query(
          collection(firestore, 'users', userId, 'medical_docs'),
          where('searchTokens', 'array-contains-any', t),
          limit(5)
        )
      )
    : Promise.resolve(null);

  const [forumsSnap, skillsSnap, medicalSnap] = await Promise.all([
    forumsSnapP,
    skillsSnapP,
    medicalDocsSnapP,
  ]);

  const forums = forumsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Forum, 'id'>) }));
  const skills = skillsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Skill, 'id'>) }));
  const medicalDocs = medicalSnap
    ? medicalSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MedicalDoc, 'id'>) }))
    : [];

  return { forums, skills, medicalDocs };
}

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const firestore = useFirestore();
  const { user } = useUser();
  const tokens = useMemo(() => makeSearchTokens(q), [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['header-search', user?.uid ?? null, tokens.join('|')],
    queryFn: () =>
      runSearch({
        firestore,
        userId: user?.uid ?? null,
        tokens,
      }),
    enabled: open && tokens.length >= 1,
  });

  const handleClose = useCallback(() => {
    setOpen(false);
    setQ('');
  }, []);

  const hasResults = data && (data.forums.length > 0 || data.skills.length > 0 || data.medicalDocs.length > 0);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search forums, skills, documents..."
                className="pl-9 pr-9"
                autoFocus
              />
              {q && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setQ('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="px-4 pb-4">
              {tokens.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </p>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !hasResults ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No results found for &quot;{q}&quot;
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Forums */}
                  {data.forums.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        <Users className="h-3 w-3" />
                        Community Forums
                      </div>
                      <div className="space-y-1">
                        {data.forums.map((f) => (
                          <Link
                            key={f.id}
                            href={`/dashboard/community/${f.id}`}
                            onClick={handleClose}
                            className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium text-sm">{f.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{f.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {data.skills.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        <Briefcase className="h-3 w-3" />
                        Skills
                      </div>
                      <div className="space-y-1">
                        {data.skills.map((s) => (
                          <Link
                            key={s.id}
                            href="/dashboard/skills-marketplace"
                            onClick={handleClose}
                            className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium text-sm">{s.title}</div>
                            <div className="text-xs text-muted-foreground">{s.category}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medical Docs */}
                  {data.medicalDocs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        <FileText className="h-3 w-3" />
                        Medical Records
                      </div>
                      <div className="space-y-1">
                        {data.medicalDocs.map((d) => (
                          <a
                            key={d.id}
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleClose}
                            className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium text-sm">{d.fileName}</div>
                            <div className="text-xs text-muted-foreground">{d.fileType}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
