// MailArchitect 编辑面板组件
// 完整配置面板：AI 生成区、模板选择、元数据、Hero、正文、CTA、页脚
// 集成垃圾邮件敏感词检测

import React, { useMemo, useState } from 'react';
import { EmailConfig, TemplateType, ValidationResult } from '../../types/mailArchitect';
import { SPAM_TRIGGER_WORDS } from '../../constants/mailArchitect';
import { polishText, generateFullEmail } from '../../services/MailArchitectService';

interface EditorPanelProps {
    config: EmailConfig;
    onChange: (newConfig: EmailConfig) => void;
}

const MailEditorPanel: React.FC<EditorPanelProps> = ({ config, onChange }) => {
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [promptTopic, setPromptTopic] = useState('');

    // 通用的嵌套字段更新
    const handleInputChange = (section: keyof EmailConfig, key: string, value: any) => {
        onChange({
            ...config,
            [section]: {
                ...(config[section] as any),
                [key]: value,
            },
        });
    };

    // 社交链接更新
    const handleFooterSocialChange = (key: string, value: string) => {
        onChange({
            ...config,
            footer: {
                ...config.footer,
                socials: {
                    ...config.footer.socials,
                    [key]: value
                }
            }
        });
    };

    // 根级字段更新
    const handleRootChange = (key: keyof EmailConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    // AI 润色逻辑
    const handleAiPolish = async (section: 'hero' | 'body', field: string, currentValue: string) => {
        if (!currentValue) return;
        setAiLoading(`${section}-${field}`);
        try {
            const polished = await polishText(currentValue, field === 'headline' ? 'headline' : 'body', config.template);
            handleInputChange(section, field, polished);
        } catch (e) {
            alert("AI 服务暂时不可用，请稍后再试。");
        } finally {
            setAiLoading(null);
        }
    };

    // AI 一键生成邮件内容
    const handleAiGenerate = async () => {
        if (!promptTopic) return;
        setAiLoading('generate-full');
        try {
            const result = await generateFullEmail(promptTopic, config.template);
            if (result) {
                const newConfig = { ...config };
                newConfig.hero = { ...newConfig.hero, headline: result.headline, subheadline: result.subheadline };
                newConfig.body = { ...newConfig.body, content: result.content };
                if (result.ctaText) newConfig.cta = { ...newConfig.cta, text: result.ctaText };
                onChange(newConfig);
            }
        } catch (e) {
            alert("生成失败，请检查网络或 API Key");
        } finally {
            setAiLoading(null);
        }
    };

    // 垃圾邮件敏感词检测
    const validationResult: ValidationResult = useMemo(() => {
        const textToCheck = (config.hero.headline + " " + config.body.content + " " + config.cta.text).toLowerCase();
        const found = SPAM_TRIGGER_WORDS.filter(word => textToCheck.includes(word));
        return {
            isValid: found.length === 0,
            spamWordsFound: found
        };
    }, [config]);

    return (
        <div className="h-full overflow-y-auto bg-white">
            <div className="p-6 space-y-8">

                {/* 面板标题 */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        配置面板
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">定制您的企业级 B2B 邮件。</p>
                </div>

                {/* AI 智能一键生成区域 */}
                <section className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <h3 className="text-sm font-bold text-purple-900">AI 智能一键生成</h3>
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded ml-auto font-medium">Gemini 3 Pro</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="输入主题，例如：企业数字化转型白皮书发布..."
                            value={promptTopic}
                            onChange={(e) => setPromptTopic(e.target.value)}
                            className="flex-1 rounded-md border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                        />
                        <button
                            onClick={handleAiGenerate}
                            disabled={!promptTopic || !!aiLoading}
                            className="bg-purple-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                        >
                            {aiLoading === 'generate-full' ? (
                                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 生成中...</>
                            ) : '生成'}
                        </button>
                    </div>
                </section>

                {/* 模板选择 */}
                <section>
                    <label className="block text-sm font-medium text-gray-700 mb-2">设计语言风格</label>
                    <select
                        value={config.template}
                        onChange={(e) => handleRootChange('template', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-gray-50"
                    >
                        <option value={TemplateType.MODERN_ENTERPRISE}>现代企业 SaaS (Modern B2B)</option>
                        <option value={TemplateType.GARTNER_INSIGHT}>Gartner 权威洞察 (Insight)</option>
                        <option value={TemplateType.MCKINSEY_MINIMAL}>McKinsey 极简战略 (Minimalist)</option>
                    </select>
                </section>

                {/* 元数据 */}
                <section className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">元数据 (Meta)</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">邮件摘要 (Preheader) - <span className="text-red-500">关键</span></label>
                            <input
                                type="text"
                                value={config.preheader}
                                onChange={(e) => handleRootChange('preheader', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                placeholder="在收件箱列表中显示的预览文本..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">浏览器查看链接文案</label>
                            <input
                                type="text"
                                value={config.header.viewInBrowserText}
                                onChange={(e) => handleInputChange('header', 'viewInBrowserText', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">品牌主色调</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config.brandColor}
                                    onChange={(e) => handleRootChange('brandColor', e.target.value)}
                                    className="h-8 w-8 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={config.brandColor}
                                    onChange={(e) => handleRootChange('brandColor', e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 页眉与 Logo */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">页眉与 Logo</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Logo 图片链接</label>
                            <input
                                type="url"
                                value={config.header.logoUrl}
                                onChange={(e) => handleInputChange('header', 'logoUrl', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">官网链接</label>
                            <input
                                type="url"
                                value={config.header.websiteUrl}
                                onChange={(e) => handleInputChange('header', 'websiteUrl', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Hero 区域 */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">首屏内容 (Hero)</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">主图链接</label>
                            <input
                                type="url"
                                value={config.hero.imageUrl}
                                onChange={(e) => handleInputChange('hero', 'imageUrl', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs text-gray-500">主标题</label>
                                <button
                                    onClick={() => handleAiPolish('hero', 'headline', config.hero.headline)}
                                    className="text-[10px] text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full"
                                    disabled={!!aiLoading}
                                >
                                    {aiLoading === 'hero-headline' ? '...' : '✨ AI 润色'}
                                </button>
                            </div>
                            <input
                                type="text"
                                value={config.hero.headline}
                                onChange={(e) => handleInputChange('hero', 'headline', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">副标题</label>
                            <input
                                type="text"
                                value={config.hero.subheadline}
                                onChange={(e) => handleInputChange('hero', 'subheadline', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* 邮件正文 */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">邮件正文</h3>
                    <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs text-gray-500">内容</label>
                            <button
                                onClick={() => handleAiPolish('body', 'content', config.body.content)}
                                className="text-[10px] text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full"
                                disabled={!!aiLoading}
                            >
                                {aiLoading === 'body-content' ? '...' : '✨ AI 润色'}
                            </button>
                        </div>
                        <textarea
                            rows={8}
                            value={config.body.content}
                            onChange={(e) => handleInputChange('body', 'content', e.target.value)}
                            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 border p-2 text-sm ${validationResult.isValid ? 'border-gray-300 focus:border-blue-500' : 'border-red-300 focus:border-red-500'
                                }`}
                        />
                        {/* 垃圾邮件敏感词提示 */}
                        {!validationResult.isValid && (
                            <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-2">
                                <div className="flex">
                                    <div className="ml-2">
                                        <p className="text-xs text-red-700">
                                            <span className="font-bold">发现敏感词:</span> {validationResult.spamWordsFound.map(w => `"${w}"`).join(', ')}。建议修改以提高送达率。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-3">
                        <label className="block text-xs text-gray-500 mb-1">落款签名</label>
                        <textarea
                            rows={3}
                            value={config.body.signature}
                            onChange={(e) => handleInputChange('body', 'signature', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                        />
                    </div>
                </section>

                {/* CTA 行动号召 */}
                <section className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider">行动号召 (CTA)</h3>
                        <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={config.cta.enabled} onChange={(e) => handleInputChange('cta', 'enabled', e.target.checked)} className="sr-only peer" />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {config.cta.enabled && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-blue-700 mb-1">按钮文案</label>
                                <input
                                    type="text"
                                    value={config.cta.text}
                                    onChange={(e) => handleInputChange('cta', 'text', e.target.value)}
                                    className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-blue-700 mb-1">跳转链接</label>
                                <input
                                    type="url"
                                    value={config.cta.url}
                                    onChange={(e) => handleInputChange('cta', 'url', e.target.value)}
                                    className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* 页脚与合规 */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">页脚与合规</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">公司名称 (版权声明)</label>
                            <input
                                type="text"
                                value={config.footer.companyName}
                                onChange={(e) => handleInputChange('footer', 'companyName', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">物理地址</label>
                            <input
                                type="text"
                                value={config.footer.address}
                                onChange={(e) => handleInputChange('footer', 'address', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">退订文案</label>
                            <input
                                type="text"
                                value={config.footer.unsubscribeText}
                                onChange={(e) => handleInputChange('footer', 'unsubscribeText', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                            />
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-2">社交链接 (可选)</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs w-12 text-gray-500">LinkedIn</span>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/company/..."
                                        value={config.footer.socials.linkedin || ''}
                                        onChange={(e) => handleFooterSocialChange('linkedin', e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 border p-1.5 text-xs"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs w-12 text-gray-500">Website</span>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={config.footer.socials.website || ''}
                                        onChange={(e) => handleFooterSocialChange('website', e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 border p-1.5 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-12"></div> {/* 底部间距 */}
            </div>
        </div>
    );
};

export default MailEditorPanel;
