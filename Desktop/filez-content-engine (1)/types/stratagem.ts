export interface SWOTItem {
  content: string;
  implication: string;
}

export interface SWOTAnalysis {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

export interface MarketScore {
  attribute: string;
  score: number; // 0-100
  fullMark: number;
}

export interface NewsItem {
  date: string;
  title: string;
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  url?: string;
}

// B2B 核心维度
export interface B2BMetrics {
  salesModel: string;
  decisionMakers: string;
  integrationEco: string;
  customerSuccess: string;
}

// 深度单品洞察结果
export interface CompetitorAnalysis {
  competitorName: string;
  executiveSummary: string;
  coreValueProposition: {
    sloganAnalysis: string;
    targetAudience: string;
    usp: string;
  };
  productPricing: {
    productMatrix: string[];
    pricingStrategy: string;
    features: {
      highlights: string[];
      missing: string[];
    };
  };
  b2bSpecifics: B2BMetrics;
  digitalMarketing: {
    channels: string[];
    contentStyle: string;
    recentCampaigns: string[];
  };
  customerSentiment: {
    overallScore: number;
    topPraises: string[];
    topComplaints: string[];
  };
  recentNews: NewsItem[];
  swot: SWOTAnalysis;
  actionableInsights: string[];
  marketScores: MarketScore[];
  marketShare: string;
  hqLocation: string;
  foundedYear: string;
  employees: string;
  sources?: { title: string; uri: string }[];
}

// 横向对标结果
export interface ComparisonScore {
  brand: string;
  score: number;
}
export interface ComparisonRadarItem {
  dimension: string;
  scores: ComparisonScore[];
}
export interface ComparisonFeature {
  brand: string;
  value: string;
}
export interface ComparisonRow {
  dimension: string;
  features: ComparisonFeature[];
}
export interface ComparisonResult {
  brands: string[];
  radarData: ComparisonRadarItem[];
  comparisonTable: ComparisonRow[];
  summary: string;
  winner: string;
  sources?: { title: string; uri: string }[];
}

// VISA 品牌审计
export interface VisaDimension {
  score: number;
  analysis: string;
  evidence_links: string[];
}
export interface BrandVitalityResult {
  brand_name: string;
  total_score: number;
  summary_one_liner: string;
  dimensions: {
    visibility: VisaDimension;
    image: VisaDimension;
    strategy: VisaDimension;
    activity: VisaDimension;
  };
  radar_chart_data: number[];
  swot_keywords: {
    strengths: string[];
    weaknesses: string[];
  };
  sources?: { title: string; uri: string }[];
}

// ============================================================
// 新增：场景化攻防卡 (Battle Card)
// ============================================================
export interface BattleCardResult {
  competitorName: string;
  industry: string;
  scenario: string;
  competitorWeaknesses: { point: string; evidence: string }[];
  ourAdvantages: { point: string; proof: string }[];
  recommendedTalkingPoints: string[];       // 推荐话术
  winStrategy: string;                       // 致胜策略总结
  objectionHandling: { objection: string; response: string }[]; // 异议处理
}

// ============================================================
// 新增：品牌语调卫士 (Tone Guard)
// ============================================================
export interface ToneGuardResult {
  complianceScore: number; // 0-100
  overallVerdict: 'pass' | 'warning' | 'fail';
  issues: {
    severity: 'high' | 'medium' | 'low';
    originalText: string;    // 问题文本
    issue: string;           // 问题描述
    suggestion: string;      // 修改建议
  }[];
  rewrittenArticle: string;  // AI 合规重写版本
  toneAnalysis: string;      // 语调分析总结
}

// ============================================================
// 新增：舆情危机模拟 (Sentiment Radar)
// ============================================================
export interface SentimentRadarResult {
  brandName: string;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // 0-100
  channels: {
    name: string;         // 知乎/CSDN/脉脉 等
    volume: string;       // 讨论量
    sentiment: 'positive' | 'neutral' | 'negative';
    keyTopics: string[];  // 热门话题
  }[];
  crisisRiskLevel: 'low' | 'medium' | 'high';
  crisisSimulation: {
    scenario: string;       // 模拟危机场景
    prStatement: string;    // PR声明草稿
    qaList: { question: string; answer: string }[]; // Q&A口径
  };
  recommendations: string[];
}

// ============================================================
// 新增：品牌工具包 (Brand Kit)
// ============================================================
export interface BrandKitResult {
  productName: string;
  pressRelease: string;    // 新闻稿全文
  onePager: {
    headline: string;
    subheadline: string;
    keyBenefits: string[];
    callToAction: string;
  };
  bannerCopy: {
    headline: string;
    subtext: string;
    ctaButton: string;
  };
  emailInvitation: string;  // 客户邀请函
}

// ============================================================
// 扩展请求类型
// ============================================================
export type AnalysisMode = 'single' | 'compare' | 'index' | 'battlecard' | 'toneguard' | 'sentiment' | 'brandkit';

export interface AnalysisRequest {
  competitorName: string;
  competitorNames?: string[];
  brandIndexName?: string;
  mode: AnalysisMode;
  context?: string;
  myProductContext?: string;
  image?: string;
  imageMimeType?: string;
  // 新增字段
  perspective?: string;          // 视角：CIO / 采购经理 / 终端用户
  focusPreset?: string;          // 分析侧重点预设
  industry?: string;             // 行业 (攻防卡用)
  scenario?: string;             // 场景 (攻防卡用)
  articleText?: string;          // 稿件文本 (语调卫士用)
  productSellingPoints?: string; // 产品卖点 (品牌工具包用)
  productNameForKit?: string;    // 产品名称 (品牌工具包用)
}

// 历史记录
export interface HistoryItem {
  id: string;
  timestamp: number;
  type: AnalysisMode;
  title: string;
  summary: string;
  data: CompetitorAnalysis | ComparisonResult | BrandVitalityResult | BattleCardResult | ToneGuardResult | SentimentRadarResult | BrandKitResult;
}

// 向后兼容别名 — BrandIndexView 组件使用
export type BrandIndexAnalysis = BrandVitalityResult;
export type BrandIndexDimension = VisaDimension;
