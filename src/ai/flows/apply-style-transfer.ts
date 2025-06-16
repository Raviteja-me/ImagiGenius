
'use server';

/**
 * @fileOverview Applies a specific style to an image using chat commands, optionally with a reference image.
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
      'A photo to be stylized, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  style: z.string().describe('The desired style to apply to the image (e.g., Ghibli, contour, sketch). If a reference image is provided, this can further describe how to use it.'),
  referencePhotoDataUri: z.string().optional().describe('An optional reference image for style transfer, as a data URI that must include a MIME type and use Base64 encoding.'),
});
export type ApplyStyleTransferInput = z.infer<typeof ApplyStyleTransferInputSchema>;

const ApplyStyleTransferOutputSchema = z.object({
  styledPhotoDataUri: z
    .string()
    .describe(
      'The stylized photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
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

    if (input.referencePhotoDataUri) {
      promptParts.push({ text: `Apply the style from the reference image to the main image. The artistic style to aim for is: "${input.style}". If the style description seems to contradict the reference image, prioritize the reference image's visual style.` });
      promptParts.push({ text: "Reference Image:"});
      promptParts.push({ media: { url: input.referencePhotoDataUri } });
      promptParts.push({ text: "Main Image to Stylize:"});
      promptParts.push({ media: { url: input.photoDataUri } });
    } else {
      promptParts.push({ text: `Apply the following style to the image: "${input.style}"` });
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
