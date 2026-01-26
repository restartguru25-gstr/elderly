'use server';

/**
 * @fileOverview A mood tracker with NLP sentiment analysis to notify guardians of significant negative shifts in a senior's emotional state.
 *
 * - trackMoodWithNLP - A function that tracks mood and performs sentiment analysis.
 * - TrackMoodWithNLPInput - The input type for the trackMoodWithNLP function.
 * - TrackMoodWithNLPOutput - The return type for the trackMoodWithNLP function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrackMoodWithNLPInputSchema = z.object({
  moodCheckIn: z.string().describe('A string representing the senior citizen\'s mood check-in text.'),
  previousSentimentScore: z
    .number()
    .optional()
    .describe('The sentiment score from the previous mood check-in, if available.'),
  guardianNotificationThreshold: z
    .number()
    .default(-0.5)
    .describe(
      'The threshold for triggering a guardian notification.  If the current sentiment score drops below this value compared to the previous score, a notification should be sent.'
    ),
});
export type TrackMoodWithNLPInput = z.infer<typeof TrackMoodWithNLPInputSchema>;

const TrackMoodWithNLPOutputSchema = z.object({
  sentimentScore: z.number().describe('The sentiment score of the mood check-in text.'),
  notifyGuardian: z
    .boolean()
    .describe(
      'A boolean indicating whether the guardian should be notified based on a significant negative shift in sentiment.'
    ),
});
export type TrackMoodWithNLPOutput = z.infer<typeof TrackMoodWithNLPOutputSchema>;

export async function trackMoodWithNLP(input: TrackMoodWithNLPInput): Promise<TrackMoodWithNLPOutput> {
  return trackMoodWithNLPFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trackMoodWithNLPPrompt',
  input: {schema: TrackMoodWithNLPInputSchema},
  output: {schema: TrackMoodWithNLPOutputSchema},
  prompt: `You are an AI assistant that analyzes the sentiment of mood check-in text from senior citizens and determines if their guardian should be notified.

You will receive the mood check-in text, the previous sentiment score (if available), and a guardian notification threshold.

Analyze the sentiment of the mood check-in text. Provide a sentiment score between -1 (very negative) and 1 (very positive).

Determine if the guardian should be notified. Notify the guardian if the current sentiment score drops below the guardian notification threshold compared to the previous sentiment score. If there is no previous sentiment score, do not notify the guardian.

Mood Check-in Text: {{{moodCheckIn}}}
Previous Sentiment Score: {{#if previousSentimentScore}}{{{previousSentimentScore}}}{{else}}N/A{{/if}}
Guardian Notification Threshold: {{{guardianNotificationThreshold}}}

Output:
Sentiment Score: {{(number)sentimentScore}}
Notify Guardian: {{(boolean)notifyGuardian}}`,
});

const trackMoodWithNLPFlow = ai.defineFlow(
  {
    name: 'trackMoodWithNLPFlow',
    inputSchema: TrackMoodWithNLPInputSchema,
    outputSchema: TrackMoodWithNLPOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const notifyGuardian = input.previousSentimentScore !== undefined && output!.sentimentScore - input.previousSentimentScore < input.guardianNotificationThreshold;
    return {
      sentimentScore: output!.sentimentScore,
      notifyGuardian,
    };
  }
);
