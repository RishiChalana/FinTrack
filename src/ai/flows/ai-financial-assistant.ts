'use server';

/**
 * @fileOverview This file defines the AI Financial Assistant flow, which allows users to ask questions about their finances in natural language and receive helpful responses.
 *
 * - aiFinancialAssistant - A function that handles user queries and returns financial insights.
 * - AiFinancialAssistantInput - The input type for the aiFinancialAssistant function.
 * - AiFinancialAssistantOutput - The return type for the aiFinancialAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiFinancialAssistantInputSchema = z.object({
  query: z.string().describe('The user query about their finances.'),
});
export type AiFinancialAssistantInput = z.infer<typeof AiFinancialAssistantInputSchema>;

const AiFinancialAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
});
export type AiFinancialAssistantOutput = z.infer<typeof AiFinancialAssistantOutputSchema>;

export async function aiFinancialAssistant(input: AiFinancialAssistantInput): Promise<AiFinancialAssistantOutput> {
  return aiFinancialAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFinancialAssistantPrompt',
  input: {schema: AiFinancialAssistantInputSchema},
  output: {schema: AiFinancialAssistantOutputSchema},
  prompt: `You are a helpful AI financial assistant. A user will ask you a question about their finances, and you should provide a helpful and informative answer. 

User query: {{{query}}}`,
});

const aiFinancialAssistantFlow = ai.defineFlow(
  {
    name: 'aiFinancialAssistantFlow',
    inputSchema: AiFinancialAssistantInputSchema,
    outputSchema: AiFinancialAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
