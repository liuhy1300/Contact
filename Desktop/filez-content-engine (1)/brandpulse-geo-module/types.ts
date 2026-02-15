export interface ModelConfig {
  id: string;
  name: string;
  provider: 'Google' | 'OpenAI' | 'Anthropic' | 'Perplexity';
  icon: string;
}

export interface AnalysisRequest {
  brandName: string;
  keyword: string;
}

export interface Competitor {
  name: string;
  rank: number | null;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

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
  summary: string; // New: Brief summary of the content
  buyingStage: 'Awareness' | 'Consideration' | 'Decision' | 'Unknown'; // New: Buying intent stage
}

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