'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  vitalsSummary: z.string().describe('A text summary of recent vitals: type, value, date.'),
});

const OutputSchema = z.object({
  summary: z.string().describe('Brief health summary in 2–3 sentences.'),
  recommendations: z.array(z.string()).describe('3–5 short, actionable recommendations.'),
});

export type HealthInsightsInput = z.infer<typeof InputSchema>;
export type HealthInsightsOutput = z.infer<typeof OutputSchema>;

const flow = ai.defineFlow(
  {
    name: 'healthInsightsFlow',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a friendly health assistant for seniors. Given the following vitals log, provide a brief, encouraging summary and 3–5 simple recommendations. Use plain language. Avoid medical advice; suggest seeing a doctor when relevant.

Vitals log:
${input.vitalsSummary}`,
      output: {
        schema: OutputSchema,
      },
    });
    return output as HealthInsightsOutput;
  }
);

export async function healthInsightsFlow(input: HealthInsightsInput): Promise<HealthInsightsOutput> {
  return flow(input);
}
