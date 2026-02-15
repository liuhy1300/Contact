// SEM 智数服务 — 使用 Google Gemini 模型进行 SEM 智能分析
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 模型配置
const PRIMARY_MODEL = "gemini-3-pro-preview";
const FALLBACK_MODEL = "gemini-2.0-flash";

// ── 类型定义 ──
export interface KeywordInsight {
    keyword: string;
    search_volume: string;
    competition: string;        // "高" | "中" | "低"
    cpc_estimate: string;
    relevance_score: number;    // 0-100
    intent: string;             // 搜索意图
    suggestion: string;         // AI 优化建议
}

export interface AdCopyVariant {
    headline1: string;
    headline2: string;
    headline3: string;
    description1: string;
    description2: string;
    display_url: string;
    sitelinks: string[];
    quality_prediction: number;  // 预测质量得分 1-10
    rationale: string;          // 创意策略说明
}

export interface QualityScoreAudit {
    overall_score: number;       // 1-10
    ad_relevance: number;        // 1-10
    landing_page_experience: number; // 1-10
    expected_ctr: number;        // 1-10
    issues: Array<{ severity: string; area: string; detail: string; fix: string }>;
    recommendations: string[];
}

export interface BidStrategy {
    strategy_name: string;
    description: string;
    target_cpa: string;
    target_roas: string;
    daily_budget_suggestion: string;
    keyword_bids: Array<{ keyword: string; suggested_bid: string; reason: string }>;
    forecast: { impressions: string; clicks: string; conversions: string; cost: string };
}

export interface CampaignAuditResult {
    score: number;
    grade: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    action_items: Array<{ priority: string; action: string; expected_impact: string }>;
}

// ── Gemini 结构化输出 Schema ──

const KEYWORD_SCHEMA = {
    type: "ARRAY" as const,
    items: {
        type: "OBJECT" as const,
        properties: {
            keyword: { type: "STRING" as const },
            search_volume: { type: "STRING" as const },
            competition: { type: "STRING" as const },
            cpc_estimate: { type: "STRING" as const },
            relevance_score: { type: "NUMBER" as const },
            intent: { type: "STRING" as const },
            suggestion: { type: "STRING" as const },
        },
        required: ["keyword", "search_volume", "competition", "cpc_estimate", "relevance_score", "intent", "suggestion"],
    },
};

const AD_COPY_SCHEMA = {
    type: "ARRAY" as const,
    items: {
        type: "OBJECT" as const,
        properties: {
            headline1: { type: "STRING" as const },
            headline2: { type: "STRING" as const },
            headline3: { type: "STRING" as const },
            description1: { type: "STRING" as const },
            description2: { type: "STRING" as const },
            display_url: { type: "STRING" as const },
            sitelinks: { type: "ARRAY" as const, items: { type: "STRING" as const } },
            quality_prediction: { type: "NUMBER" as const },
            rationale: { type: "STRING" as const },
        },
        required: ["headline1", "headline2", "headline3", "description1", "description2", "display_url", "sitelinks", "quality_prediction", "rationale"],
    },
};

const QS_AUDIT_SCHEMA = {
    type: "OBJECT" as const,
    properties: {
        overall_score: { type: "NUMBER" as const },
        ad_relevance: { type: "NUMBER" as const },
        landing_page_experience: { type: "NUMBER" as const },
        expected_ctr: { type: "NUMBER" as const },
        issues: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    severity: { type: "STRING" as const },
                    area: { type: "STRING" as const },
                    detail: { type: "STRING" as const },
                    fix: { type: "STRING" as const },
                },
                required: ["severity", "area", "detail", "fix"],
            },
        },
        recommendations: { type: "ARRAY" as const, items: { type: "STRING" as const } },
    },
    required: ["overall_score", "ad_relevance", "landing_page_experience", "expected_ctr", "issues", "recommendations"],
};

const BID_STRATEGY_SCHEMA = {
    type: "OBJECT" as const,
    properties: {
        strategy_name: { type: "STRING" as const },
        description: { type: "STRING" as const },
        target_cpa: { type: "STRING" as const },
        target_roas: { type: "STRING" as const },
        daily_budget_suggestion: { type: "STRING" as const },
        keyword_bids: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    keyword: { type: "STRING" as const },
                    suggested_bid: { type: "STRING" as const },
                    reason: { type: "STRING" as const },
                },
                required: ["keyword", "suggested_bid", "reason"],
            },
        },
        forecast: {
            type: "OBJECT" as const,
            properties: {
                impressions: { type: "STRING" as const },
                clicks: { type: "STRING" as const },
                conversions: { type: "STRING" as const },
                cost: { type: "STRING" as const },
            },
            required: ["impressions", "clicks", "conversions", "cost"],
        },
    },
    required: ["strategy_name", "description", "target_cpa", "target_roas", "daily_budget_suggestion", "keyword_bids", "forecast"],
};

const CAMPAIGN_AUDIT_SCHEMA = {
    type: "OBJECT" as const,
    properties: {
        score: { type: "NUMBER" as const },
        grade: { type: "STRING" as const },
        summary: { type: "STRING" as const },
        strengths: { type: "ARRAY" as const, items: { type: "STRING" as const } },
        weaknesses: { type: "ARRAY" as const, items: { type: "STRING" as const } },
        action_items: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    priority: { type: "STRING" as const },
                    action: { type: "STRING" as const },
                    expected_impact: { type: "STRING" as const },
                },
                required: ["priority", "action", "expected_impact"],
            },
        },
    },
    required: ["score", "grade", "summary", "strengths", "weaknesses", "action_items"],
};

// ── 通用 Gemini API 调用 ──
async function callSEMGemini<T>(promptText: string, schema: any): Promise<T> {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key 缺失，请在 .env 中设置 VITE_GEMINI_API_KEY");
    }

    const systemInstruction = `你是一位顶级的 SEM（搜索引擎营销）专家和数据分析师。
你精通 Google Ads、百度推广、必应广告平台。
你的分析必须基于真实的行业数据洞察，给出可操作的建议。
所有输出必须为中文。
数据格式准确，预测要合理。`;

    const getModel = (name: string) => genAI.getGenerativeModel({
        model: name,
        systemInstruction,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    let modelName = PRIMARY_MODEL;

    try {
        console.log(`[SEM Service] 调用 ${modelName}...`);
        const model = getModel(modelName);
        const result = await model.generateContent([{ text: promptText }]);
        const text = result.response.text();
        return JSON.parse(text) as T;
    } catch (primaryError: any) {
        console.warn(`[SEM Service] 主模型失败，回退到 ${FALLBACK_MODEL}:`, primaryError.message);
        modelName = FALLBACK_MODEL;
        try {
            const fallbackModel = getModel(modelName);
            const result = await fallbackModel.generateContent([{ text: promptText }]);
            const text = result.response.text();
            return JSON.parse(text) as T;
        } catch (fallbackError: any) {
            console.error("[SEM Service] 回退模型也失败:", fallbackError);
            throw new Error("SEM AI 分析失败: " + (fallbackError.message || "未知错误"));
        }
    }
}

// ── 服务导出 ──
export const SEMService = {
    /**
     * 关键词智能拓展与分析
     */
    async analyzeKeywords(params: {
        seed_keywords: string;
        industry: string;
        budget?: string;
        target_region?: string;
    }): Promise<KeywordInsight[]> {
        const prompt = `作为 SEM 关键词分析专家，请对以下种子关键词进行深度分析和拓展：

种子关键词: ${params.seed_keywords}
行业: ${params.industry}
${params.budget ? `预算范围: ${params.budget}` : ''}
${params.target_region ? `目标区域: ${params.target_region}` : '目标区域: 中国大陆'}

请提供 8-12 个相关关键词（包含种子词和拓展词），每个包括：
- 预估月搜索量
- 竞争程度（高/中/低）
- 预估 CPC
- 与种子词的相关度评分（0-100）
- 搜索意图分析
- 优化建议

关键词应覆盖：品牌词、产品词、竞品词、长尾词、问答词等多种类型。`;

        return await callSEMGemini<KeywordInsight[]>(prompt, KEYWORD_SCHEMA);
    },

    /**
     * AI 广告文案生成
     */
    async generateAdCopy(params: {
        product: string;
        keywords: string;
        usp: string;
        tone?: string;
        landing_url?: string;
    }): Promise<AdCopyVariant[]> {
        const prompt = `作为搜索广告文案专家，请为以下产品生成高质量的搜索广告创意：

产品/服务: ${params.product}
核心关键词: ${params.keywords}
核心卖点 (USP): ${params.usp}
${params.tone ? `品牌调性: ${params.tone}` : '品牌调性: 专业可信'}
${params.landing_url ? `落地页 URL: ${params.landing_url}` : ''}

请生成 3 组广告创意变体，每组包含：
- 3 个标题（每个不超过 30 字符）
- 2 个描述（每个不超过 90 字符）
- 显示 URL
- 4 个附加链接建议
- 预测质量得分（1-10）
- 创意策略说明

文案要求：包含关键词、突出差异化、有明确的 CTA、符合广告平台规范。`;

        return await callSEMGemini<AdCopyVariant[]>(prompt, AD_COPY_SCHEMA);
    },

    /**
     * 质量得分诊断
     */
    async auditQualityScore(params: {
        keyword: string;
        ad_text: string;
        landing_page_desc: string;
    }): Promise<QualityScoreAudit> {
        const prompt = `作为 Google Ads 质量得分优化专家，请诊断以下广告组合的质量得分：

关键词: ${params.keyword}
广告文案: ${params.ad_text}
落地页描述: ${params.landing_page_desc}

请从以下维度评分（1-10）：
1. 广告相关性
2. 着陆页体验
3. 预期点击率
4. 综合质量得分

并列出所有问题（标注严重程度：高/中/低），以及具体的优化建议。`;

        return await callSEMGemini<QualityScoreAudit>(prompt, QS_AUDIT_SCHEMA);
    },

    /**
     * 出价策略建议
     */
    async suggestBidStrategy(params: {
        keywords: string;
        daily_budget: string;
        goal: string;
        industry: string;
    }): Promise<BidStrategy> {
        const prompt = `作为 SEM 出价策略专家，请为以下广告计划制定最优出价方案：

目标关键词: ${params.keywords}
日预算: ${params.daily_budget}
投放目标: ${params.goal}
行业: ${params.industry}

请提供：
1. 推荐出价策略名称和说明
2. 目标 CPA / ROAS
3. 日预算建议
4. 每个关键词的建议出价和理由
5. 预估效果（展示量、点击量、转化量、花费）`;

        return await callSEMGemini<BidStrategy>(prompt, BID_STRATEGY_SCHEMA);
    },

    /**
     * 广告账户整体诊断
     */
    async auditCampaign(params: {
        campaign_desc: string;
        current_metrics?: string;
        issues?: string;
    }): Promise<CampaignAuditResult> {
        const prompt = `作为 SEM 账户优化顾问，请对以下广告计划进行全面诊断：

计划描述: ${params.campaign_desc}
${params.current_metrics ? `当前指标: ${params.current_metrics}` : ''}
${params.issues ? `已知问题: ${params.issues}` : ''}

请提供：
1. 总体评分（0-100）和等级（A/B/C/D）
2. 一句话总结
3. 优势列表
4. 问题列表
5. 优先级排序的改进行动项（含预期效果）`;

        return await callSEMGemini<CampaignAuditResult>(prompt, CAMPAIGN_AUDIT_SCHEMA);
    },

    /**
     * CSV 数据智能分析 — 深度 SEM 数据诊断 + 每日智能日报
     * 融合专业 SEM 分析 PRD：数据结构定义、清洗规则、4 大分析维度
     */
    async analyzeCSVData(params: {
        csvSummary: string;
        csvContent: string;
        columns: string[];
    }): Promise<CSVAnalysisResult> {
        const prompt = `【任务指令】你是一位高级 SEM 数据分析师，需要对以下百度/Google SEM 广告投放数据（全量数据）进行全面深度分析。

═══ 1. 数据结构定义 (Data Schema) ═══
请按以下逻辑智能匹配 CSV 中的每一列（列名可能有不同叫法）：
- 日期：数据产生的日期（格式：YYYY-MM-DD）
- 计划/方案：推广计划名称，代表不同的业务线或推广策略
- 关键词/营销要点：用户搜索的词，核心分析对象
- 展现量 (Impressions)：广告被看到的次数
- 点击量 (Clicks)：用户点击广告的次数
- 消费 (Cost)：花费的金额（元）
- 点击率 (CTR)：点击量÷展现量（源数据可能为百分比字符串如"1.10%"，需转换为小数 0.011 进行计算）
- 平均点击价格 (CPC)：消费÷点击量（元）
- 质量度 (Quality Score)：关键词质量评分（1-10分），分数越低代表相关性或落地页体验越差

═══ 2. 数据清洗规则 ═══
- 表头处理：源文件可能包含 5-7 行元数据（如"数据生成时间"），请自动识别并跳过，找到包含"日期、计划、关键词"的行作为表头
- 空值处理：忽略"展现量"为 0 的行
- 格式转换：将"点击率"列的 % 去掉并转换为浮点数；将"消费"、"平均点击价格"转换为浮点数

═══ 3. 全量数据信息 ═══
数据概览: ${params.csvSummary}
数据列: ${params.columns.join(', ')}

完整数据内容:
${params.csvContent}

═══ 4. 核心分析目标（必须全部输出） ═══

【基础 KPI】
- overall_summary: 用通俗易懂的语言概括账户现状（优化师总结），包含核心数据
- total_cost / avg_ctr / avg_cpc / total_impressions / total_clicks: 汇总关键指标

【消费透视 spend_analysis】
- high_cost_low_effect: 找出花费最高（Top 5-10）但点击率异常低或零转化的关键词，标注名称、消费、CTR、问题描述
- zero_conversion_waste: 花费 > 0 但点击量极低（或零转化）的关键词，计算总浪费金额，给出浪费金额和关键词列表概述

【质量度诊断 quality_diagnosis】
- low_score_keywords: 统计质量度 < 5 分的关键词数量、这些低分词的消耗占比
- quality_suggestions: 针对低分高消词的具体优化方向（优化创意相关性、修改落地页等）

【流量异常检测 anomaly_detection】
- high_impression_low_ctr: 展现量很高但点击率极低（低于平均水平）的词，可能匹配到非目标用户
- high_cpc_anomaly: CPC 远高于平均水平（> 2倍平均CPC）的异常词

【策略建议 strategy_advice】
- 综合以上分析，给出 3-5 条具体的账户优化建议（否词策略、出价调整、创意优化等）

【传统分析结果】
- risk_alerts / opportunities: 风险与机会
- top_campaigns / worst_campaigns: 最佳/最差计划
- action_items: 今日行动项

请直接基于数据中的实际数值进行分析，不要编造不存在的数据。`;

        return await callSEMGemini<CSVAnalysisResult>(prompt, CSV_ANALYSIS_SCHEMA);
    },

    /**
     * 基于 SEM 数据的 AI 问答对话 — 深度理解百度 SEM 数据结构
     */
    async chatWithData(params: {
        question: string;
        csvSummary: string;
        csvContent: string;
        columns: string[];
        chatHistory?: Array<{ role: string; content: string }>;
    }): Promise<string> {
        if (!GEMINI_API_KEY) {
            throw new Error("Gemini API key 缺失");
        }

        const systemInstruction = `你是一位高级 SEM（搜索引擎营销）数据分析师，精通百度推广、Google Ads 平台。
用户上传了一份 SEM 广告投放数据，你需要基于这些数据回答用户的问题。

═══ 数据结构定义 ═══
以下是各列的业务含义（列名可能有不同叫法，请智能匹配）：
- 日期：数据产生的日期
- 计划/方案：推广计划名称，代表不同的业务线或推广策略
- 关键词/营销要点：用户搜索的词，核心分析对象
- 展现量 (Impressions)：广告被看到的次数
- 点击量 (Clicks)：用户点击广告的次数
- 消费 (Cost)：花费金额（元）
- 点击率 (CTR)：点击量÷展现量（% 格式需转小数计算）
- 平均点击价格 (CPC)：消费÷点击量（元）
- 质量度 (Quality Score)：1-10分，越低越需优化

═══ 数据清洗注意 ═══
- 源文件可能包含 5-7 行元数据，请自动跳过
- 忽略展现量为 0 的行
- 将 CTR 的 % 号去掉转为浮点数

═══ 当前全量数据 ═══
数据概览: ${params.csvSummary}
数据列: ${params.columns.join(', ')}

数据内容:
${params.csvContent}

═══ 回答要求 ═══
- 所有回答必须基于实际数据，给出具体的数值和百分比
- 提供可操作的优化建议（否词策略、出价调整、创意优化等）
- **必须使用完整 Markdown 格式输出**：
  - 使用 Markdown 表格展示关键数据对比（如 Top 10 浪费关键词）
  - 使用一级/二级标题 (##) 组织内容结构
  - 使用加粗 (**Bold**) 强调核心指标
  - 使用无序列表 (-) 陈述观点
- 分析结论用清晰的 Bullet Points 陈述
- 使用中文回答，语言简洁专业
- 如涉及高级分析（消费透视/质量度诊断/流量异常），请深入展开`;

        let modelName = PRIMARY_MODEL;
        const getModel = (name: string) => genAI.getGenerativeModel({
            model: name,
            systemInstruction,
        });

        const buildPrompt = () => {
            let fullPrompt = '';
            if (params.chatHistory && params.chatHistory.length > 0) {
                fullPrompt += '之前的对话:\n';
                params.chatHistory.forEach(msg => {
                    fullPrompt += `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}\n`;
                });
                fullPrompt += '\n';
            }
            fullPrompt += `用户问题: ${params.question}`;
            return fullPrompt;
        };

        try {
            const model = getModel(modelName);
            const result = await model.generateContent([{ text: buildPrompt() }]);
            return result.response.text();
        } catch (e: any) {
            console.warn(`[SEM Chat] 主模型失败，回退:`, e.message);
            try {
                const model = getModel(FALLBACK_MODEL);
                const result = await model.generateContent([{ text: buildPrompt() }]);
                return result.response.text();
            } catch (e2: any) {
                throw new Error("AI 问答失败: " + (e2.message || "未知错误"));
            }
        }
    },
};

// ── CSV 分析结果类型（含 4 大分析维度） ──
export interface CSVAnalysisResult {
    overall_summary: string;          // 优化师总结
    total_cost: string;
    avg_ctr: string;
    avg_cpc: string;
    total_impressions: string;
    total_clicks: string;
    // 4 大分析维度
    spend_analysis: {
        high_cost_low_effect: Array<{ name: string; cost: string; ctr: string; issue: string }>;
        zero_conversion_waste: string;
    };
    quality_diagnosis: {
        low_score_count: string;
        low_score_cost_ratio: string;
        quality_suggestions: string[];
    };
    anomaly_detection: {
        high_impression_low_ctr: Array<{ name: string; impressions: string; ctr: string }>;
        high_cpc_anomaly: Array<{ name: string; cpc: string; avg_cpc: string }>;
    };
    strategy_advice: string[];
    // 传统分析结果
    risk_alerts: Array<{ title: string; detail: string }>;
    opportunities: Array<{ title: string; detail: string }>;
    top_campaigns: Array<{ name: string; cost: string; ctr: string; suggestion: string }>;
    worst_campaigns: Array<{ name: string; issue: string; suggestion: string }>;
    action_items: Array<{ priority: string; action: string; expected_impact: string }>;
}

// ── CSV 分析 Schema（含 4 大分析维度） ──
const CSV_ANALYSIS_SCHEMA = {
    type: "OBJECT" as const,
    properties: {
        overall_summary: { type: "STRING" as const },
        total_cost: { type: "STRING" as const },
        avg_ctr: { type: "STRING" as const },
        avg_cpc: { type: "STRING" as const },
        total_impressions: { type: "STRING" as const },
        total_clicks: { type: "STRING" as const },
        // 消费透视
        spend_analysis: {
            type: "OBJECT" as const,
            properties: {
                high_cost_low_effect: {
                    type: "ARRAY" as const,
                    items: {
                        type: "OBJECT" as const,
                        properties: {
                            name: { type: "STRING" as const },
                            cost: { type: "STRING" as const },
                            ctr: { type: "STRING" as const },
                            issue: { type: "STRING" as const },
                        },
                        required: ["name", "cost", "ctr", "issue"],
                    },
                },
                zero_conversion_waste: { type: "STRING" as const },
            },
            required: ["high_cost_low_effect", "zero_conversion_waste"],
        },
        // 质量度诊断
        quality_diagnosis: {
            type: "OBJECT" as const,
            properties: {
                low_score_count: { type: "STRING" as const },
                low_score_cost_ratio: { type: "STRING" as const },
                quality_suggestions: { type: "ARRAY" as const, items: { type: "STRING" as const } },
            },
            required: ["low_score_count", "low_score_cost_ratio", "quality_suggestions"],
        },
        // 流量异常检测
        anomaly_detection: {
            type: "OBJECT" as const,
            properties: {
                high_impression_low_ctr: {
                    type: "ARRAY" as const,
                    items: {
                        type: "OBJECT" as const,
                        properties: {
                            name: { type: "STRING" as const },
                            impressions: { type: "STRING" as const },
                            ctr: { type: "STRING" as const },
                        },
                        required: ["name", "impressions", "ctr"],
                    },
                },
                high_cpc_anomaly: {
                    type: "ARRAY" as const,
                    items: {
                        type: "OBJECT" as const,
                        properties: {
                            name: { type: "STRING" as const },
                            cpc: { type: "STRING" as const },
                            avg_cpc: { type: "STRING" as const },
                        },
                        required: ["name", "cpc", "avg_cpc"],
                    },
                },
            },
            required: ["high_impression_low_ctr", "high_cpc_anomaly"],
        },
        // 策略建议
        strategy_advice: { type: "ARRAY" as const, items: { type: "STRING" as const } },
        // 传统分析
        risk_alerts: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    title: { type: "STRING" as const },
                    detail: { type: "STRING" as const },
                },
                required: ["title", "detail"],
            },
        },
        opportunities: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    title: { type: "STRING" as const },
                    detail: { type: "STRING" as const },
                },
                required: ["title", "detail"],
            },
        },
        top_campaigns: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    name: { type: "STRING" as const },
                    cost: { type: "STRING" as const },
                    ctr: { type: "STRING" as const },
                    suggestion: { type: "STRING" as const },
                },
                required: ["name", "cost", "ctr", "suggestion"],
            },
        },
        worst_campaigns: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    name: { type: "STRING" as const },
                    issue: { type: "STRING" as const },
                    suggestion: { type: "STRING" as const },
                },
                required: ["name", "issue", "suggestion"],
            },
        },
        action_items: {
            type: "ARRAY" as const,
            items: {
                type: "OBJECT" as const,
                properties: {
                    priority: { type: "STRING" as const },
                    action: { type: "STRING" as const },
                    expected_impact: { type: "STRING" as const },
                },
                required: ["priority", "action", "expected_impact"],
            },
        },
    },
    required: ["overall_summary", "total_cost", "avg_ctr", "avg_cpc", "total_impressions", "total_clicks", "spend_analysis", "quality_diagnosis", "anomaly_detection", "strategy_advice", "risk_alerts", "opportunities", "top_campaigns", "worst_campaigns", "action_items"],
};
