'use server';

/**
 * @fileOverview An AI agent that modifies the background of an image based on chat commands.
 *
 * - modifyBackground - A function that handles the background modification process.
 * - ModifyBackgroundInput - The input type for the modifyBackground function.
 * - ModifyBackgroundOutput - The return type for the modifyBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModifyBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo with the background to be modified, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  backgroundDescription: z.string().describe('The desired background description.'),
});
export type ModifyBackgroundInput = z.infer<typeof ModifyBackgroundInputSchema>;

const ModifyBackgroundOutputSchema = z.object({
  modifiedPhotoDataUri: z
    .string()
    .describe('The modified photo with the new background as a data URI.'),
});
export type ModifyBackgroundOutput = z.infer<typeof ModifyBackgroundOutputSchema>;

export async function modifyBackground(input: ModifyBackgroundInput, options?: { apiKey?: string }): Promise<ModifyBackgroundOutput> {
  return modifyBackgroundFlow(input, options);
}

const prompt = ai.definePrompt({
  name: 'modifyBackgroundPrompt',
  input: {schema: ModifyBackgroundInputSchema},
  output: {schema: ModifyBackgroundOutputSchema},
  prompt: `You are an AI image editor. Your task is to modify the background of the given image based on the user's description. Return the modified image as a data URI.

Original Image: {{media url=photoDataUri}}
Desired Background: {{{backgroundDescription}}}

Create the modified image.`, 
  config: {
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
  },
});

const modifyBackgroundFlow = ai.defineFlow(
  {
    name: 'modifyBackgroundFlow',
    inputSchema: ModifyBackgroundInputSchema,
    outputSchema: ModifyBackgroundOutputSchema,
  },
  async (input, _ctx, options?: { apiKey?: string }) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `Modify the background to: ${input.backgroundDescription}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        ...(options?.apiKey ? { apiKey: options.apiKey } : {}),
      },
    });
    return {modifiedPhotoDataUri: media.url!};
  }
);
