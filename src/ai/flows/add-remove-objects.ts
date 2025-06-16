'use server';

/**
 * @fileOverview AI flow to add or remove objects (people or animals) from an image based on chat commands.
 *
 * - addRemoveObjects - A function that handles adding or removing objects from an image.
 * - AddRemoveObjectsInput - The input type for the addRemoveObjects function.
 * - AddRemoveObjectsOutput - The return type for the addRemoveObjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AddRemoveObjectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to modify, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  command: z.string().describe('The chat command to add or remove objects from the image.'),
});
export type AddRemoveObjectsInput = z.infer<typeof AddRemoveObjectsInputSchema>;

const AddRemoveObjectsOutputSchema = z.object({
  modifiedPhotoDataUri: z
    .string()
    .describe(
      'The modified photo with objects added or removed, as a data URI in base64 encoding.'
    ),
});
export type AddRemoveObjectsOutput = z.infer<typeof AddRemoveObjectsOutputSchema>;

export async function addRemoveObjects(input: AddRemoveObjectsInput): Promise<AddRemoveObjectsOutput> {
  return addRemoveObjectsFlow(input);
}

const addRemoveObjectsPrompt = ai.definePrompt({
  name: 'addRemoveObjectsPrompt',
  input: {schema: AddRemoveObjectsInputSchema},
  output: {schema: AddRemoveObjectsOutputSchema},
  prompt: [
    {
      media: {url: '{{photoDataUri}}'},
    },
    {
      text: 'Modify the image according to the following command: {{{command}}}',
    },
  ],
  model: 'googleai/gemini-2.0-flash-exp',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const addRemoveObjectsFlow = ai.defineFlow(
  {
    name: 'addRemoveObjectsFlow',
    inputSchema: AddRemoveObjectsInputSchema,
    outputSchema: AddRemoveObjectsOutputSchema,
  },
  async input => {
    const {media} = await addRemoveObjectsPrompt(input);
    return {modifiedPhotoDataUri: media!.url!};
  }
);
