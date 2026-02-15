// 平面设计模块常量 — 风格预设、品牌色板、场景配置

// 风格预设：每个预设包含名称、描述和 prompt 后缀
export interface StylePreset {
    id: string;
    name: string;
    desc: string;
    promptSuffix: string; // 自动附加到用户 prompt 后面的风格描述
    icon: string; // Emoji 图标
}

export const STYLE_PRESETS: StylePreset[] = [
    {
        id: 'filez-3d',
        name: 'Filez Official 3D',
        desc: '联想 Filez 官方品牌 3D 风格',
        promptSuffix: 'Professional 3D render, glossy surfaces, depth of field, studio lighting, enterprise software aesthetic, purple and blue color scheme, clean modern design, ultra high quality.',
        icon: '🧊'
    },
    {
        id: 'tech-minimal',
        name: 'Tech Minimalist',
        desc: '科技极简，线条感强',
        promptSuffix: 'Minimalist tech style, clean lines, geometric shapes, flat design with subtle gradients, monochrome with accent color, professional, Apple-like product photography aesthetic.',
        icon: '◻️'
    },
    {
        id: 'abstract-data',
        name: 'Abstract Data',
        desc: '抽象数据流，可视化风',
        promptSuffix: 'Abstract data visualization, flowing particles, network nodes, digital matrix, holographic data streams, dark background with glowing elements, futuristic tech aesthetic.',
        icon: '📊'
    },
    {
        id: 'glassmorphism',
        name: 'Glassmorphism',
        desc: '玻璃拟态，毛玻璃质感',
        promptSuffix: 'Glassmorphism design, frosted glass panels, translucent layers, soft blur background, vibrant gradient backdrop, floating UI elements, modern premium aesthetic, high quality rendering.',
        icon: '🪟'
    },
    {
        id: 'ink-wash',
        name: 'Ink Wash',
        desc: '新中式水墨意境',
        promptSuffix: 'Chinese ink wash painting style, sumi-e, flowing brush strokes, minimalist composition, black ink on white, zen aesthetic, traditional with modern twist, elegant and serene.',
        icon: '🖌️'
    },
    {
        id: 'custom',
        name: '自定义',
        desc: '完全自由发挥',
        promptSuffix: '', // 不附加任何额外 prompt
        icon: '✏️'
    }
];

// 产品图精修风格选项
export interface RefineStyle {
    id: string;
    name: string;
    desc: string;
    promptInstruction: string; // 给 AI 的指令
}

export const REFINE_STYLES: RefineStyle[] = [
    {
        id: '3d-glass',
        name: '3D 玻璃悬浮',
        desc: '让截图漂浮在玻璃面板上',
        promptInstruction: 'Transform this screenshot into a stunning 3D floating glass panel composition. Add perspective, depth, glass reflections, subtle shadows, and a clean gradient background. Make it look like a premium product hero image for a website.'
    },
    {
        id: 'minimal-vector',
        name: '极简矢量化',
        desc: '扁平化矢量风格',
        promptInstruction: 'Reimagine this screenshot in a clean, minimalist vector art style. Simplify the UI to flat design with bold colors, remove noise, enhance clarity. Make it suitable for a product marketing page.'
    },
    {
        id: 'macbook-scene',
        name: '嵌入 Macbook 场景',
        desc: '放入笔记本样机中',
        promptInstruction: 'Place this screenshot naturally on a modern laptop screen (MacBook-like device). Add a clean desk environment, soft natural lighting, shallow depth of field. Create a lifestyle product photography look.'
    },
    {
        id: 'dark-tech',
        name: '暗黑科技风',
        desc: '深色背景 + 光效',
        promptInstruction: 'Transform this screenshot into a dark, futuristic tech aesthetic. Add neon glow edges, dark background with subtle particles, holographic reflections, and a high-tech HUD-like frame. Make it look like a sci-fi dashboard.'
    }
];

// Filez 品牌色板
export const BRAND_PALETTE = {
    primary: '#6B3FA0', // 品牌紫
    secondary: '#003366', // 科技蓝
    accent: '#00A3E0', // 亮蓝
    dark: '#1A1A2E', // 深色背景
    light: '#FFFFFF', // 企业白
    gray: '#F4F5F7', // 浅灰
};

// 品牌色强制 prompt
export const BRAND_COLOR_PROMPT = `CRITICAL COLOR CONSTRAINT: The image MUST predominantly use these exact brand colors — Deep Purple (#6B3FA0), Tech Blue (#003366), Bright Blue (#00A3E0), and clean White (#FFFFFF). Do NOT use orange, green, yellow, or any warm colors. The overall palette should feel professional, cool-toned, and enterprise-grade.`;

// Logo 水印设置
export const LOGO_CONFIG = {
    url: 'https://via.placeholder.com/200x60/6B3FA0/ffffff?text=Filez', // 占位 Logo
    opacity: 0.15,
    position: 'bottom-right' as const, // 默认位置
    padding: 24, // 距边距的像素
};

// 海报场景模板
export interface PosterScene {
    id: string;
    name: string;
    desc: string;
    promptHint: string; // 提示 AI 底图风格
}

export const POSTER_SCENES: PosterScene[] = [
    {
        id: 'product-launch',
        name: '产品发布',
        desc: '新品上线、功能更新',
        promptHint: 'Product launch announcement background, modern tech aesthetic with geometric shapes and subtle gradients. Leave significant empty space on the left side for text overlay. Professional, clean, enterprise feel.'
    },
    {
        id: 'holiday',
        name: '节日海报',
        desc: '春节、中秋等节庆',
        promptHint: 'Festive celebration background with elegant, sophisticated style. Chinese festival elements subtly integrated. Leave significant empty space in the center for text overlay. Luxurious and warm mood.'
    },
    {
        id: 'countdown',
        name: '活动倒计时',
        desc: '即将到来的活动',
        promptHint: 'Event countdown background, exciting and dynamic. Abstract speed lines and energy effects. Leave significant empty space on the top half for large countdown numbers and text. High-energy tech feel.'
    },
    {
        id: 'industry-report',
        name: '行业洞察',
        desc: '报告发布、数据解读',
        promptHint: 'Industry insight report background. Abstract data visualization, subtle chart elements, sophisticated and intellectual feel. Leave significant empty space on the right side for text and data points overlay.'
    }
];

// 文字位置选项
export const TEXT_POSITIONS = [
    { id: 'top-left', name: '左上', x: 0.08, y: 0.12 },
    { id: 'center', name: '居中', x: 0.5, y: 0.5 },
    { id: 'bottom-center', name: '底部居中', x: 0.5, y: 0.85 },
] as const;

// 元素工坊类型
export const ELEMENT_TYPES = [
    { id: 'icon-3d', name: '3D 图标', prompt: '3D icon with glossy glass material, single object on pure white background, isolated element, suitable for presentation slide, no text' },
    { id: 'icon-flat', name: '扁平图标', prompt: 'Flat design icon, simple bold shapes, single color accent, pure white background, isolated vector-style element, no text' },
    { id: 'illustration', name: '插画元素', prompt: 'Minimal illustration element, clean lines, professional style, pure white background, isolated decorative element for enterprise use, no text' },
    { id: 'abstract', name: '抽象元素', prompt: 'Abstract geometric shape, modern art element, clean isolated object on pure white background, tech-inspired decorative element, no text' },
];
