// MailArchitect AI 服务 — 使用 gemini-3-pro-preview
// 提供 polishText (润色) 和 generateFullEmail (一键生成) 功能

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TemplateType } from "../types/mailArchitect";

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MODEL_NAME = "gemini-3-pro-preview";

// 根据模板类型返回不同的风格指示
const getStyleInstruction = (template: string) => {
    if (template === TemplateType.GARTNER_INSIGHT) {
        return "风格要求：权威、数据驱动、洞察深刻。像 Gartner 分析师一样写作，使用强有力的动词，强调市场趋势和关键结论。";
    }
    if (template === TemplateType.MCKINSEY_MINIMAL) {
        return "风格要求：极简、战略高度、C-suite 视角。像麦肯锡顾问一样写作，逻辑严密，用词精准高雅，避免过度营销。";
    }
    return "风格要求：现代、充满活力、专业且以解决方案为导向。适合 SaaS 企业的 B2B 沟通。";
};

/**
 * 润色文本：优化标题或正文
 */
export const polishText = async (
    text: string,
    type: 'headline' | 'body',
    templateType: string = TemplateType.MODERN_ENTERPRISE
): Promise<string> => {
    if (!text) return "";

    const context = type === 'headline' ? '邮件标题' : '邮件正文';
    const styleInstruction = getStyleInstruction(templateType);

    const prompt = `你是 B2B 邮件营销专家。请优化以下${context}。
  ${styleInstruction}
  请直接返回优化后的文本，不要包含任何解释或引号。
  
  原文: ${text}`;

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text()?.trim() || text;
    } catch (error) {
        console.error("AI Polish Error:", error);
        throw error;
    }
};

/**
 * 根据主题生成完整邮件内容
 */
export const generateFullEmail = async (
    topic: string,
    templateType: string = TemplateType.MODERN_ENTERPRISE
) => {
    const styleInstruction = getStyleInstruction(templateType);

    const prompt = `作为一个顶尖的 B2B 营销策略专家，请根据以下主题生成一封中文商务邮件的内容。
  
  主题/意图: ${topic}
  ${styleInstruction}
  
  请返回 JSON 格式，严格包含以下字段：
  - headline: 邮件主标题 (用于 Hero 区域或大标题)
  - subheadline: 副标题 (简短的价值主张)
  - content: 邮件正文 (支持换行符，150-250字，分段清晰)
  - ctaText: 行动号召按钮文案
  `;

    try {
        const emailSchema = {
            type: SchemaType.OBJECT,
            properties: {
                headline: { type: SchemaType.STRING },
                subheadline: { type: SchemaType.STRING },
                content: { type: SchemaType.STRING },
                ctaText: { type: SchemaType.STRING }
            },
            required: ["headline", "subheadline", "content", "ctaText"]
        };

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: emailSchema as any,
            }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        if (!text) return null;
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};
