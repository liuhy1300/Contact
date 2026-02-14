export interface BaseOption {
  id: string;
  name: string;
  desc?: string;
  [key: string]: any;
}

export interface Industry extends BaseOption {
  painPoints: string;
}

export interface Product extends BaseOption {
  features: string;
}

export interface Audience extends BaseOption {
  focus: string;
}

export interface LayoutStyle extends BaseOption {
  css: string;
}

export interface Channel extends BaseOption {
  iconName: string; // Storing icon name string instead of component for serialization
}

export interface Competitor extends BaseOption {
  category: string;
  edge: string;
}

export interface PromptConfig {
  roles: BaseOption[];
  products: Product[];
  industries: Industry[];
  audiences: Audience[];
  journeyStages: BaseOption[];
  styles: BaseOption[];
  tones: BaseOption[];
  brands: BaseOption[];
  channels: Channel[];
  ctaStrategies: BaseOption[];
  competitors: Competitor[];
  layoutStyles: LayoutStyle[];
  // Other simpler options
  cmsOptions: BaseOption[];
  multimodalOptions: BaseOption[];
  headlineStrategies: BaseOption[];
  wordCounts: BaseOption[];
  languages: BaseOption[];
  geoStructures: BaseOption[];
  imageStyles: BaseOption[];
  imageRatios: BaseOption[];
  marketingHooks: BaseOption[];
  distributionChannels: BaseOption[];
}

export interface GeneratedPrompt {
  id: string;
  prompt_content: string;
  settings: any;
  created_at: string;
}


export interface MaterialItem {
  id: string;
  type: 'image' | 'document' | 'link';
  name: string;
  url: string; // Storage path or external URL
  meta?: {
    size?: number;
    mimeType?: string;
    description?: string;
    [key: string]: any;
  };
  created_at: string;
}


export interface TemplateData {
  roleId: string;
  productId: string;
  industryId: string;
  audienceId: string;
  journeyStageId: string;
  customAudience: string;
  customPainPoint: string;
  customCoreValue: string;
  customMarketValue: string;
  customScenarios: string;
  customProof: string;
  competitorIds: string[];
  manualCompetitor: string;
  geoQuestion: string;
  geoKeywords: string;
  geoStructureId: string;
  brandId: string;
  marketingHookId: string;
  styleId: string;
  toneId: string;
  headlineStrategyId: string;
  imagePromptsEnabled: boolean;
  imageStyleId: string;
  imageRatioId: string;
  topImage: string;
  middleImage: string;
  bottomImage: string;
  topImageLink: string;
  middleImageLink: string;
  bottomImageLink: string;
  channelId: string;
  distChannelIds: string[];
  ctaStrategyId: string;
  ctaLink: string;
  outputFormat: 'markdown' | 'html';
  layoutStyleId: string;
  cmsOptionId: string;
  wordCountId: string;
  languageId: string;
  knowledgeIds?: string[];
  chkHeadlines?: boolean;
  chkMeta?: boolean;
  chkQuotes?: boolean;
  chkHtmlOnly?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: TemplateData;
  created_at: string;
}


export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  ref_mode: 'smart' | 'strict';
  status?: 'indexing' | 'indexed' | 'failed';
  source_type?: 'pdf' | 'word' | 'url' | 'text';
  slice_count?: number;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  markdown_content: string;
  html_content: string;
  created_at: string;
  title?: string;
  tags?: string[];
}

export interface EditorDocument {
  id: string;
  title: string;
  markdown: string;
  html: string;
  createdAt: number;
}

export type CategoryKey = keyof PromptConfig;