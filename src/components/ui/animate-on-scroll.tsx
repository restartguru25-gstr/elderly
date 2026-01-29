'use client';

import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

type AnimateOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
};

export function AnimateOnScroll({ children, className, delay = 0, style }: AnimateOnScrollProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={cn('animate-on-scroll', inView && 'animate-on-scroll-in-view', className)}
      style={{ ...style, ...(delay ? { animationDelay: `${delay}s` } : {}) }}
    >
      {children}
    </div>
  );
}
