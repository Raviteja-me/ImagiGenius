
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

export async function changeDressStyle(input: ChangeDressStyleInput, options?: { apiKey?: string }): Promise<ChangeDressStyleOutput> {
  return changeDressStyleFlow(input, options);
}

const changeDressStyleFlow = ai.defineFlow(
  {
    name: 'changeDressStyleFlow',
    inputSchema: ChangeDressStyleInputSchema,
    outputSchema: ChangeDressStyleOutputSchema,
  },
  async (input, _ctx, options?: { apiKey?: string }) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `Change the style of the dress in the image to match the following description: ${input.stylePrompt}. Ensure the person and the rest of the image remain as unchanged as possible, focusing only on altering the dress.`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
         safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
        ...(options?.apiKey ? { apiKey: options.apiKey } : {}),
      },
    });
    if (!media?.url) {
      throw new Error('AI did not return an edited image for the dress style change.');
    }
    return {editedPhotoDataUri: media.url};
  }
);
