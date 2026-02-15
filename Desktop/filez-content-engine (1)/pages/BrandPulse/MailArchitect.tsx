// MailArchitect B2B — EDM 营销模块主页面
// 左侧编辑面板 + 右侧实时 MJML 预览

import React, { useState, useEffect } from 'react';
import { EmailConfig } from '../../types/mailArchitect';
import { DEFAULT_CONFIG } from '../../constants/mailArchitect';
import { generateHtml } from '../../services/mjmlGenerator';
import MailEditorPanel from '../../components/MailArchitect/MailEditorPanel';
import MailPreviewPanel from '../../components/MailArchitect/MailPreviewPanel';

const MailArchitect: React.FC = () => {
    const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG);
    const [generatedHtml, setGeneratedHtml] = useState<string>('');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    // 当配置变化时，实时编译 MJML → HTML
    useEffect(() => {
        const { html } = generateHtml(config);
        setGeneratedHtml(html);
    }, [config]);

    // 复制 HTML 到剪贴板
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedHtml);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch (err) {
            console.error('复制失败', err);
        }
    };

    // 发送测试邮件 (占位)
    const handleSendTest = () => {
        alert("在真实应用中，这将调用 SendGrid/AWS SES API 发送测试邮件。");
    };

    return (
        <div className="flex h-full w-full overflow-hidden font-sans">
            {/* 左侧编辑面板 (40%) */}
            <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 z-20 flex flex-col border-r border-gray-200 bg-white">

                {/* 应用头部 */}
                <div className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">M</div>
                        <span className="font-bold text-gray-800 text-lg tracking-tight">MailArchitect</span>
                    </div>
                    <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">B2B 旗舰版</div>
                </div>

                {/* 可滚动表单 */}
                <div className="flex-1 overflow-hidden">
                    <MailEditorPanel config={config} onChange={setConfig} />
                </div>

                {/* 底部操作栏 */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white space-y-3">
                    <button
                        onClick={handleCopy}
                        className={`w-full py-3 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 ${copyStatus === 'copied' ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    >
                        {copyStatus === 'copied' ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                已复制 HTML
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                复制 HTML 代码
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleSendTest}
                        className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        发送测试邮件
                    </button>
                </div>
            </div>

            {/* 右侧预览区域 (60%) */}
            <div className="flex-1 bg-gray-100 overflow-hidden relative">
                <MailPreviewPanel html={generatedHtml} />
            </div>
        </div>
    );
};

export default MailArchitect;
