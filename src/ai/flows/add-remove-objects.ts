
'use server';

/**
 * @fileOverview AI flow to add or remove objects (people or animals) from an image based on chat commands, optionally guided by a reference image.
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
  referencePhotoDataUri: z.optional(z.string().describe(
    "An optional reference photo for guiding the object addition/removal, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  )),
  apiKey: z.string().optional(),
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

const addRemoveObjectsFlow = ai.defineFlow(
  {
    name: 'addRemoveObjectsFlow',
    inputSchema: AddRemoveObjectsInputSchema,
    outputSchema: AddRemoveObjectsOutputSchema,
  },
  async input => {
    const promptParts: ({text: string} | {media: {url: string}})[] = [
      {media: {url: input.photoDataUri}} // The primary image to edit
    ];

    let commandText = `Modify the image according to the following command: "${input.command}".`;
    if (input.referencePhotoDataUri) {
      commandText += ` Use the provided reference image as a visual guide for this command. The reference image is the second image provided, the primary image to modify is the first.`;
      // Order can be important. Let's try main image, then reference, then text.
      // If that doesn't work well, try reference first, then main, then text.
      promptParts.splice(1, 0, {media: {url: input.referencePhotoDataUri}}); // Insert reference image after main image
    }
    promptParts.push({text: commandText});

    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: promptParts,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
        ...(input.apiKey ? { apiKey: input.apiKey } : {}),
    });

    if (!media?.url) {
      throw new Error('AI did not return a modified image.');
    }
    return {modifiedPhotoDataUri: media.url};
  }
);
