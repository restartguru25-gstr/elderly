'use client';

export type OfflineActionType =
  | 'createVital'
  | 'logMedication'
  | 'createReminder'
  | 'submitFeedback';

export type OfflineAction =
  | {
      id: string;
      createdAt: number;
      userId: string;
      type: 'createVital';
      payload: { vital: { type: string; value: string } };
    }
  | {
      id: string;
      createdAt: number;
      userId: string;
      type: 'logMedication';
      payload: { medicationId: string; log: { taken: boolean; date: string } };
    }
  | {
      id: string;
      createdAt: number;
      userId: string;
      type: 'createReminder';
      payload: { seniorId: string; reminder: { fromGuardianId: string; fromGuardianName?: string; message: string } };
    }
  | {
      id: string;
      createdAt: number;
      userId: string;
      type: 'submitFeedback';
      payload: { feedback: { userId: string; email?: string; rating: number; comment: string; page?: string } };
    };

const KEY = 'elderlink-offline-queue-v1';

function readRaw(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineAction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(items: OfflineAction[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function listOfflineActions(): OfflineAction[] {
  return readRaw().sort((a, b) => a.createdAt - b.createdAt);
}

export function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'createdAt'>): OfflineAction {
  const full: OfflineAction = {
    ...(action as any),
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
  };
  const items = readRaw();
  items.push(full);
  writeRaw(items);
  return full;
}

export function removeOfflineAction(id: string) {
  const items = readRaw().filter((a) => a.id !== id);
  writeRaw(items);
}

export function clearOfflineQueue() {
  writeRaw([]);
}

export function isProbablyOfflineError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) return true;
  const code = (err as any)?.code as string | undefined;
  return code === 'unavailable' || code === 'deadline-exceeded';
}

export function isPermissionError(err: unknown): boolean {
  const code = (err as any)?.code as string | undefined;
  return code === 'permission-denied';
}

