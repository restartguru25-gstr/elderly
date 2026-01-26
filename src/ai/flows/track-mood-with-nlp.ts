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
      'The threshold for triggering a guardian notification.  If the current sentiment score is less than this value, a notification should be triggered.'
    ),
});
export type TrackMoodWithNLPInput = z.infer<typeof TrackMoodWithNLPInputSchema>;

const TrackMoodWithNLPOutputSchema = z.object({
  sentimentScore: z.number().describe('The sentiment score of the mood check-in text, from -1.0 (very negative) to 1.0 (very positive).'),
  notifyGuardian: z
    .boolean()
    .describe(
      'A boolean indicating whether the guardian should be notified based on a significant negative sentiment score.'
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

You will receive the mood check-in text. Analyze the sentiment and provide a sentiment score between -1.0 (very negative) and 1.0 (very positive).

Then, determine if the guardian should be notified. The guardian should be notified if the new sentimentScore is less than the provided 'guardianNotificationThreshold'. Set 'notifyGuardian' to true if a notification should be sent, otherwise set it to false.

Mood Check-in Text: {{{moodCheckIn}}}
Guardian Notification Threshold: {{{guardianNotificationThreshold}}}`,
});

const trackMoodWithNLPFlow = ai.defineFlow(
  {
    name: 'trackMoodWithNLPFlow',
    inputSchema: TrackMoodWithNLPInputSchema,
    outputSchema: TrackMoodWithNLPOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    // The model is responsible for all logic, including the notification decision.
    return output;
  }
);
