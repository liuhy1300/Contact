
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
// Use the proxy path defined in vite.config.ts
const GEMINI_API_URL = '/gemini-api/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
}

export const GeminiService = {
    /**
     * Generates content based on a prompt.
     * @param prompt The user's input prompt.
     * @returns The generated text.
     */
    async generateContent(prompt: string): Promise<string> {
        if (!GEMINI_API_KEY) {
            console.error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in .env');
            return 'Error: Gemini API key is missing.';
        }

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.statusText}`);
            }

            const data: GeminiResponse = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }

        } catch (error) {
            console.error('Error generating content:', error);
            return `Error generating content. Please try again. Details: ${error}`;
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
