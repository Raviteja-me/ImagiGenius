// edit-image-with-chat.ts
'use server';

/**
 * @fileOverview Implements the image editing flow using chat commands.
 *
 * - editImageWithChat - A function that takes an image and a chat command and returns an edited image.
 * - EditImageWithChatInput - The input type for the editImageWithChat function.
 * - EditImageWithChatOutput - The return type for the editImageWithChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditImageWithChatInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  chatCommand: z.string().describe('The chat command to use to edit the image.'),
});
export type EditImageWithChatInput = z.infer<typeof EditImageWithChatInputSchema>;

const EditImageWithChatOutputSchema = z.object({
  editedImageDataUri: z
    .string()
    .describe(
      "The edited image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EditImageWithChatOutput = z.infer<typeof EditImageWithChatOutputSchema>;

export async function editImageWithChat(input: EditImageWithChatInput, options?: { apiKey?: string }): Promise<EditImageWithChatOutput> {
  return editImageWithChatFlow(input, options);
}

const editImageWithChatPrompt = ai.definePrompt({
  name: 'editImageWithChatPrompt',
  input: {schema: EditImageWithChatInputSchema},
  output: {schema: EditImageWithChatOutputSchema},
  prompt: [
    {media: {url: '{{{imageDataUri}}}'}},
    {text: 'Apply the following edit: {{{chatCommand}}} and return the new image.'},
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  model: 'googleai/gemini-2.0-flash-exp',
});

const editImageWithChatFlow = ai.defineFlow(
  {
    name: 'editImageWithChatFlow',
    inputSchema: EditImageWithChatInputSchema,
    outputSchema: EditImageWithChatOutputSchema,
  },
  async (input, _ctx, options?: { apiKey?: string }) => {
    const {media} = await ai.generate({
      prompt: [
        {media: {url: input.imageDataUri}},
        {text: `Apply the following edit: ${input.chatCommand}`},
      ],
      model: 'googleai/gemini-2.0-flash-exp',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        ...(options?.apiKey ? { apiKey: options.apiKey } : {}),
      },
    });
    return {editedImageDataUri: media.url!};
  }
);
