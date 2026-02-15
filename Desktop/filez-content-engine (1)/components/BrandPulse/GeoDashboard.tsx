import React from 'react';
import { GeoDashboardMetrics } from '../../types/geo';
import { BarChart3, TrendingUp, AlertTriangle, Globe } from 'lucide-react';

interface GeoDashboardProps {
    metrics: GeoDashboardMetrics;
}

const GeoDashboard: React.FC<GeoDashboardProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-down">
            {/* SoR Metric */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 hover:shadow-md transition-all">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI 推荐份额 (SoR)</div>
                    <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                        {metrics.sorScore}%
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-2">主导地位</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BarChart3 className="w-6 h-6" />
                </div>
            </div>

            {/* Visibility Metric */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-300 hover:shadow-md transition-all">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">品牌可见度</div>
                    <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                        {metrics.visibilityLevel}
                        <span className="text-xs font-medium text-slate-400 ml-2">综合评级</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-6 h-6" />
                </div>
            </div>

            {/* Negative Citations Metric */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-300 hover:shadow-md transition-all">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">负面引文预警</div>
                    <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                        {metrics.negativeCitations}
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded ml-2">需处理</span>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${metrics.negativeCitations > 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <AlertTriangle className="w-6 h-6" />
                </div>
            </div>

            {/* Engine Coverage Metric */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-purple-300 hover:shadow-md transition-all">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">引擎覆盖率</div>
                    <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                        {metrics.engineCoverage}<span className="text-lg text-slate-400 font-bold">/5</span>
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded ml-2">Gemini 待收录</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Globe className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default GeoDashboard;
