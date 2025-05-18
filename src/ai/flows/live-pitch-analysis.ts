
'use server';
/**
 * @fileOverview Analyzes live audio input to detect Swaras, Shrutis, Raaga,
 * and classify the music style (Hindustani/Carnatic) in real-time using GenAI.
 *
 * - analyzeLivePitch - A function that takes audio data URI and optional target Raag as input and returns the analysis.
 * - LivePitchAnalysisInput - The input type for the analyzeLivePitch function.
 * - LivePitchAnalysisOutput - The return type for the analyzeLivePitch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LivePitchAnalysisInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data URI containing the live audio input. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetRaaga: z
    .string()
    .optional()
    .describe('An optional target Raaga provided by the user to guide the analysis. Example: "Yaman", "Bhairavi".'),
});
export type LivePitchAnalysisInput = z.infer<typeof LivePitchAnalysisInputSchema>;

const LivePitchAnalysisOutputSchema = z.object({
  identifiedSwaras: z
    .array(z.string())
    .describe('An array of identified Swaras (e.g., Sa, Ri, Ga) from the audio input.'),
  identifiedShrutis: z
    .array(z.string())
    .describe('An array of identified Shrutis (microtonal intervals) corresponding to the Swaras, if discernible.'),
  musicStyle: z
    .enum(["Hindustani", "Carnatic", "Undetermined"])
    .describe('The classified style of music: Hindustani, Carnatic, or Undetermined if the style cannot be clearly identified.'),
  identifiedRaaga: z
    .string()
    .optional()
    .describe('The identified Raaga (e.g., Yaman, Bhairavi), if discernible. Returns undefined if no specific Raaga can be confidently identified.'),
});
export type LivePitchAnalysisOutput = z.infer<typeof LivePitchAnalysisOutputSchema>;

export async function analyzeLivePitch(input: LivePitchAnalysisInput): Promise<LivePitchAnalysisOutput> {
  return analyzeLivePitchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'livePitchAnalysisPrompt',
  input: {schema: LivePitchAnalysisInputSchema},
  output: {schema: LivePitchAnalysisOutputSchema},
  prompt: `You are an expert in Indian classical music, capable of analyzing audio to identify musical elements.

You will analyze the provided audio data to:
1.  Identify the Swaras (musical notes like Sa, Re, Ga, Ma, Pa, Dha, Ni) present.
2.  Identify the Shrutis (microtonal intervals) associated with the Swaras. If specific Shrutis are not clear, you can return an empty array or general observations.
3.  Classify the musical style as primarily Hindustani, Carnatic, or Undetermined if not clear or if it's another style.
4.  Attempt to identify the primary Raaga being performed (e.g., Yaman, Bhairavi, Kalyani, Todi). If no specific Raaga can be confidently identified, leave the 'identifiedRaaga' field undefined.

{{#if targetRaaga}}
The user has indicated they are attempting to perform or analyze in the context of Raaga {{{targetRaaga}}}.
Please consider this context when identifying the Raaga and other musical elements. If the performance clearly deviates from the target Raaga, identify the actual Raaga if possible, or state that it does not match the target.
{{/if}}

Return your analysis in the specified output format.

Audio: {{media url=audioDataUri}}`,
});

const analyzeLivePitchFlow = ai.defineFlow(
  {
    name: 'analyzeLivePitchFlow',
    inputSchema: LivePitchAnalysisInputSchema,
    outputSchema: LivePitchAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

