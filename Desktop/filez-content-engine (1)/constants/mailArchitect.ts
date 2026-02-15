// MailArchitect B2B 常量 & 默认配置

import { EmailConfig, TemplateType } from '../types/mailArchitect';

// 中文环境下的垃圾邮件敏感词
export const SPAM_TRIGGER_WORDS = [
    '免费', '100%', '大奖', '急', '点击这里', '独家', '无风险', '立即购买',
    '中奖', '保证', '发财', '特价', '限时', '最好', '第一', '绝对',
    'free', 'guarantee', 'winner', 'urgent', '$$$', 'act now'
];

export const DEFAULT_CONFIG: EmailConfig = {
    template: TemplateType.MODERN_ENTERPRISE,
    brandColor: '#003366', // 经典的深蓝企业色
    preheader: '探索企业级解决方案如何提升您的团队效率 - 3分钟阅读',
    header: {
        logoUrl: 'https://via.placeholder.com/150x40/003366/ffffff?text=LOGO',
        websiteUrl: 'https://example.com',
        viewInBrowserText: '在浏览器中查看',
    },
    hero: {
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        headline: '赋能企业数字化转型的关键路径',
        subheadline: '在不确定的市场环境中构建韧性组织',
    },
    body: {
        content: "尊敬的 [姓名],\n\n在当今瞬息万变的商业环境中，决策者面临的最大挑战不仅是选择正确的技术，更是如何在组织内部推动可持续的变革。\n\n根据我们最新的行业洞察报告，成功转型的企业通常具备三个共同特征：敏捷的架构、数据驱动的文化以及以人为本的工具链。\n\n我们为您准备了一份深度的白皮书，详细拆解了这些核心要素。",
        signature: '顺颂商祺,\nMailArchitect 企业服务团队',
    },
    cta: {
        text: '下载白皮书',
        url: 'https://example.com/whitepaper',
        enabled: true,
    },
    footer: {
        companyName: 'MailArchitect Inc.',
        address: '北京市朝阳区中央商务区金融中心 A 座',
        unsubscribeText: '如果您不想继续接收此类邮件，请点击此处退订',
        socials: {
            linkedin: 'https://linkedin.com',
            website: 'https://example.com',
        }
    },
};
