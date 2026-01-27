'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ensureSeniorLinkCode,
  getLinkedProfiles,
  getLinkedUserIds,
  linkGuardianToSeniorByCode,
} from '@/lib/family-linking';
import { Copy, Link2, Loader2, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Profile = { id: string; firstName?: string; lastName?: string; userType?: string };

export default function FamilyPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const t = useTranslations('family');

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkedList, setLinkedList] = useState<Profile[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const isSenior = userProfile?.userType === 'senior';
  const isGuardian = userProfile?.userType === 'guardian';

  const loadLinkCode = useCallback(async () => {
    if (!user || !firestore || !isSenior) return;
    setCodeLoading(true);
    try {
      const code = await ensureSeniorLinkCode(firestore, user.uid);
      setLinkCode(code);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('codeError'),
        description: e instanceof Error ? e.message : t('codeErrorDesc'),
      });
    } finally {
      setCodeLoading(false);
    }
  }, [user, firestore, isSenior, toast, t]);

  const loadLinked = useCallback(async () => {
    if (!user || !firestore) return;
    setListLoading(true);
    try {
      const ids = await getLinkedUserIds(firestore, user.uid);
      const profiles = await getLinkedProfiles(firestore, ids);
      setLinkedList(profiles);
    } catch {
      setLinkedList([]);
    } finally {
      setListLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    if (isSenior) loadLinkCode();
  }, [isSenior, loadLinkCode]);

  useEffect(() => {
    loadLinked();
  }, [loadLinked]);

  const handleCopy = async () => {
    if (!linkCode) return;
    try {
      await navigator.clipboard.writeText(linkCode);
      toast({ title: t('copied'), description: t('copiedDesc') });
    } catch {
      toast({ variant: 'destructive', title: t('copyFailed') });
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !linkInput.trim()) return;
    setLinkLoading(true);
    try {
      const { seniorName } = await linkGuardianToSeniorByCode(
        firestore,
        linkInput.trim(),
        user.uid
      );
      const name = seniorName ?? 'Your parent';
      toast({
        title: t('linked'),
        description: t('linkedDesc', { name }),
      });
      setLinkInput('');
      loadLinked();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('linkFailed'),
        description: e instanceof Error ? e.message : t('linkFailedDesc'),
      });
    } finally {
      setLinkLoading(false);
    }
  };

  const displayName = (p: Profile) =>
    [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || p.id.slice(0, 8);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!isSenior && !isGuardian) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <Card className="border-2">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t('roleRequired')}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t('roleRequiredDesc')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="max-w-2xl text-muted-foreground">
          {isSenior ? t('subtitleSenior') : t('subtitleGuardian')}
        </p>
      </div>

      {isSenior && (
        <Card className="border-2 shadow-soft-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {t('yourCode')}
            </CardTitle>
            <CardDescription>{t('yourCodeDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {codeLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('generating')}</span>
              </div>
            ) : linkCode ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3 font-mono text-xl font-bold tracking-widest text-foreground">
                  {linkCode}
                </div>
                <Button type="button" variant="outline" size="lg" onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('copy')}
                </Button>
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground">{t('shareCodeHint')}</p>
          </CardContent>
        </Card>
      )}

      {isGuardian && (
        <Card className="border-2 shadow-soft-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              {t('linkWithParent')}
            </CardTitle>
            <CardDescription>{t('linkWithParentDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLink} className="flex flex-wrap gap-3">
              <Input
                placeholder={t('codePlaceholder')}
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="max-w-xs font-mono uppercase"
                disabled={linkLoading}
              />
              <Button type="submit" disabled={linkLoading || !linkInput.trim()}>
                {linkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('link')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {isSenior ? t('linkedFamily') : t('linkedSeniors')}
          </CardTitle>
          <CardDescription>
            {isSenior ? t('linkedFamilyDesc') : t('linkedSeniorsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('loading')}</span>
            </div>
          ) : linkedList.length === 0 ? (
            <p className="text-muted-foreground">{t('noneLinked')}</p>
          ) : (
            <ul className="space-y-3">
              {linkedList.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border-2 bg-muted/30 px-4 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{displayName(p)}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.userType === 'senior' ? t('senior') : t('guardian')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
