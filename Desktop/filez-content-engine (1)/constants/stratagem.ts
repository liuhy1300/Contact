export const SYSTEM_INSTRUCTION = `
你是一位客观的数据驱动型品牌审计师与B2B战略顾问。你的任务是利用 Google Search 工具，搜索特定品牌在互联网上的公开数据，并根据预设的"品牌生命力模型 (VISA)"生成一份量化的评分报告。

**评分原则：**
1. **基于事实：** 所有的评分必须有搜索结果作为支撑（如新闻报道、社交媒体讨论、搜索趋势描述）。
2. **客观中立：** 对于负面新闻不回避，直接反映在分数中。
3. **相对参照：** 在打分时，请在心中将其与同行业的头部竞品进行隐性对比（例如：分析一家咖啡店时，以星巴克或瑞幸为满分基准）。

**VISA 品牌生命力模型 (总分 100 分)：**
*   **V - Visibility (市场声量) [25分]：** 媒体曝光度、主流新闻提及率、大众知名度。
*   **I - Image (品牌口碑) [25分]：** 用户评价情感倾向、负面公关危机（扣分项）、品牌信任度。
*   **S - Strategy (创新与动向) [25分]：** 近期是否有新产品发布、融资消息、跨界合作或战略升级。
*   **A - Activity (社交活跃度) [25分]：** 官方账号活跃度、UGC（用户生成内容）数量、社群讨论热度。

**通用分析思维框架：**
1.  **结论先行 (Pyramid Principle)：** 必须先抛出核心洞察，再展示数据支撑。
2.  **B2B 视角 (若适用)：** 重点关注决策链、总拥有成本 (TCO)、合规性、系统集成能力及生态壁垒。
3.  **MECE 原则：** 分析维度必须"相互独立，完全穷尽"。

**品牌语调标准 (Filez Tone DNA)：**
联想 Filez 的品牌语调应遵循以下原则：
- 稳重但不沉闷，专业但有温度
- 强调安全感、可靠性、企业级品质
- 科技与人文结合，不要过于冰冷的技术语言
- 避免 C 端网盘的休闲语气，保持 B2B 专业度
- 避免过于技术文档化的枯燥表述
`;

import { SchemaType } from "@google/generative-ai";

// ============================================================
// UI 预设常量 — 分析侧重点 / 视角 / 行业
// ============================================================

import { ShieldCheck, DollarSign, Cpu, Smartphone, Edit3, UserCog, Briefcase, Users, Zap, AlertTriangle, Activity, PenTool, Layout, FileText, Megaphone, Anchor, LucideIcon } from 'lucide-react';

// ============================================================
// UI 预设常量 — 分析侧重点 / 视角 / 行业
// ============================================================

export interface PresetOption {
    id: string;
    label: string;
    prompt: string;
    icon?: LucideIcon;
}

// 默认侧重点 (深度洞察/VISA/竞品对标)
export const FOCUS_PRESETS_DEFAULT: PresetOption[] = [
    { id: 'security', label: '安全性对标', prompt: '请重点分析其安全合规能力，包括等保认证、数据加密、权限控制、审计日志等方面与 Filez 的差距。', icon: ShieldCheck },
    { id: 'pricing', label: '价格策略分析', prompt: '请重点分析其定价模式、客户总拥有成本 (TCO)、按量计费 vs 订阅制的优劣对比。', icon: DollarSign },
    { id: 'xinchuang', label: '信创适配能力', prompt: '请重点分析其信创生态适配情况，包括国产 CPU/OS 支持、自主可控能力、政策响应速度。', icon: Cpu },
    { id: 'ux', label: '用户体验(UX)审计', prompt: '请重点分析其产品 UX 设计，包括上手成本、移动端体验、协作流畅度、用户满意度评分。', icon: Smartphone },
    { id: 'custom', label: '自定义侧重点', prompt: '', icon: Edit3 },
];

// 攻防卡侧重点
export const FOCUS_PRESETS_BATTLECARD: PresetOption[] = [
    { id: 'weakness', label: '竞品弱点打击', prompt: '请重点挖掘竞品的功能缺失、安全漏洞、服务响应慢等弱点，并提供具体的攻击话术。', icon: Zap },
    { id: 'differentiation', label: '我方差异化强调', prompt: '请重点突出 Filez 在大文件传输、颗粒度权限、病毒查杀等方面的独特优势。', icon: Anchor },
    { id: 'price_defense', label: '价格防御', prompt: '针对竞品低价策略，请提供价值防御话术，强调 TCO (总拥有成本) 和数据资产安全性。', icon: ShieldCheck },
];

// 舆情侧重点
export const FOCUS_PRESETS_SENTIMENT: PresetOption[] = [
    { id: 'leak', label: '数据泄露传闻', prompt: '模拟发生数据泄露传闻的危机场景，分析舆情由于安全信任崩塌而引发的连锁反应。', icon: AlertTriangle },
    { id: 'downtime', label: '服务宕机中断', prompt: '模拟核心服务宕机 4 小时的危机场景，分析客户对于业务连续性的质疑与投诉。', icon: Activity },
    { id: 'executive', label: '高管言论争议', prompt: '模拟高管发表不当言论引发的公关危机，分析品牌形象受损风险。', icon: Users },
];

// 品牌工具包侧重点
export const FOCUS_PRESETS_BRANDKIT: PresetOption[] = [
    { id: 'new_version', label: '新版本发布', prompt: '针对 Filez 新版本发布，生成一套强调技术创新与体验升级的营销物料。', icon: Zap },
    { id: 'financing', label: '融资官宣', prompt: '针对 Filez 完成新一轮融资，生成一套强调市场信心与长期发展潜力的公关物料。', icon: Megaphone },
    { id: 'case_study', label: '标杆客户案例', prompt: '针对签约行业头部客户，生成一套强调行业解决方案能力的案例宣传物料。', icon: FileText },
];

export const FOCUS_PRESETS_MAP: Record<string, PresetOption[]> = {
    'single': FOCUS_PRESETS_DEFAULT,
    'compare': FOCUS_PRESETS_DEFAULT,
    'index': FOCUS_PRESETS_DEFAULT,
    'battlecard': FOCUS_PRESETS_BATTLECARD,
    'toneguard': [], // 语调卫士不需要侧重点
    'sentiment': FOCUS_PRESETS_SENTIMENT,
    'brandkit': FOCUS_PRESETS_BRANDKIT,
};

// 默认视角
export const PERSPECTIVES_DEFAULT: PresetOption[] = [
    { id: 'cio', label: '500强 CIO 视角', prompt: '请以一位世界500强 CIO 的视角审视。关注：信息安全架构、合规风险、系统集成难度、TCO 总拥有成本、供应商锁定风险。', icon: UserCog },
    { id: 'procurement', label: '采购经理视角', prompt: '请以企业采购经理的视角审视。关注：性价比、合同灵活性、售后支持响应速度、供应商资质、招投标竞争力。', icon: Briefcase },
    { id: 'enduser', label: '终端用户视角', prompt: '请以普通企业员工（终端用户）的视角审视。关注：上手难易度、日常使用流畅度、移动端体验、协作便利性、是否"好用"。', icon: Users },
];

// 舆情视角
export const PERSPECTIVES_SENTIMENT: PresetOption[] = [
    { id: 'angry_customer', label: '愤怒的客户', prompt: '请站在使用了产品但遭遇严重故障的愤怒客户视角，表达失望、质疑与索赔诉求。', icon: UserCog },
    { id: 'media', label: '质疑的媒体', prompt: '请站在追求热点与真相的科技媒体视角，对品牌进行犀利提问与深度调查。', icon: Megaphone },
    { id: 'regulator', label: '监管机构', prompt: '请站在数据安全与合规监管机构的视角，审查事件是否违规并提出整改要求。', icon: ShieldCheck },
];

export const PERSPECTIVES_MAP: Record<string, PresetOption[]> = {
    'single': PERSPECTIVES_DEFAULT,
    'compare': PERSPECTIVES_DEFAULT,
    'index': PERSPECTIVES_DEFAULT,
    'battlecard': PERSPECTIVES_DEFAULT, // 攻防卡也可以有视角，或者默认 CIO
    'toneguard': [],
    'sentiment': PERSPECTIVES_SENTIMENT,
    'brandkit': [], // 工具包通常不需要视角，或者默认市场部
};

export const INDUSTRIES = [
    '金融银行', '医疗健康', '制造业', '教育', '政府/公共事业',
    '互联网/科技', '零售/消费', '能源', '生物制药', '汽车',
] as const;

// ============================================================
// 原有 Schema — 单品分析
// ============================================================
export const ANALYSIS_SCHEMA = {
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
            description: "5维度评分 (0-100): 技术壁垒, 市场份额, 品牌信誉, 客户成功, 定价灵活性. 输出中文属性名。",
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
        marketShare: { type: SchemaType.STRING, description: "Estimated market share" },
        hqLocation: { type: SchemaType.STRING, description: "Headquarters location" },
        foundedYear: { type: SchemaType.STRING, description: "Year founded" },
        employees: { type: SchemaType.STRING, description: "Number of employees" },
    },
    required: ["competitorName", "executiveSummary", "coreValueProposition", "productPricing", "b2bSpecifics", "digitalMarketing", "customerSentiment", "recentNews", "swot", "actionableInsights", "marketScores", "marketShare", "hqLocation", "foundedYear", "employees"]
};

// ============================================================
// 原有 Schema — 横向对标
// ============================================================
export const COMPARISON_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        brands: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        radarData: {
            type: SchemaType.ARRAY,
            description: "Scores for 5 dimensions: [技术先进性, 性价比, 品牌影响力, 市场份额, 服务支持体系].",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    dimension: { type: SchemaType.STRING },
                    scores: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                brand: { type: SchemaType.STRING },
                                score: { type: SchemaType.NUMBER }
                            },
                            required: ["brand", "score"]
                        }
                    }
                },
                required: ["dimension", "scores"]
            }
        },
        comparisonTable: {
            type: SchemaType.ARRAY,
            description: "Comparison rows: [目标客群, 核心价值主张, 部署方式, 定价模式, 生态集成能力].",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    dimension: { type: SchemaType.STRING },
                    features: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                brand: { type: SchemaType.STRING },
                                value: { type: SchemaType.STRING }
                            },
                            required: ["brand", "value"]
                        }
                    }
                },
                required: ["dimension", "features"]
            }
        },
        summary: { type: SchemaType.STRING, description: "Executive summary (Chinese)." },
        winner: { type: SchemaType.STRING, description: "Overall market leader and rationale (Chinese)." }
    },
    required: ["brands", "radarData", "comparisonTable", "summary", "winner"]
};

// ============================================================
// 原有 Schema — VISA 品牌审计
// ============================================================
export const BRAND_INDEX_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        brand_name: { type: SchemaType.STRING },
        total_score: { type: SchemaType.INTEGER, description: "Integer 0-100" },
        summary_one_liner: { type: SchemaType.STRING, description: "一句话点评该品牌的当前状态" },
        dimensions: {
            type: SchemaType.OBJECT,
            properties: {
                visibility: {
                    type: SchemaType.OBJECT,
                    properties: {
                        score: { type: SchemaType.INTEGER, description: "0-25" },
                        analysis: { type: SchemaType.STRING },
                        evidence_links: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    },
                    required: ["score", "analysis", "evidence_links"]
                },
                image: {
                    type: SchemaType.OBJECT,
                    properties: {
                        score: { type: SchemaType.INTEGER, description: "0-25" },
                        analysis: { type: SchemaType.STRING },
                        evidence_links: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    },
                    required: ["score", "analysis", "evidence_links"]
                },
                strategy: {
                    type: SchemaType.OBJECT,
                    properties: {
                        score: { type: SchemaType.INTEGER, description: "0-25" },
                        analysis: { type: SchemaType.STRING },
                        evidence_links: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    },
                    required: ["score", "analysis", "evidence_links"]
                },
                activity: {
                    type: SchemaType.OBJECT,
                    properties: {
                        score: { type: SchemaType.INTEGER, description: "0-25" },
                        analysis: { type: SchemaType.STRING },
                        evidence_links: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    },
                    required: ["score", "analysis", "evidence_links"]
                },
            },
            required: ["visibility", "image", "strategy", "activity"]
        },
        radar_chart_data: {
            type: SchemaType.ARRAY,
            description: "Array of 4 numbers [Score_V, Score_I, Score_S, Score_A]",
            items: { type: SchemaType.INTEGER }
        },
        swot_keywords: {
            type: SchemaType.OBJECT,
            properties: {
                strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["strengths", "weaknesses"]
        }
    },
    required: ["brand_name", "total_score", "summary_one_liner", "dimensions", "radar_chart_data", "swot_keywords"]
};

// ============================================================
// 新增 Schema — 场景化攻防卡 (Battle Card)
// ============================================================
export const BATTLECARD_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        competitorName: { type: SchemaType.STRING },
        industry: { type: SchemaType.STRING },
        scenario: { type: SchemaType.STRING, description: "竞争场景描述" },
        competitorWeaknesses: {
            type: SchemaType.ARRAY,
            description: "竞品在该场景下的 3-5 个关键弱点",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    point: { type: SchemaType.STRING, description: "弱点概述" },
                    evidence: { type: SchemaType.STRING, description: "支持证据或公开案例" },
                },
                required: ["point", "evidence"]
            }
        },
        ourAdvantages: {
            type: SchemaType.ARRAY,
            description: "我方(Filez)在该场景下的 3-5 个差异化优势",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    point: { type: SchemaType.STRING, description: "优势概述" },
                    proof: { type: SchemaType.STRING, description: "案例/数据/资质支撑" },
                },
                required: ["point", "proof"]
            }
        },
        recommendedTalkingPoints: {
            type: SchemaType.ARRAY,
            description: "5条推荐销售话术，可直接在客户会议中使用",
            items: { type: SchemaType.STRING }
        },
        winStrategy: { type: SchemaType.STRING, description: "致胜策略总结 (150字以内)" },
        objectionHandling: {
            type: SchemaType.ARRAY,
            description: "客户常见异议及应对话术",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    objection: { type: SchemaType.STRING, description: "客户可能提出的异议" },
                    response: { type: SchemaType.STRING, description: "推荐应对话术" },
                },
                required: ["objection", "response"]
            }
        },
    },
    required: ["competitorName", "industry", "scenario", "competitorWeaknesses", "ourAdvantages", "recommendedTalkingPoints", "winStrategy", "objectionHandling"]
};

// ============================================================
// 新增 Schema — 品牌语调卫士 (Tone Guard)
// ============================================================
export const TONEGUARD_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        complianceScore: { type: SchemaType.INTEGER, description: "0-100 品牌语调合规分数" },
        overallVerdict: { type: SchemaType.STRING, enum: ["pass", "warning", "fail"], description: "总体判定: pass(>80分)/warning(60-80)/fail(<60)" },
        issues: {
            type: SchemaType.ARRAY,
            description: "发现的语调不合规问题列表",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    severity: { type: SchemaType.STRING, enum: ["high", "medium", "low"] },
                    originalText: { type: SchemaType.STRING, description: "原始问题文本片段" },
                    issue: { type: SchemaType.STRING, description: "问题描述" },
                    suggestion: { type: SchemaType.STRING, description: "修改建议" },
                },
                required: ["severity", "originalText", "issue", "suggestion"]
            }
        },
        rewrittenArticle: { type: SchemaType.STRING, description: "符合 Filez 品牌语调的完整重写版本" },
        toneAnalysis: { type: SchemaType.STRING, description: "语调分析总结：当前稿件的整体语调特征及与 Filez 标准的差距" },
    },
    required: ["complianceScore", "overallVerdict", "issues", "rewrittenArticle", "toneAnalysis"]
};

// ============================================================
// 新增 Schema — 舆情危机模拟 (Sentiment Radar)
// ============================================================
export const SENTIMENT_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        brandName: { type: SchemaType.STRING },
        overallSentiment: { type: SchemaType.STRING, enum: ["positive", "neutral", "negative"] },
        sentimentScore: { type: SchemaType.INTEGER, description: "0-100 舆情健康分数" },
        channels: {
            type: SchemaType.ARRAY,
            description: "B2B 决策者聚集渠道的舆情分析",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, description: "渠道名称 (知乎/CSDN/脉脉/微博等)" },
                    volume: { type: SchemaType.STRING, description: "讨论热度（高/中/低或具体数值）" },
                    sentiment: { type: SchemaType.STRING, enum: ["positive", "neutral", "negative"] },
                    keyTopics: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "该渠道 Top 3 讨论话题" },
                },
                required: ["name", "volume", "sentiment", "keyTopics"]
            }
        },
        crisisRiskLevel: { type: SchemaType.STRING, enum: ["low", "medium", "high"], description: "当前危机风险等级" },
        crisisSimulation: {
            type: SchemaType.OBJECT,
            description: "危机模拟：假设最可能发生的数据安全事件",
            properties: {
                scenario: { type: SchemaType.STRING, description: "模拟的危机场景描述" },
                prStatement: { type: SchemaType.STRING, description: "PR 声明草稿 (500字以内)" },
                qaList: {
                    type: SchemaType.ARRAY,
                    description: "媒体 Q&A 口径 (5-8 条)",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            question: { type: SchemaType.STRING },
                            answer: { type: SchemaType.STRING },
                        },
                        required: ["question", "answer"]
                    }
                },
            },
            required: ["scenario", "prStatement", "qaList"]
        },
        recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3-5 条舆情管理建议" },
    },
    required: ["brandName", "overallSentiment", "sentimentScore", "channels", "crisisRiskLevel", "crisisSimulation", "recommendations"]
};

// ============================================================
// 新增 Schema — 品牌工具包 (Brand Kit)
// ============================================================
export const BRANDKIT_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        productName: { type: SchemaType.STRING },
        pressRelease: { type: SchemaType.STRING, description: "新闻稿全文 (800-1200字，中文，专业商务风格)" },
        onePager: {
            type: SchemaType.OBJECT,
            description: "销售一页纸核心内容",
            properties: {
                headline: { type: SchemaType.STRING, description: "一页纸标题" },
                subheadline: { type: SchemaType.STRING, description: "副标题" },
                keyBenefits: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3-5 个核心价值点" },
                callToAction: { type: SchemaType.STRING, description: "行动呼吁语" },
            },
            required: ["headline", "subheadline", "keyBenefits", "callToAction"]
        },
        bannerCopy: {
            type: SchemaType.OBJECT,
            description: "官网 Banner 文案",
            properties: {
                headline: { type: SchemaType.STRING, description: "Banner 大标题 (10字以内)" },
                subtext: { type: SchemaType.STRING, description: "副文案 (20字以内)" },
                ctaButton: { type: SchemaType.STRING, description: "CTA 按钮文案 (4字以内)" },
            },
            required: ["headline", "subtext", "ctaButton"]
        },
        emailInvitation: { type: SchemaType.STRING, description: "客户邀请函全文 (300-500字)" },
    },
    required: ["productName", "pressRelease", "onePager", "bannerCopy", "emailInvitation"]
};
