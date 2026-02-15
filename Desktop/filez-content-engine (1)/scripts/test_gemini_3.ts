
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Robust Env Loading
const envPath = path.join(process.cwd(), '.env.local');
console.log("Loading .env from:", envPath);

if (!fs.existsSync(envPath)) {
    console.error("ERROR: .env.local file not found at " + envPath);
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
// Try both VITE_GEMINI_API_KEY and GEMINI_API_KEY
const API_KEY = envConfig.VITE_GEMINI_API_KEY || envConfig.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("ERROR: No API Key found in .env.local");
    process.exit(1);
}

console.log(`API Key loaded (first 5 chars): ${API_KEY.substring(0, 5)}...`);

const genAI = new GoogleGenerativeAI(API_KEY);

async function testModel(modelName: string) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const prompt = 'Return a JSON object: { "status": "working", "model": "' + modelName + '" }';

    try {
        const result = await model.generateContent(prompt);
        console.log(`[SUCCESS] ${modelName} Response:`, result.response.text());
        return true;
    } catch (e: any) {
        console.error(`[FAILURE] ${modelName} Error:`, e.message);
        if (e.response) {
            console.error("Error Details:", JSON.stringify(e.response, null, 2));
        }
        return false;
    }
}

async function run() {
    // 1. Test Control Model (Stable)
    await testModel("gemini-2.0-flash");

    // 2. Test Requested Model
    await testModel("gemini-3-pro-preview");

    // 3. Test Requested Image Model (as text to check existence/error)
    await testModel("gemini-3-pro-image-preview");
}

run().catch(console.error);
