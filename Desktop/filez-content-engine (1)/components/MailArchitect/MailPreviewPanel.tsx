// MailArchitect 邮件预览面板
// 支持 Desktop/Mobile 设备切换 + Dark Mode 模拟

import React, { useState, useEffect } from 'react';

interface PreviewPanelProps {
    html: string;
}

const MailPreviewPanel: React.FC<PreviewPanelProps> = ({ html }) => {
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);

    // 防抖加载状态，避免快速输入时闪烁
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [html]);

    const iframeStyle: React.CSSProperties = {
        width: device === 'mobile' ? '375px' : '100%',
        height: '100%',
        border: 'none',
        transition: 'width 0.3s ease',
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
    };

    return (
        <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} transition-colors duration-300`}>
            {/* 工具栏 */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {/* 桌面端按钮 */}
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`p-2 rounded-md flex items-center justify-center transition-all ${device === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="桌面端预览"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                    {/* 移动端按钮 */}
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`p-2 rounded-md flex items-center justify-center transition-all ${device === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="移动端预览"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Dark Mode 切换 */}
                    <label className="flex items-center cursor-pointer">
                        <span className={`mr-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>暗色模拟</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${darkMode ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>

            {/* 预览区域 */}
            <div className="flex-1 overflow-hidden relative flex justify-center items-start pt-8 pb-8">

                {/* 加载遮罩 */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 z-20 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                <div className={`relative shadow-2xl transition-all duration-300 ${device === 'mobile' ? 'rounded-[2rem] border-[8px] border-gray-800 overflow-hidden h-[700px]' : 'w-full max-w-4xl h-full rounded-md'}`}>
                    <iframe
                        srcDoc={html}
                        title="邮件预览"
                        style={iframeStyle}
                        className="bg-white"
                    />
                </div>
            </div>
        </div>
    );
};

export default MailPreviewPanel;
