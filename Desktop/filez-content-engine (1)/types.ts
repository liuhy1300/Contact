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

export type CategoryKey = keyof PromptConfig;