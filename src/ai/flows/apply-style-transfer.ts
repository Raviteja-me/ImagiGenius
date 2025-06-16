
'use server';

/**
 * @fileOverview Applies a specific style to an image using chat commands, optionally guided by a reference image.
 *
 * - applyStyleTransfer - A function that applies a style transfer to an image.
 * - ApplyStyleTransferInput - The input type for the applyStyleTransfer function.
 * - ApplyStyleTransferOutput - The return type for the applyStyleTransfer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplyStyleTransferInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be stylized, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  style: z.string().describe('The desired style to apply to the image (e.g., Ghibli, contour, sketch).'),
  referencePhotoDataUri: z.optional(z.string().describe(
    "An optional reference photo for style guidance, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  )),
});
export type ApplyStyleTransferInput = z.infer<typeof ApplyStyleTransferInputSchema>;

const ApplyStyleTransferOutputSchema = z.object({
  styledPhotoDataUri: z
    .string()
    .describe(
      "The stylized photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ApplyStyleTransferOutput = z.infer<typeof ApplyStyleTransferOutputSchema>;

export async function applyStyleTransfer(input: ApplyStyleTransferInput): Promise<ApplyStyleTransferOutput> {
  return applyStyleTransferFlow(input);
}

const applyStyleTransferFlow = ai.defineFlow(
  {
    name: 'applyStyleTransferFlow',
    inputSchema: ApplyStyleTransferInputSchema,
    outputSchema: ApplyStyleTransferOutputSchema,
  },
  async (input) => {
    const promptParts: ({text: string} | {media: {url: string}})[] = [];

    let styleInstruction = `Apply the following style to the image: "${input.style}"`;
    if (input.referencePhotoDataUri) {
      styleInstruction += `. Use the provided reference image for style guidance. The main image to be modified is the second image provided.`;
      promptParts.push({ text: styleInstruction });
      promptParts.push({ media: { url: input.referencePhotoDataUri } }); // Reference image first
      promptParts.push({ media: { url: input.photoDataUri } }); // Then target image
    } else {
      promptParts.push({ text: styleInstruction });
      promptParts.push({ media: { url: input.photoDataUri } });
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('AI did not return a stylized image.');
    }
    return { styledPhotoDataUri: media.url };
  }
);

