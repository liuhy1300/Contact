import React from 'react';
import { BrandKitResult } from '../../types/stratagem';
import { Package, Newspaper, FileSpreadsheet, Layout, Mail, Copy, CheckCircle2 } from 'lucide-react';

interface Props {
    data: BrandKitResult;
}

// 品牌工具包结果视图 — 四栏展示 (新闻稿/一页纸/Banner/邀请函)
const BrandKitView: React.FC<Props> = ({ data }) => {
    const [copied, setCopied] = React.useState<string | null>(null);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => (
        <button
            onClick={() => handleCopy(text, label)}
            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200 flex items-center gap-1"
        >
            {copied === label ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
        </button>
    );

    return (
        <div className="space-y-8 animate-fade-in font-sans text-slate-900">
            {/* 头部 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">品牌工具包</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">为 <strong className="text-indigo-600">{data.productName}</strong> 生成的全套营销物料</p>
                    </div>
                </div>
            </div>

            {/* 新闻稿 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">新闻稿 (Press Release)</h3>
                    </div>
                    <CopyButton text={data.pressRelease || ''} label="press" />
                </div>
                <div className="p-6">
                    <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
                        {data.pressRelease}
                    </div>
                </div>
            </div>

            {/* 销售一页纸 + Banner — 双栏 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 一页纸 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide">销售一页纸</h3>
                        </div>
                        <CopyButton
                            text={`${data.onePager?.headline}\n${data.onePager?.subheadline}\n\n${data.onePager?.keyBenefits?.join('\n')}\n\n${data.onePager?.callToAction}`}
                            label="onepager"
                        />
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <h4 className="text-xl font-black text-slate-900 mb-1">{data.onePager?.headline}</h4>
                            <p className="text-sm text-slate-500 font-medium">{data.onePager?.subheadline}</p>
                        </div>
                        <div className="space-y-2">
                            {data.onePager?.keyBenefits?.map((b, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="font-medium">{b}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-center">
                            <span className="text-sm font-bold text-indigo-600">{data.onePager?.callToAction}</span>
                        </div>
                    </div>
                </div>

                {/* Banner 文案 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layout className="w-5 h-5 text-purple-600" />
                            <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide">官网 Banner</h3>
                        </div>
                        <CopyButton
                            text={`${data.bannerCopy?.headline}\n${data.bannerCopy?.subtext}\n[${data.bannerCopy?.ctaButton}]`}
                            label="banner"
                        />
                    </div>
                    <div className="p-6">
                        {/* Banner 预览 */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl text-center space-y-3 shadow-lg">
                            <h4 className="text-2xl font-black tracking-tight">{data.bannerCopy?.headline}</h4>
                            <p className="text-sm text-white/80 font-medium">{data.bannerCopy?.subtext}</p>
                            <div className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-full text-sm font-bold shadow-md">
                                {data.bannerCopy?.ctaButton}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 邀请函 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-amber-600" />
                        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wide">客户邀请函</h3>
                    </div>
                    <CopyButton text={data.emailInvitation || ''} label="email" />
                </div>
                <div className="p-6">
                    <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
                        {data.emailInvitation}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandKitView;
