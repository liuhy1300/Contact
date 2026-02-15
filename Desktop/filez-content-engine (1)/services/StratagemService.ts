import {
    ANALYSIS_SCHEMA, COMPARISON_SCHEMA, BRAND_INDEX_SCHEMA,
    BATTLECARD_SCHEMA, TONEGUARD_SCHEMA, SENTIMENT_SCHEMA, BRANDKIT_SCHEMA,
    SYSTEM_INSTRUCTION
} from "../constants/stratagem";
import {
    AnalysisRequest, CompetitorAnalysis, ComparisonResult, BrandVitalityResult,
    BattleCardResult, ToneGuardResult, SentimentRadarResult, BrandKitResult
} from "../types/stratagem";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

// 初始化 Google Generative AI 客户端
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 模型配置
const PRIMARY_MODEL = "gemini-3-pro-preview";
const FALLBACK_MODEL = "gemini-2.0-flash";

// 通用 Gemini API 调用方法
async function callGeminiAPI<T>(promptText: string, schema: any, image?: string, imageMimeType?: string): Promise<T> {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing");
    }

    let modelName = PRIMARY_MODEL;

    const getModel = (name: string) => genAI.getGenerativeModel({
        model: name,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        console.log(`Calling Stratagem API (${modelName})...`);
        let model = getModel(modelName);

        const parts: any[] = [{ text: promptText }];
        if (image && imageMimeType) {
            parts.push({
                inlineData: {
                    mimeType: imageMimeType,
                    data: image
                }
            });
        }

        const parseResponse = (text: string): T => {
            try {
                const cleanText = text.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
                return JSON.parse(cleanText) as T;
            } catch (e) {
                console.error("JSON Parse Error. Raw Text:", text);
                throw new Error("Invalid JSON format from model");
            }
        };

        try {
            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error("Empty response");
            return parseResponse(text);

        } catch (e: any) {
            console.warn(`${modelName} failed, retrying with ${FALLBACK_MODEL}:`, e.message);
            modelName = FALLBACK_MODEL;
            model = getModel(modelName);

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();
            return parseResponse(text);
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

// 构建视角 prompt 片段
function buildPerspectivePrompt(request: AnalysisRequest): string {
    let extra = '';
    if (request.perspective) {
        extra += `\n\n**审视视角：** ${request.perspective}`;
    }
    if (request.focusPreset) {
        extra += `\n\n**分析侧重：** ${request.focusPreset}`;
    }
    return extra;
}

// ============================================================
// 原有功能 — 深度单品洞察
// ============================================================
export const generateAnalysis = async (request: AnalysisRequest): Promise<CompetitorAnalysis> => {
    let promptText = `请以 B2B 战略顾问的身份，对竞品 "${request.competitorName}" 进行深度市场分析。`;

    if (request.context) promptText += `\n\n用户补充资料：\n${request.context}`;
    if (request.myProductContext) {
        promptText += `\n\n我方产品背景 (用于 Gap Analysis): \n${request.myProductContext}\n\n请重点对比我方与竞品的差距。`;
    }

    promptText += buildPerspectivePrompt(request);

    promptText += `\n\n**分析要求：**
  请基于你的知识库，关注以下 B2B 核心指标：
  1.  **解决方案与定价：** 定价策略 (Subscription/Perpetual)、私有化部署能力。
  2.  **B2B 销售与生态：** 销售模式 (直销/渠道)、决策链角色、集成能力 (API/Marketplace)。
  3.  **市场表现：** 融资情况、客户口碑。
  
  **输出语言：** 简体中文 (专业商务风格)。`;

    return await callGeminiAPI<CompetitorAnalysis>(promptText, ANALYSIS_SCHEMA, request.image, request.imageMimeType);
};

// ============================================================
// 原有功能 — 竞品横向对标
// ============================================================
export const generateComparison = async (request: AnalysisRequest): Promise<ComparisonResult> => {
    const brands = request.competitorNames?.join(", ");
    let promptText = `请对以下 B2B 品牌进行横向竞品对比分析: ${brands}。`;

    if (request.context) promptText += `\n\n侧重关注点：\n${request.context}`;
    promptText += buildPerspectivePrompt(request);

    promptText += `\n\n**任务要求：**
  1.  **雷达图维度：** [技术先进性, 性价比, 品牌影响力, 市场份额, 服务支持体系]。
  2.  **对比表格：** [目标客群, 核心价值主张, 部署方式, 定价模式, 生态集成能力]。
  3.  **结论：** 谁是当前的 B2B 市场领导者？为什么？
  
  **输出语言：** 简体中文。`;

    return await callGeminiAPI<ComparisonResult>(promptText, COMPARISON_SCHEMA);
};

// ============================================================
// 原有功能 — VISA 品牌审计
// ============================================================
export const generateBrandIndex = async (request: AnalysisRequest): Promise<BrandVitalityResult> => {
    const brandName = request.brandIndexName || "Target Brand";
    const promptText = `请对品牌 **"${brandName}"** 进行全网搜索和品牌指数评估。

**执行步骤：**
1.  **搜索阶段：** 请利用所掌握的信息查找该品牌的：
    * 最近 3 个月的新闻报道和公关动态。
    * 社交媒体（微博、小红书、TikTok等）上的用户真实评价和热门讨论。
    * 官方发布的最新产品或战略公告。
    * 是否存在重大的负面舆情。

2.  **分析与评分阶段：** 基于搜索结果，按照 VISA 模型进行打分（每项满分25分），并计算总分。

3.  **输出阶段：** 请严格按照以下 JSON 格式输出结果，不要输出多余的 Markdown 寒暄语。`;

    return await callGeminiAPI<BrandVitalityResult>(promptText, BRAND_INDEX_SCHEMA);
};

// ============================================================
// 新增：场景化攻防卡 (Battle Card)
// ============================================================
export const generateBattleCard = async (request: AnalysisRequest): Promise<BattleCardResult> => {
    const competitor = request.competitorName || '竞品';
    const industry = request.industry || '通用';
    const scenario = request.scenario || '通用场景';

    let promptText = `你是联想 Filez 的销售战略顾问。请为销售团队生成一张 **"销售攻防卡 (Battle Card)"**。

**竞品：** ${competitor}
**目标行业：** ${industry}
**竞争场景：** ${scenario}

**你的任务：**
1. **分析竞品弱点 (3-5个)：** 在 "${scenario}" 这个具体场景下，${competitor} 有哪些明确的短板？务必附上公开证据。
2. **明确我方优势 (3-5个)：** 联想 Filez 在此场景下的差异化优势是什么？用案例或资质证明。
3. **推荐话术 (5条)：** 直接给出销售人员可以在客户会议中使用的话术原文。
4. **致胜策略：** 用150字以内总结如何赢下这个单子。
5. **异议处理 (3-5条)：** 客户最可能提出的异议，以及推荐的回答方式。`;

    if (request.context) promptText += `\n\n补充背景：${request.context}`;
    promptText += buildPerspectivePrompt(request);
    promptText += `\n\n**输出语言：** 简体中文 (专业商务风格)。`;

    return await callGeminiAPI<BattleCardResult>(promptText, BATTLECARD_SCHEMA);
};

// ============================================================
// 新增：品牌语调卫士 (Tone Guard)
// ============================================================
export const generateToneGuard = async (request: AnalysisRequest): Promise<ToneGuardResult> => {
    const articleText = request.articleText || '';

    const promptText = `你是联想 Filez 品牌部的首席文案审核官。你的职责是确保所有对外发布的内容符合 Filez 的品牌语调标准。

**Filez 品牌语调标准 (Tone DNA)：**
- 稳重但不沉闷（专业感 ≠ 枯燥）
- 强调安全感、可靠性、企业级品质
- 科技与人文结合，有温度但不失权威
- 避免 C 端网盘的休闲/娱乐语气
- 避免过于冰冷的技术文档风格
- 禁止使用竞品品牌名进行直接贬低
- 行文应体现「联想」大品牌的厚重感

**审核任务：**
请审查以下稿件内容，给出 0-100 的语调合规分数：

---
${articleText}
---

**要求：**
1. 逐段检查，列出所有不合规之处（指出原文、问题和建议）
2. 给出总体判定：pass(>80分) / warning(60-80) / fail(<60)
3. 提供完整的合规重写版本（保留原意，调整语调）
4. 用一段话总结当前稿件的语调特征与问题

**输出语言：** 简体中文。`;

    return await callGeminiAPI<ToneGuardResult>(promptText, TONEGUARD_SCHEMA);
};

// ============================================================
// 新增：舆情危机模拟 (Sentiment Radar)
// ============================================================
export const generateSentimentRadar = async (request: AnalysisRequest): Promise<SentimentRadarResult> => {
    const brandName = request.competitorName || 'Filez';

    let promptText = `你是一位 B2B 舆情分析专家。请针对品牌 **"${brandName}"** 进行全面的舆情分析和危机模拟。

**分析任务：**

1. **B2B 渠道舆情扫描：** 请分析以下渠道中关于 ${brandName} 的讨论情况：
   - 知乎（CTO/技术经理等决策者聚集地）
   - CSDN / 掘金（开发者社区）
   - 脉脉（职场社交）
   - 微博 / 微信公众号（大众舆论）
   - 36氪 / IT桔子（行业媒体）

   对每个渠道评估：讨论热度、情感倾向、核心话题。

2. **危机风险评估：** 基于当前舆情态势，评估危机风险等级 (low/medium/high)。

3. **危机模拟演练：** 假设发生最可能的负面事件（如数据泄露传闻），请：
   - 描述假设危机场景
   - 撰写 PR 声明草稿 (500字以内)
   - 准备 5-8 条媒体 Q&A 口径

4. **舆情管理建议：** 3-5 条可操作的品牌保护建议。`;

    if (request.context) promptText += `\n\n补充信息：${request.context}`;
    promptText += `\n\n**输出语言：** 简体中文。`;

    return await callGeminiAPI<SentimentRadarResult>(promptText, SENTIMENT_SCHEMA);
};

// ============================================================
// 新增：品牌工具包 (Brand Kit)
// ============================================================
export const generateBrandKit = async (request: AnalysisRequest): Promise<BrandKitResult> => {
    const productName = request.productNameForKit || 'Filez 新产品';
    const sellingPoints = request.productSellingPoints || '安全可靠的企业级文件协作';

    let promptText = `你是联想 Filez 品牌部的高级内容策略师。当公司发布新产品时，你需要一键生成全套营销物料，确保所有渠道声音统一。

**产品名称：** ${productName}
**核心卖点：** ${sellingPoints}

**请生成以下四个物料：**

1. **新闻稿 (Press Release)：** 800-1200字，专业商务风格。结构：标题 → 导语 → 产品亮点 → 管理层引言 → 行业意义 → 联系方式。

2. **销售一页纸 (One-Pager)：** 提供核心文案要素——
   - 一句话标题（震撼力）
   - 副标题（补充说明）
   - 3-5 个核心价值点（每个一句话）
   - 行动呼吁语（CTA）

3. **官网 Banner 文案：**
   - 大标题（10字以内，高冲击力）
   - 副文案（20字以内）
   - CTA 按钮（4字以内）

4. **客户邀请函：** 300-500字，用于邀请 VIP 客户参加产品发布活动。`;

    if (request.context) promptText += `\n\n补充信息：${request.context}`;
    promptText += buildPerspectivePrompt(request);
    promptText += `\n\n**输出语言：** 简体中文 (专业商务风格)。`;

    return await callGeminiAPI<BrandKitResult>(promptText, BRANDKIT_SCHEMA);
};
