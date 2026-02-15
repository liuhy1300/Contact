import { GoogleGenAI, Type } from "@google/genai";
import { BrandAnalysis, ModelConfig, ContentAuditResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// The judge model (fast and smart enough for analysis)
const JUDGE_MODEL = 'gemini-3-flash-preview'; 

/**
 * 1. SIMULATION / GENERATION PHASE
 */
export const simulateModelResponse = async (
  modelConfig: ModelConfig,
  keyword: string
): Promise<string> => {
  try {
    let modelName = JUDGE_MODEL;
    let prompt = '';

    // If it's a Google model, we try to use the superior Pro model directly for better quality
    if (modelConfig.provider === 'Google') {
      modelName = 'gemini-3-pro-preview'; 
      prompt = `
        User Query: "${keyword}"
        
        Task: Provide a helpful, accurate, and comprehensive response in Chinese (Simplified).
        - If the query asks for recommendations, provide a ranked list with clear reasoning.
        - Structure the response clearly with bullet points or numbers.
        - Be objective and factual.
      `;
    } else {
      // For others, we simulate their persona using the Flash model for speed
      prompt = `
        You are acting as a simulator for the AI model: ${modelConfig.name} by ${modelConfig.provider}.
        User Query: "${keyword}"
        
        Task: Provide a realistic response in Chinese (Simplified) that ${modelConfig.name} would likely generate.
        - Crucial: If the query implies a recommendation (e.g., "Best tools"), generate a realistic LIST of 3-5 specific brands/products.
        - If it's Perplexity, include mock citation markers like [1].
        - Be objective. Do not just talk about one brand unless asked specifically.
        - Keep it under 300 words.
      `;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return response.text || "Error generating content.";
  } catch (error) {
    console.error(`Error simulating ${modelConfig.name}:`, error);
    // Fallback if Pro is not available or quota exceeded
    return "Generation failed. Please try again.";
  }
};

/**
 * 2. ANALYSIS PHASE (Upgraded to extract Summary and Buying Stage)
 */
export const analyzeBrandInText = async (
  brandName: string,
  modelConfig: ModelConfig,
  textToAnalyze: string
): Promise<BrandAnalysis> => {
  try {
    const prompt = `
      Analyze this AI response text.
      Target Brand: "${brandName}"
      
      Text:
      """
      ${textToAnalyze}
      """

      Task:
      1. Did the target brand appear?
      2. Identify ALL brands mentioned (Competitors).
      3. Extract Pros/Cons.
      4. Summarize the text's stance on the target brand in one sentence (Chinese).
      5. Determine the "Buying Stage" this content serves (Awareness, Consideration, Decision).

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: JUDGE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMentioned: { type: Type.BOOLEAN },
            sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative", "N/A"] },
            rank: { type: Type.INTEGER, nullable: true },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            citationSources: { type: Type.ARRAY, items: { type: Type.STRING } },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING, description: "One sentence summary of how the brand is portrayed" },
            buyingStage: { type: Type.STRING, enum: ["Awareness", "Consideration", "Decision", "Unknown"] },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  rank: { type: Type.INTEGER, nullable: true },
                  sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] }
                }
              }
            }
          },
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      rawResponse: textToAnalyze,
      isMentioned: result.isMentioned ?? false,
      sentiment: result.sentiment || 'N/A',
      rank: result.rank ?? null,
      keyPoints: result.keyPoints || [],
      citationSources: result.citationSources || [],
      competitors: result.competitors || [],
      pros: result.pros || [],
      cons: result.cons || [],
      summary: result.summary || "未提供摘要",
      buyingStage: result.buyingStage || "Unknown"
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      rawResponse: textToAnalyze,
      isMentioned: false,
      sentiment: 'N/A',
      rank: null,
      keyPoints: [],
      citationSources: [],
      competitors: [],
      pros: [],
      cons: [],
      summary: "分析失败",
      buyingStage: "Unknown"
    };
  }
};

/**
 * 3. CONTENT AUDIT LAB
 */
export const auditContentForGeo = async (
  keyword: string,
  content: string
): Promise<ContentAuditResult> => {
  try {
    const prompt = `
      Act as a "Generative Engine Optimization" (GEO) Expert.
      Analyze the following brand content (About Us page or Product Landing Page) for the target keyword: "${keyword}".
      
      Content:
      """
      ${content.substring(0, 5000)}
      """

      Criteria for GEO:
      1. Authority: Does it cite credentials, history, or awards?
      2. Structure: Is it easy for an LLM to parse (clear headers, lists)?
      3. Clarity: concise definitions of what the brand does?
      4. Facts: Are there concrete numbers (price, dates) that LLMs crave?

      Return JSON with a score (0-100), structured suggestions, and missing semantically related keywords.
    `;

    const response = await ai.models.generateContent({
      model: JUDGE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: ['Authority', 'Structure', 'Clarity', 'Facts'] },
                  status: { type: Type.STRING, enum: ['Pass', 'Warning', 'Critical'] },
                  message: { type: Type.STRING },
                  fix: { type: Type.STRING }
                }
              }
            },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Audit failed", error);
    return {
      score: 0,
      suggestions: [{ category: 'Structure', status: 'Critical', message: 'Analysis Failed', fix: 'Try again later' }],
      missingKeywords: []
    };
  }
};

export const runGeoAnalysis = async (
  brandName: string,
  keyword: string,
  models: ModelConfig[]
): Promise<BrandAnalysis[]> => {
  const promises = models.map(async (model) => {
    const simulatedText = await simulateModelResponse(model, keyword);
    return analyzeBrandInText(brandName, model, simulatedText);
  });
  return Promise.all(promises);
};