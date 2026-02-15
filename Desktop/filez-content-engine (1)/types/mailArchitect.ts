// MailArchitect B2B 类型定义

export enum TemplateType {
    GARTNER_INSIGHT = 'GARTNER_INSIGHT', // Gartner 风格：权威、数据驱动、深色头部
    MCKINSEY_MINIMAL = 'MCKINSEY_MINIMAL', // McKinsey 风格：极简、衬线体标题、阅读体验优先
    MODERN_ENTERPRISE = 'MODERN_ENTERPRISE', // 现代企业风格：通透、卡片式、SaaS感
}

export interface EmailConfig {
    template: TemplateType;
    brandColor: string;
    preheader: string; // 邮件摘要 (Preheader Text)，提高打开率的关键
    header: {
        logoUrl: string;
        websiteUrl: string;
        viewInBrowserText: string; // "在浏览器中查看" 链接文本
    };
    hero: {
        imageUrl: string;
        headline: string;
        subheadline: string;
    };
    body: {
        content: string; // Markdown or plain text
        signature: string;
    };
    cta: {
        text: string;
        url: string;
        enabled: boolean;
    };
    footer: {
        companyName: string;
        address: string;
        unsubscribeText: string;
        socials: {
            linkedin?: string;
            twitter?: string;
            website?: string;
        };
    };
}

export interface ValidationResult {
    isValid: boolean;
    spamWordsFound: string[];
}
