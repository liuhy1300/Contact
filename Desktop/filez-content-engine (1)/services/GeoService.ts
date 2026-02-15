import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    BrandAnalysis, ModelConfig, ContentAuditResult,
    SoRResult, SoRRound, CitationMapResult, CitationSource,
    FactInjectionResult, ScenarioArenaResult,
    Persona, PERSONA_OPTIONS
} from "../types/geo";

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const JUDGE_MODEL = 'gemini-3-pro-preview';     // 分析用强模型
const SIMULATOR_MODEL = 'gemini-2.0-flash';      // 仿真用快速模型

// ============================================================
// 工具函数
// ============================================================

// 构建 Persona 提示前缀
const buildPersonaPrefix = (persona?: Persona): string => {
    if (!persona) return '';
    const p = PERSONA_OPTIONS.find(o => o.id === persona);
    if (!p || !p.id) return '';
    return `请以 ${p.label} 的视角回答，重点关注：${p.hint}。\n`;
};

// 安全 JSON 解析
const safeParseJSON = (text: string): any => {
    const clean = text.replace(/```json\n|```\n|```/g, '').trim();
    try {
        return JSON.parse(clean);
    } catch {
        console.error('JSON 解析失败:', clean.substring(0, 200));
        return null;
    }
};

// ============================================================
// 1. 多模型仿真分析（原有功能 — 增强 Persona 支持）
// ============================================================

export const simulateModelResponse = async (
    modelConfig: ModelConfig,
    keyword: string,
    persona?: Persona
): Promise<string> => {
    try {
        const personaPrefix = buildPersonaPrefix(persona);
        let prompt = '';

        if (modelConfig.provider === 'Google') {
            prompt = `
        ${personaPrefix}
        User Query: "${keyword}"
        
        Task: Provide a helpful, accurate, and comprehensive response in Chinese (Simplified).
        - If the query asks for recommendations, provide a ranked list with clear reasoning.
        - Structure the response clearly with bullet points or numbers.
        - Be objective and factual.
      `;
        } else {
            prompt = `
        You are acting as a simulator for the AI model: ${modelConfig.name} by ${modelConfig.provider}.
        ${personaPrefix}
        User Query: "${keyword}"
        
        Task: Provide a realistic response in Chinese (Simplified) that ${modelConfig.name} would likely generate.
        - Crucial: If the query implies a recommendation (e.g., "Best tools"), generate a realistic LIST of 3-5 specific brands/products.
        - If it's Perplexity, include mock citation markers like [1] and provide source URLs.
        - Be objective. Do not just talk about one brand unless asked specifically.
        - Keep it under 300 words.
      `;
        }

        const model = genAI.getGenerativeModel({ model: SIMULATOR_MODEL });
        const result = await model.generateContent(prompt);
        return result.response.text() || "Error generating content.";
    } catch (error) {
        console.error(`仿真 ${modelConfig.name} 失败:`, error);
        return "Generation failed. Please check API key or try again.";
    }
};

// ============================================================
// 2. 品牌分析（原有功能）
// ============================================================

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
      1. Did the target brand appear? (isMentioned)
      2. Identify ALL brands mentioned (Competitors).
      3. Extract Pros/Cons.
      4. Summarize the text's stance on the target brand in one sentence (Chinese).
      5. Determine the "Buying Stage" this content serves (Awareness, Consideration, Decision).
      6. Determine sentiment (Positive, Neutral, Negative, N/A).
      7. Determine rank if a list is present (1-based index).

      Return JSON strictly adhering to this schema:
      {
        "isMentioned": boolean,
        "sentiment": "Positive" | "Neutral" | "Negative" | "N/A",
        "rank": number | null,
        "keyPoints": string[],
        "citationSources": string[],
        "pros": string[],
        "cons": string[],
        "summary": string,
        "buyingStage": "Awareness" | "Consideration" | "Decision" | "Unknown",
        "competitors": [
          { "name": string, "rank": number | null, "sentiment": "Positive" | "Neutral" | "Negative" }
        ]
      }
    `;

        const model = genAI.getGenerativeModel({
            model: JUDGE_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsedResult = safeParseJSON(responseText) || {};

        return {
            modelId: modelConfig.id,
            modelName: modelConfig.name,
            rawResponse: textToAnalyze,
            isMentioned: parsedResult.isMentioned ?? false,
            sentiment: parsedResult.sentiment || 'N/A',
            rank: parsedResult.rank ?? null,
            keyPoints: parsedResult.keyPoints || [],
            citationSources: parsedResult.citationSources || [],
            competitors: parsedResult.competitors || [],
            pros: parsedResult.pros || [],
            cons: parsedResult.cons || [],
            summary: parsedResult.summary || "未提供摘要",
            buyingStage: parsedResult.buyingStage || "Unknown"
        };

    } catch (error) {
        console.error("分析失败:", error);
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

// ============================================================
// 3. 内容审计（原有功能）
// ============================================================

export const auditContentForGeo = async (
    keyword: string,
    content: string
): Promise<ContentAuditResult> => {
    try {
        const prompt = `
      Act as a "Generative Engine Optimization" (GEO) Expert.
      Analyze the following brand content for the target keyword: "${keyword}".
      
      Content:
      """
      ${content.substring(0, 5000)}
      """

      Return JSON:
      {
        "score": number (0-100),
        "suggestions": [
          { 
            "category": "Authority" | "Structure" | "Clarity" | "Facts",
            "status": "Pass" | "Warning" | "Critical",
            "message": string,
            "fix": string
          }
        ],
        "missingKeywords": string[]
      }
    `;

        const model = genAI.getGenerativeModel({
            model: JUDGE_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        return safeParseJSON(result.response.text()) || {
            score: 0,
            suggestions: [{ category: 'Structure', status: 'Critical', message: '解析失败', fix: '请重试' }],
            missingKeywords: []
        };
    } catch (error) {
        console.error("审计失败", error);
        return {
            score: 0,
            suggestions: [{ category: 'Structure', status: 'Critical', message: '分析失败', fix: '请稍后重试' }],
            missingKeywords: []
        };
    }
};

// 运行完整 GEO 分析
export const runGeoAnalysis = async (
    brandName: string,
    keyword: string,
    models: ModelConfig[],
    persona?: Persona
): Promise<BrandAnalysis[]> => {
    const promises = models.map(async (model) => {
        const simulatedText = await simulateModelResponse(model, keyword, persona);
        return analyzeBrandInText(brandName, model, simulatedText);
    });
    return Promise.all(promises);
};

// ============================================================
// 功能 1: AI 推荐份额仿真 (SoR Analysis)
// ============================================================

export const runSoRAnalysis = async (
    brandName: string,
    baseKeyword: string,
    persona?: Persona
): Promise<SoRResult> => {
    const personaPrefix = buildPersonaPrefix(persona);

    // 生成 10 个不同角度的提问变体
    const queryVariants = [
        `${baseKeyword}推荐`,
        `最好的${baseKeyword}有哪些`,
        `${baseKeyword}哪个最安全可靠`,
        `企业级${baseKeyword}选型建议`,
        `${baseKeyword}市场份额排名`,
        `${baseKeyword}对比评测`,
        `大型企业适合什么${baseKeyword}`,
        `${baseKeyword}性价比最高的是哪个`,
        `国产${baseKeyword}推荐排行`,
        `${baseKeyword}安全性哪家最强`,
    ];

    const rounds: SoRRound[] = [];
    const competitorCount: Record<string, number> = {};

    // 并发执行所有轮次
    const roundPromises = queryVariants.map(async (query) => {
        try {
            const prompt = `
        ${personaPrefix}
        用户提问："${query}"

        请以专家身份用中文回答，必须给出具体的产品/品牌名称推荐列表（3-5个），按推荐度排序。
        每个推荐附简短理由。回答简洁，不超过 200 字。
      `;

            const model = genAI.getGenerativeModel({ model: SIMULATOR_MODEL });
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // 分析这轮回答
            const analysisPrompt = `
        分析以下AI回答，目标品牌: "${brandName}"

        回答:
        """
        ${response}
        """

        返回 JSON:
        {
          "rank": number | null,        // 目标品牌的排名 (1-based)，未提及则 null
          "isExclusive": boolean,        // 是否只推荐了目标品牌
          "competitorsMentioned": string[] // 提到的所有其他品牌
        }
      `;

            const judgeModel = genAI.getGenerativeModel({
                model: JUDGE_MODEL,
                generationConfig: { responseMimeType: "application/json" }
            });
            const analysisResult = await judgeModel.generateContent(analysisPrompt);
            const parsed = safeParseJSON(analysisResult.response.text()) || {};

            const rank = parsed.rank ?? null;
            return {
                query,
                isTop1: rank === 1,
                isTop3: rank !== null && rank <= 3,
                isExclusive: parsed.isExclusive ?? false,
                rank,
                competitorsMentioned: parsed.competitorsMentioned || [],
            } as SoRRound;
        } catch (err) {
            console.error(`SoR 回合失败 (${query}):`, err);
            return {
                query,
                isTop1: false,
                isTop3: false,
                isExclusive: false,
                rank: null,
                competitorsMentioned: [],
            } as SoRRound;
        }
    });

    const resolvedRounds = await Promise.all(roundPromises);
    rounds.push(...resolvedRounds);

    // 统计竞品出现频率
    rounds.forEach(r => {
        r.competitorsMentioned.forEach(c => {
            competitorCount[c] = (competitorCount[c] || 0) + 1;
        });
    });

    const total = rounds.length;
    const top1Count = rounds.filter(r => r.isTop1).length;
    const top3Count = rounds.filter(r => r.isTop3).length;
    const exclusiveCount = rounds.filter(r => r.isExclusive).length;
    const validRanks = rounds.filter(r => r.rank !== null).map(r => r.rank as number);
    const avgRank = validRanks.length > 0 ? +(validRanks.reduce((a, b) => a + b, 0) / validRanks.length).toFixed(1) : null;

    const topCompetitors = Object.entries(competitorCount)
        .filter(([name]) => name.toLowerCase() !== brandName.toLowerCase())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // 生成一句话洞察
    let insight = '';
    try {
        const insightPrompt = `
      品牌 "${brandName}" 在 ${total} 次 AI 推荐模拟中：
      - Top1 推荐率: ${((top1Count / total) * 100).toFixed(0)}%
      - 前三提及率: ${((top3Count / total) * 100).toFixed(0)}%
      - 独占推荐率: ${((exclusiveCount / total) * 100).toFixed(0)}%
      - 最常出现的竞品: ${topCompetitors.map(c => c.name).join('、')}

      请用一句话总结这个品牌在 AI 推荐中的表现，给出改进方向（中文，50字以内）。
    `;
        const m = genAI.getGenerativeModel({ model: JUDGE_MODEL });
        const r = await m.generateContent(insightPrompt);
        insight = r.response.text().trim();
    } catch {
        insight = `${brandName} 在 AI 推荐中 Top1 率 ${((top1Count / total) * 100).toFixed(0)}%，需持续优化品牌知识覆盖。`;
    }

    return {
        brandName,
        totalRounds: total,
        top1Rate: Math.round((top1Count / total) * 100),
        top3Rate: Math.round((top3Count / total) * 100),
        exclusivityRate: Math.round((exclusiveCount / total) * 100),
        avgRank,
        rounds,
        topCompetitors,
        insight,
    };
};

// ============================================================
// 功能 2: 引文溯源 (Citation Source Map)
// ============================================================

export const analyzeCitationSources = async (
    brandName: string,
    keyword: string,
    persona?: Persona
): Promise<CitationMapResult> => {
    const personaPrefix = buildPersonaPrefix(persona);

    // 用 Perplexity 风格模拟一次带引用的回答
    const simPrompt = `
    You are simulating Perplexity AI.
    ${personaPrefix}
    User query: "${keyword} ${brandName}"

    Generate a detailed response in Chinese about ${brandName} for the query "${keyword}".
    IMPORTANT: Include inline citations like [1], [2], [3] and provide a "参考来源" section at the end with realistic URLs.
    Cover: product features, strengths, weaknesses, pricing, competitors.
    Keep it under 400 words.
  `;

    const simModel = genAI.getGenerativeModel({ model: SIMULATOR_MODEL });
    const simResult = await simModel.generateContent(simPrompt);
    const aiResponse = simResult.response.text();

    // 分析引文源
    const analyzePrompt = `
    分析以下模拟 AI 回答中的引用来源，目标品牌: "${brandName}"

    AI 回答:
    """
    ${aiResponse}
    """

    任务：
    1. 提取所有引用的 URL/来源
    2. 评估每个来源的情感倾向、是否过期、风险等级
    3. 给出优先行动建议

    返回 JSON:
    {
      "sources": [
        {
          "url": string,
          "title": string,
          "domain": string,
          "sentiment": "positive" | "neutral" | "negative",
          "isOutdated": boolean,
          "publishDate": string,
          "riskLevel": "low" | "medium" | "high",
          "actionSuggestion": string
        }
      ],
      "riskSummary": string,
      "priorityActions": string[]
    }
  `;

    const judgeModel = genAI.getGenerativeModel({
        model: JUDGE_MODEL,
        generationConfig: { responseMimeType: "application/json" }
    });
    const analyzeResult = await judgeModel.generateContent(analyzePrompt);
    const parsed = safeParseJSON(analyzeResult.response.text()) || {};

    return {
        brandName,
        keyword,
        aiResponse,
        sources: (parsed.sources || []) as CitationSource[],
        riskSummary: parsed.riskSummary || '暂无风险摘要',
        priorityActions: parsed.priorityActions || [],
    };
};

// ============================================================
// 功能 3: 事实注入生成器 (Fact Injection)
// ============================================================

export const generateFactInjection = async (
    brandName: string,
    keyword: string,
    knownFacts: string  // 用户提供的正确信息
): Promise<FactInjectionResult> => {
    const prompt = `
    你是 GEO（生成式引擎优化）专家。

    品牌: "${brandName}"
    关键词: "${keyword}"
    品牌方已知的最新信息:
    """
    ${knownFacts}
    """

    任务:
    1. 模拟主流 AI 模型对 "${brandName}" 的认知，找出至少 3 个知识差距 (AI 可能不知道或认知错误的事实)
    2. 生成一段结构化的 FAQ 文本（适合发布在官网的 /faq 或 /features 页面），让 AI 爬虫能轻松提取
    3. 生成对应的 JSON-LD 结构化标记代码（FAQPage schema）
    4. 给出部署建议

    返回 JSON:
    {
      "gaps": [
        {
          "topic": string,
          "currentAIBelief": string,
          "correctFact": string,
          "severity": "low" | "medium" | "high"
        }
      ],
      "faqContent": string,
      "jsonLdCode": string,
      "deploymentGuide": string
    }
  `;

    const model = genAI.getGenerativeModel({
        model: JUDGE_MODEL,
        generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const parsed = safeParseJSON(result.response.text()) || {};

    return {
        brandName,
        gaps: parsed.gaps || [],
        faqContent: parsed.faqContent || '',
        jsonLdCode: parsed.jsonLdCode || '',
        deploymentGuide: parsed.deploymentGuide || '',
    };
};

// ============================================================
// 功能 4: 场景化竞技场 (Scenario Arena)
// ============================================================

export const runScenarioArena = async (
    brandName: string,
    scenarioQuery: string,
    competitorName: string,
    scenarioLabel: string,
    persona?: Persona
): Promise<ScenarioArenaResult> => {
    const personaPrefix = buildPersonaPrefix(persona);

    // 模拟 AI 回答
    const simPrompt = `
    ${personaPrefix}
    用户提问: "${scenarioQuery}"

    请详细对比 "${brandName}" 和 "${competitorName}"，给出客观推荐。
    包括：各自优势劣势、推荐排名、选择建议。
    用中文回答，300 字以内。
  `;

    const simModel = genAI.getGenerativeModel({ model: SIMULATOR_MODEL });
    const simResult = await simModel.generateContent(simPrompt);
    const aiResponse = simResult.response.text();

    // 深度分析对抗结果
    const analysisPrompt = `
    分析以下 AI 对比回答:

    场景: "${scenarioLabel}"
    品牌 A: "${brandName}"
    品牌 B: "${competitorName}"

    AI 回答:
    """
    ${aiResponse}
    """

    返回 JSON:
    {
      "brandRank": number | null,
      "competitorRank": number | null,
      "winner": "brand" | "competitor" | "tie",
      "swotGap": {
        "brandStrengths": string[],
        "brandWeaknesses": string[],
        "competitorStrengths": string[],
        "competitorWeaknesses": string[]
      },
      "rootCause": string,
      "actionPlan": string
    }
  `;

    const judgeModel = genAI.getGenerativeModel({
        model: JUDGE_MODEL,
        generationConfig: { responseMimeType: "application/json" }
    });
    const analysisResult = await judgeModel.generateContent(analysisPrompt);
    const parsed = safeParseJSON(analysisResult.response.text()) || {};

    return {
        scenarioLabel,
        query: scenarioQuery,
        brandName,
        competitorName,
        aiResponse,
        brandRank: parsed.brandRank ?? null,
        competitorRank: parsed.competitorRank ?? null,
        winner: parsed.winner || 'tie',
        swotGap: parsed.swotGap || {
            brandStrengths: [],
            brandWeaknesses: [],
            competitorStrengths: [],
            competitorWeaknesses: [],
        },
        rootCause: parsed.rootCause || '暂无分析',
        actionPlan: parsed.actionPlan || '暂无建议',
    };
};
