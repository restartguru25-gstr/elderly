'use client';

import { useMemo, useState, createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getLinkedUserIds, getLinkedProfiles } from '@/lib/family-linking';

export type LinkedSenior = {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type GuardianContextType = {
  linkedSeniors: LinkedSenior[];
  selectedSeniorId: string | null;
  setSelectedSeniorId: (id: string | null) => void;
  selectedSenior: LinkedSenior | null;
  isLoading: boolean;
  refreshLinked: () => Promise<void>;
};

const GuardianContext = createContext<GuardianContextType | null>(null);

export function GuardianProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedSeniorId, setSelectedSeniorId] = useState<string | null>(null);
  const [linkedSeniors, setLinkedSeniors] = useState<LinkedSenior[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc(userDocRef);

  const loadLinked = useCallback(async () => {
    if (!user || !firestore) {
      setLinkedSeniors([]);
      setIsLoading(false);
      return;
    }
    if (userProfile?.userType !== 'guardian') {
      setLinkedSeniors([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const ids = await getLinkedUserIds(firestore, user.uid);
      const profiles = await getLinkedProfiles(firestore, ids);
      const seniors = profiles
        .filter((p) => p.userType === 'senior')
        .map((p) => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, phone: p.phone }));
      setLinkedSeniors(seniors);
    } catch (e) {
      console.error('Error loading linked seniors:', e);
      setLinkedSeniors([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, firestore, userProfile?.userType]);

  useEffect(() => {
    loadLinked();
  }, [loadLinked]);

  useEffect(() => {
    if (linkedSeniors.length === 0) {
      setSelectedSeniorId(null);
      return;
    }
    setSelectedSeniorId((prev) => {
      if (!prev || !linkedSeniors.some((s) => s.id === prev)) return linkedSeniors[0]!.id;
      return prev;
    });
  }, [linkedSeniors]);

  const selectedSenior = useMemo(
    () => linkedSeniors.find((s) => s.id === selectedSeniorId) ?? null,
    [linkedSeniors, selectedSeniorId]
  );

  const value = useMemo(
    () => ({
      linkedSeniors,
      selectedSeniorId,
      setSelectedSeniorId,
      selectedSenior,
      isLoading,
      refreshLinked: loadLinked,
    }),
    [linkedSeniors, selectedSeniorId, selectedSenior, isLoading, loadLinked]
  );

  return <GuardianContext.Provider value={value}>{children}</GuardianContext.Provider>;
}

export function useLinkedSenior() {
  const ctx = useContext(GuardianContext);
  return ctx ?? {
    linkedSeniors: [],
    selectedSeniorId: null,
    setSelectedSeniorId: () => {},
    selectedSenior: null,
    isLoading: false,
    refreshLinked: async () => {},
  };
}
