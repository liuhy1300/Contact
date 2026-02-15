
import React from 'react';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

const BrandHealthDashboard: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* 品牌情感指数 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <div className="text-sm text-slate-500 font-medium">Brand Sentiment (情感指数)</div>
                    <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        85/100
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Positive</span>
                    </div>
                </div>
            </div>

            {/* 声量份额 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <div className="text-sm text-slate-500 font-medium">Share of Voice (声量份额)</div>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                        <span className="text-blue-600">Filez 40%</span> <span className="text-slate-300">|</span> 百度 35% <span className="text-slate-300">|</span> 360 25%
                    </div>
                </div>
            </div>

            {/* 最新预警 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="overflow-hidden">
                    <div className="text-sm text-slate-500 font-medium flex justify-between">
                        Alert (最新预警)
                        <span className="text-amber-500 text-xs animate-pulse">Live</span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 mt-1 truncate">
                        检测到知乎关于“下载速度慢”的负面讨论，热度上升中...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandHealthDashboard;
