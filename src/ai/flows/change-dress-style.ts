'use server';

/**
 * @fileOverview A flow for changing the style of a dress in an image based on chat commands.
 *
 * - changeDressStyle - A function that handles the dress style changing process.
 * - ChangeDressStyleInput - The input type for the changeDressStyle function.
 * - ChangeDressStyleOutput - The return type for the changeDressStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChangeDressStyleInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing a person wearing a dress, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  stylePrompt: z.string().describe('The desired style for the dress.'),
});
export type ChangeDressStyleInput = z.infer<typeof ChangeDressStyleInputSchema>;

const ChangeDressStyleOutputSchema = z.object({
  editedPhotoDataUri: z
    .string()
    .describe(
      'The photo with the dress style changed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});
export type ChangeDressStyleOutput = z.infer<typeof ChangeDressStyleOutputSchema>;

export async function changeDressStyle(input: ChangeDressStyleInput): Promise<ChangeDressStyleOutput> {
  return changeDressStyleFlow(input);
}

const changeDressStylePrompt = ai.definePrompt({
  name: 'changeDressStylePrompt',
  input: {schema: ChangeDressStyleInputSchema},
  output: {schema: ChangeDressStyleOutputSchema},
  prompt: [
    {
      media: {url: '{{{photoDataUri}}}'},
    },
    {
      text: 'Change the style of the dress to match the following description: {{{stylePrompt}}}',
    },
  ],
  model: 'googleai/gemini-2.0-flash-exp',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const changeDressStyleFlow = ai.defineFlow(
  {
    name: 'changeDressStyleFlow',
    inputSchema: ChangeDressStyleInputSchema,
    outputSchema: ChangeDressStyleOutputSchema,
  },
  async input => {
    const {media} = await changeDressStylePrompt(input);
    return {editedPhotoDataUri: media!.url!};
  }
);
