'use client';

export type RetryOptions = { attempts?: number; delayMs?: number };

/**
 * Retries an async function up to `attempts` times with `delayMs` between retries.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions
): Promise<T> {
  const attempts = opts?.attempts ?? 3;
  const delayMs = opts?.delayMs ?? 1000;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw last;
}
