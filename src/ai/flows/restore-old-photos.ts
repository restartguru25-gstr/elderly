'use server';

/**
 * @fileOverview A flow for restoring old photos using AI.
 *
 * - restoreOldPhoto - A function that takes a data URI of an old photo and returns a data URI of a restored photo.
 * - RestoreOldPhotoInput - The input type for the restoreOldPhoto function.
 * - RestoreOldPhotoOutput - The return type for the restoreOldPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RestoreOldPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to be restored, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});

export type RestoreOldPhotoInput = z.infer<typeof RestoreOldPhotoInputSchema>;

const RestoreOldPhotoOutputSchema = z.object({
  restoredPhotoDataUri: z
    .string()
    .describe(
      'The restored photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type RestoreOldPhotoOutput = z.infer<typeof RestoreOldPhotoOutputSchema>;

export async function restoreOldPhoto(
  input: RestoreOldPhotoInput
): Promise<RestoreOldPhotoOutput> {
  return restoreOldPhotoFlow(input);
}

const restoreOldPhotoPrompt = ai.definePrompt({
  name: 'restoreOldPhotoPrompt',
  input: {schema: RestoreOldPhotoInputSchema},
  output: {schema: RestoreOldPhotoOutputSchema},
  prompt: `You are an AI image restoration expert.  You will take an old, damaged photo and restore it, returning the restored photo as a data URI.

Original Photo: {{media url=photoDataUri}}

Restored Photo:`, // Added Handlebars syntax to reference photoDataUri
});

const restoreOldPhotoFlow = ai.defineFlow(
  {
    name: 'restoreOldPhotoFlow',
    inputSchema: RestoreOldPhotoInputSchema,
    outputSchema: RestoreOldPhotoOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Restore this old photo.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {restoredPhotoDataUri: media.url!};
  }
);
