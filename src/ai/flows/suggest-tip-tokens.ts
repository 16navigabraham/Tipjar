'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting tip tokens based on user descriptions.
 *
 * - suggestTipTokens - A function that suggests relevant tokens based on user input.
 * - SuggestTipTokensInput - The input type for the suggestTipTokens function.
 * - SuggestTipTokensOutput - The return type for the suggestTipTokens function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTipTokensInputSchema = z.object({
  tokenDescription: z
    .string()
    .describe('A description of the desired token (e.g., \'a token related to gaming\' or \'a stablecoin\').'),
});
export type SuggestTipTokensInput = z.infer<typeof SuggestTipTokensInputSchema>;

const SuggestTipTokensOutputSchema = z.object({
  suggestedTokens: z
    .array(z.string())
    .describe('An array of suggested token symbols or names based on the description.'),
});
export type SuggestTipTokensOutput = z.infer<typeof SuggestTipTokensOutputSchema>;

export async function suggestTipTokens(input: SuggestTipTokensInput): Promise<SuggestTipTokensOutput> {
  return suggestTipTokensFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTipTokensPrompt',
  input: {schema: SuggestTipTokensInputSchema},
  output: {schema: SuggestTipTokensOutputSchema},
  prompt: `You are a helpful assistant that suggests relevant cryptocurrency tokens based on user descriptions. Given the following description, suggest a list of tokens that the user could use for tipping.  Return only the symbols.  Do not include explanations.

Description: {{{tokenDescription}}}

Tokens:`,
});

const suggestTipTokensFlow = ai.defineFlow(
  {
    name: 'suggestTipTokensFlow',
    inputSchema: SuggestTipTokensInputSchema,
    outputSchema: SuggestTipTokensOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
