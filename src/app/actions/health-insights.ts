'use server';

import { healthInsightsFlow } from '@/ai/flows/health-insights';

export async function getHealthInsights(vitalsSummary: string) {
  if (!vitalsSummary?.trim()) {
    return { summary: 'No vitals data yet.', recommendations: ['Log your first vital from the Vitals page.'] };
  }
  return healthInsightsFlow({ vitalsSummary });
}
