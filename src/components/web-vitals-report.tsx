'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

function reportMetric(metric: Metric) {
  if (typeof window === 'undefined') return;
  const { name, value, id, rating, delta } = metric;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, { value, id, rating, delta });
  }
  // Ready for analytics: send to GA4, Plausible, or custom endpoint.
  // window.gtag?.('event', name, { value: Math.round(value), event_label: id, ... });
}

export function WebVitalsReport() {
  useEffect(() => {
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);
  return null;
}
