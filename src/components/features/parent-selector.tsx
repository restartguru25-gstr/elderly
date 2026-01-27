'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLinkedSenior } from '@/hooks/use-linked-senior';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ParentSelector() {
  const { linkedSeniors, selectedSeniorId, setSelectedSeniorId, isLoading } = useLinkedSenior();
  const t = useTranslations('guardian');

  if (isLoading || linkedSeniors.length === 0) {
    return null;
  }

  if (linkedSeniors.length === 1) {
    const senior = linkedSeniors[0]!;
    const name = [senior.firstName, senior.lastName].filter(Boolean).join(' ').trim() || t('parent');
    return (
      <div className="flex items-center gap-2 rounded-lg border-2 border-primary/20 bg-primary/5 px-3 py-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{t('viewingFor')} {name}</span>
      </div>
    );
  }

  return (
    <Select value={selectedSeniorId || ''} onValueChange={setSelectedSeniorId}>
      <SelectTrigger className="w-full max-w-xs">
        <Users className="mr-2 h-4 w-4" />
        <SelectValue placeholder={t('selectParent')} />
      </SelectTrigger>
      <SelectContent>
        {linkedSeniors.map((senior) => {
          const name = [senior.firstName, senior.lastName].filter(Boolean).join(' ').trim() || t('parent');
          return (
            <SelectItem key={senior.id} value={senior.id}>
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
