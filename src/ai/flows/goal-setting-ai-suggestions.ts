'use server';

/**
 * @fileOverview Provides AI-driven suggestions to help users achieve their savings goals faster.
 *
 * - `getSavingsSuggestions`: A function that generates savings suggestions based on user input.
 * - `SavingsSuggestionsInput`: The input type for the `getSavingsSuggestions` function.
 * - `SavingsSuggestionsOutput`: The return type for the `getSavingsSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingsSuggestionsInputSchema = z.object({
  goalName: z.string().describe('The name of the savings goal.'),
  currentSavings: z.number().describe('The current amount saved towards the goal.'),
  targetAmount: z.number().describe('The target amount to be saved.'),
  monthlyIncome: z.number().describe('The user\u2019s monthly income.'),
  monthlyExpenses: z.number().describe('The user\u2019s total monthly expenses.'),
  spendingHabits: z.string().describe('A description of the user\u2019s spending habits.'),
});
export type SavingsSuggestionsInput = z.infer<typeof SavingsSuggestionsInputSchema>;

const SavingsSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of actionable suggestions to help the user save faster.'),
});
export type SavingsSuggestionsOutput = z.infer<typeof SavingsSuggestionsOutputSchema>;

export async function getSavingsSuggestions(
  input: SavingsSuggestionsInput
): Promise<SavingsSuggestionsOutput> {
  return savingsSuggestionsFlow(input);
}

const savingsSuggestionsPrompt = ai.definePrompt({
  name: 'savingsSuggestionsPrompt',
  input: {schema: SavingsSuggestionsInputSchema},
  output: {schema: SavingsSuggestionsOutputSchema},
  prompt: `You are a financial advisor providing advice to help users reach their savings goals faster.

  Based on the following information, provide a list of actionable suggestions to help the user save faster.

  Goal Name: {{{goalName}}}
  Current Savings: {{{currentSavings}}}
  Target Amount: {{{targetAmount}}}
  Monthly Income: {{{monthlyIncome}}}
  Monthly Expenses: {{{monthlyExpenses}}}
  Spending Habits: {{{spendingHabits}}}

  Suggestions:
  `,
});

const savingsSuggestionsFlow = ai.defineFlow(
  {
    name: 'savingsSuggestionsFlow',
    inputSchema: SavingsSuggestionsInputSchema,
    outputSchema: SavingsSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await savingsSuggestionsPrompt(input);
    return output!;
  }
);
