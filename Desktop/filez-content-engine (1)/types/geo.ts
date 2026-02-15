// ============================================================
// GEO 优化模块 — 类型定义
// ============================================================

// GEO 功能模式
export type GeoMode = 'analysis' | 'sor' | 'citation' | 'factinject' | 'arena';

// AI 模型配置
export interface ModelConfig {
    id: string;
    name: string;
    provider: 'Google' | 'OpenAI' | 'Anthropic' | 'Perplexity';
    icon: string;
    enabled?: boolean; // 引擎开关
}

// 受众角色 Persona
export type Persona = 'cio' | 'procurement' | 'enduser' | 'itadmin' | '';

// 分析请求 — 增强版
export interface AnalysisRequest {
    brandName: string;
    keyword: string;
    persona?: Persona;          // 受众角色
    enabledModels?: string[];   // 启用的模型 ID 列表
}

// 竞品信息
export interface Competitor {
    name: string;
    rank: number | null;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
}

// 单模型品牌分析结果
export interface BrandAnalysis {
    modelId: string;
    modelName: string;
    rawResponse: string;
    isMentioned: boolean;
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'N/A';
    rank: number | null;
    keyPoints: string[];
    citationSources?: string[];
    competitors: Competitor[];
    pros: string[];
    cons: string[];
    summary: string;
    buyingStage: 'Awareness' | 'Consideration' | 'Decision' | 'Unknown';
}

// 聚合统计
export interface AggregatedStats {
    visibilityScore: number;
    avgRank: number | null;
    sentimentBreakdown: {
        positive: number;
        neutral: number;
        negative: number;
    };
    totalMentions: number;
    totalModels: number;
    topCompetitors: { name: string; count: number; avgRank: number }[];
}

// ============================================================
// 功能 1: AI 推荐份额 (Share of Recommendation)
// ============================================================

// 单轮模拟结果
export interface SoRRound {
    query: string;           // 本轮模拟的提问
    isTop1: boolean;         // 品牌是否为第一推荐
    isTop3: boolean;         // 品牌是否在前三
    isExclusive: boolean;    // 是否独占推荐（无竞品）
    rank: number | null;     // 排名
    competitorsMentioned: string[];  // 本轮提到的竞品
}

// SoR 汇总结果
export interface SoRResult {
    brandName: string;
    totalRounds: number;
    top1Rate: number;        // Top1 推荐率 (%)
    top3Rate: number;        // 前三提及率 (%)
    exclusivityRate: number; // 独占性 (%)
    avgRank: number | null;
    rounds: SoRRound[];
    topCompetitors: { name: string; count: number }[];
    insight: string;         // AI 生成的一句话洞察
}

// ============================================================
// 功能 2: 引文溯源地图 (Citation Source Map)
// ============================================================

// 单个引文源
export interface CitationSource {
    url: string;
    title: string;
    domain: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    isOutdated: boolean;     // 是否过期
    publishDate?: string;    // 发布日期（如可推断）
    riskLevel: 'low' | 'medium' | 'high';
    actionSuggestion: string; // 建议操作
}

// 引文溯源结果
export interface CitationMapResult {
    brandName: string;
    keyword: string;
    aiResponse: string;       // AI 原始回答
    sources: CitationSource[];
    riskSummary: string;      // 风险摘要
    priorityActions: string[]; // 优先行动建议
}

// ============================================================
// 功能 3: 事实注入生成器 (Fact Injection)
// ============================================================

// AI 认知缺失项
export interface KnowledgeGap {
    topic: string;           // AI 不知道的内容
    currentAIBelief: string; // AI 目前的认知
    correctFact: string;     // 正确信息
    severity: 'low' | 'medium' | 'high';
}

// 事实注入结果
export interface FactInjectionResult {
    brandName: string;
    gaps: KnowledgeGap[];
    faqContent: string;       // 生成的 FAQ 文本
    jsonLdCode: string;       // 生成的 JSON-LD 结构化数据
    deploymentGuide: string;  // 部署建议
}

// ============================================================
// 功能 4: 场景化竞技场 (Scenario Arena)
// ============================================================

// 预设场景
export interface ScenarioPreset {
    id: string;
    label: string;
    query: string;            // 模拟查询
    competitor: string;       // 主要对手
    description: string;
}

// 场景对抗结果
export interface ScenarioArenaResult {
    scenarioLabel: string;
    query: string;
    brandName: string;
    competitorName: string;
    aiResponse: string;        // AI 原始回答
    brandRank: number | null;
    competitorRank: number | null;
    winner: 'brand' | 'competitor' | 'tie';
    swotGap: {
        brandStrengths: string[];
        brandWeaknesses: string[];
        competitorStrengths: string[];
        competitorWeaknesses: string[];
    };
    rootCause: string;         // 差距根因（如引用了旧数据）
    actionPlan: string;        // 行动建议
}

// ============================================================
// 内容审计（保留原有）
// ============================================================

export interface ContentAuditRequest {
    keyword: string;
    content: string;
}

export interface AuditSuggestion {
    category: 'Authority' | 'Structure' | 'Clarity' | 'Facts';
    status: 'Pass' | 'Warning' | 'Critical';
    message: string;
    fix: string;
}

export interface ContentAuditResult {
    score: number;
    suggestions: AuditSuggestion[];
    missingKeywords: string[];
}

// ============================================================
// 常量
// ============================================================

export const PERSONA_OPTIONS: { id: Persona; label: string; hint: string }[] = [
    { id: '', label: '通用视角', hint: '不指定特定受众' },
    { id: 'cio', label: 'CIO / 技术负责人', hint: '关注安全合规、架构' },
    { id: 'procurement', label: '采购经理', hint: '关注性价比、合同' },
    { id: 'enduser', label: '终端用户', hint: '关注易用性、体验' },
    { id: 'itadmin', label: 'IT 管理员', hint: '关注运维、部署' },
];

export const SCENARIO_PRESETS: ScenarioPreset[] = [
    { id: 'cross-border', label: '跨国大文件传输', query: '跨国企业大文件安全传输解决方案推荐', competitor: 'IBM Aspera', description: '对比跨境传输速度和安全性' },
    { id: 'bank-deploy', label: '银行级本地化部署', query: '银行金融机构文件管理系统本地部署推荐', competitor: '360亿方云', description: '对比私有化部署与合规能力' },
    { id: 'gxp-pharma', label: '生物制药 GxP 合规', query: '生物制药企业GxP合规文档管理系统', competitor: 'Box', description: '对比 GxP 审计追踪与合规认证' },
    { id: 'collab-office', label: '协同办公一体化', query: '企业协同办公文档管理平台推荐', competitor: '飞书', description: '对比文档协作与办公生态集成' },
    { id: 'gov-infosec', label: '政务信创安全', query: '信创环境下政务机关文件安全管理系统', competitor: '蓝凌', description: '对比信创适配与等保合规' },
];

// ============================================================
// 新增类型：仪表盘与引擎状态
// ============================================================

export interface GeoDashboardMetrics {
    sorScore: number;          // AI 推荐份额 (0-100)
    visibilityLevel: 'High' | 'Medium' | 'Low';
    negativeCitations: number; // 负面引文数量
    engineCoverage: number;    // 引擎覆盖数 (x/4)
}

export type EngineStatus = 'online' | 'offline' | 'latency' | 'error';

export interface EngineState {
    id: string;
    name: string;
    status: EngineStatus;
    latency?: number; // ms
}
