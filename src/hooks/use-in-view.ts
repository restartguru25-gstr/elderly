'use client';

import { useEffect, useRef, useState } from 'react';

const defaultOpts: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.08,
};

export function useInView(options: Partial<IntersectionObserverInit> = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const { rootMargin, threshold } = { ...defaultOpts, ...options };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { root: null, rootMargin, threshold }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}
