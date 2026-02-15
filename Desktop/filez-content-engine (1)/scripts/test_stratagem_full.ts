
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Robust Env Loading
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.error("ERROR: .env.local file not found at " + envPath);
    process.exit(1);
}
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const API_KEY = envConfig.VITE_GEMINI_API_KEY || envConfig.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("ERROR: No API Key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-3-pro-preview";

// Copy of ANALYSIS_SCHEMA from constants/stratagem.ts
const ANALYSIS_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        competitorName: { type: SchemaType.STRING },
        executiveSummary: { type: SchemaType.STRING, description: "高度概括的战略威胁评估 (中文)。" },
        coreValueProposition: {
            type: SchemaType.OBJECT,
            properties: {
                sloganAnalysis: { type: SchemaType.STRING, description: "Slogan 背后的战略意图" },
                targetAudience: { type: SchemaType.STRING, description: "B2B 画像: 行业/规模/关键决策人" },
                usp: { type: SchemaType.STRING, description: "核心差异化优势 (USP)" },
            },
            required: ["sloganAnalysis", "targetAudience", "usp"]
        },
        productPricing: {
            type: SchemaType.OBJECT,
            properties: {
                productMatrix: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                pricingStrategy: { type: SchemaType.STRING, description: "定价模式: 订阅制/用量付费/私有化部署报价" },
                features: {
                    type: SchemaType.OBJECT,
                    properties: {
                        highlights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        missing: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    },
                    required: ["highlights", "missing"]
                },
            },
            required: ["productMatrix", "pricingStrategy", "features"]
        },
        b2bSpecifics: {
            type: SchemaType.OBJECT,
            properties: {
                salesModel: { type: SchemaType.STRING, description: "销售驱动模式 (SLG vs PLG vs 渠道分销)" },
                decisionMakers: { type: SchemaType.STRING, description: "主要打动的决策角色 (如 CIO, CTO, CFO)" },
                integrationEco: { type: SchemaType.STRING, description: "API 开放性、集成能力与合作伙伴生态" },
                customerSuccess: { type: SchemaType.STRING, description: "实施周期、SLA 保障与客户成功体系" },
            },
            required: ["salesModel", "decisionMakers", "integrationEco", "customerSuccess"]
        },
        digitalMarketing: {
            type: SchemaType.OBJECT,
            properties: {
                channels: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "B2B 获客渠道 (LinkedIn, SEO, 展会)" },
                contentStyle: { type: SchemaType.STRING },
                recentCampaigns: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ["channels", "contentStyle", "recentCampaigns"]
        },
        customerSentiment: {
            type: SchemaType.OBJECT,
            properties: {
                overallScore: { type: SchemaType.NUMBER, description: "0-100 score (G2/Capterra sentiment)" },
                topPraises: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                topComplaints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ["overallScore", "topPraises", "topComplaints"]
        },
        recentNews: {
            type: SchemaType.ARRAY,
            description: "List of 3-5 recent significant B2B news.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    date: { type: SchemaType.STRING, description: "YYYY-MM format" },
                    title: { type: SchemaType.STRING },
                    summary: { type: SchemaType.STRING },
                    sentiment: { type: SchemaType.STRING, enum: ["Positive", "Negative", "Neutral"] },
                },
                required: ["date", "title", "summary", "sentiment"]
            }
        },
        swot: {
            type: SchemaType.OBJECT,
            properties: {
                strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { content: { type: SchemaType.STRING }, implication: { type: SchemaType.STRING } }, required: ["content", "implication"] } },
                weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { content: { type: SchemaType.STRING }, implication: { type: SchemaType.STRING } }, required: ["content", "implication"] } },
                opportunities: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { content: { type: SchemaType.STRING }, implication: { type: SchemaType.STRING } }, required: ["content", "implication"] } },
                threats: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { content: { type: SchemaType.STRING }, implication: { type: SchemaType.STRING } }, required: ["content", "implication"] } },
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"]
        },
        actionableInsights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3条具体的战略反击建议 (中文)。" },
        marketScores: {
            type: SchemaType.ARRAY,
            description: "5维度评分 (0-100).",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    attribute: { type: SchemaType.STRING },
                    score: { type: SchemaType.NUMBER },
                    fullMark: { type: SchemaType.NUMBER },
                },
                required: ["attribute", "score", "fullMark"]
            },
        },
    },
    required: ["competitorName", "executiveSummary", "coreValueProposition", "productPricing", "b2bSpecifics", "digitalMarketing", "customerSentiment", "recentNews", "swot", "actionableInsights", "marketScores"]
};

async function testFullStratagem() {
    console.log(`\n--- Testing Stratagem FULL SCHEMA with ${MODEL_NAME} ---`);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: ANALYSIS_SCHEMA
        }
    });

    const promptText = `请以 B2B 战略顾问的身份，对竞品 "Filez" 进行深度市场分析。
    
    **分析要求：**
      请基于你的知识库，关注以下 B2B 核心指标：
      1.  **解决方案与定价：** 定价策略 (Subscription/Perpetual)、私有化部署能力。
      2.  **B2B 销售与生态：** 销售模式 (直销/渠道)、决策链角色、集成能力 (API/Marketplace)。
      3.  **市场表现：** 融资情况、客户口碑。
      
      **输出语言：** 简体中文 (专业商务风格)。`;

    try {
        const result = await model.generateContent(promptText);
        const text = result.response.text();
        console.log("Raw Response Length:", text.length);
        console.log("Raw Response Preview (first 200 chars):", text.substring(0, 200));

        // Attempt Parse
        try {
            // Apply sanitization 
            const cleanText = text.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            console.log("JSON Parse: SUCCESS");
            console.log("Missing fields check:");
            const keys = Object.keys(ANALYSIS_SCHEMA.properties);
            keys.forEach(k => {
                if (!parsed[k]) console.error(`MISSING: ${k}`);
            });
        } catch (e) {
            console.error("JSON Parse: FAILED");
            console.error("Parse Error:", e);
            console.error("Full Raw Text:", text); // Print full text on error
        }
    } catch (e: any) {
        console.error("Generation FAILED:", e.message);
    }
}

testFullStratagem().catch(console.error);
