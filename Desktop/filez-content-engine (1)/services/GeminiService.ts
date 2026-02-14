
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the model
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
});

export const GeminiService = {
    /**
     * Generates content based on a prompt using the Google Generative AI SDK.
     * @param prompt The user's input prompt.
     * @returns The generated text.
     */
    async generateContent(prompt: string): Promise<string> {
        if (!GEMINI_API_KEY) {
            console.error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in .env');
            return 'Error: Gemini API key is missing.';
        }

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return text;

        } catch (error) {
            console.error('Error generating content:', error);
            // Fallback error message
            return `Error generating content. Please check your API key and network connection. Details: ${error instanceof Error ? error.message : String(error)}`;
        }
    },

    /**
     * Modifies the selected text based on an instruction (Rewrite, Expand, Polish).
     * @param selection The text selected by the user.
     * @param instruction The type of modification required.
     * @returns The modified text.
     */
    async modifyText(selection: string, instruction: 'rewrite' | 'expand' | 'polish'): Promise<string> {
        let prompt = '';

        switch (instruction) {
            case 'rewrite':
                prompt = `Please rewrite the following text to make it clearer and more concise:\n\n"${selection}"`;
                break;
            case 'expand':
                prompt = `Please expand on the following text, adding more details and context:\n\n"${selection}"`;
                break;
            case 'polish':
                prompt = `Please polish the following text to make it sound more professional and engaging:\n\n"${selection}"`;
                break;
        }

        return this.generateContent(prompt);
    }
};
