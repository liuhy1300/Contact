import React, { useState } from 'react';
import { ComparisonResult } from '../../types/stratagem';
import { Check, X, Minus, TrendingUp, AlertCircle, ArrowRight, Trophy } from 'lucide-react';
import MarketRadarChart from './MarketRadarChart';

interface Props {
    data: ComparisonResult;
}

const ComparisonView: React.FC<Props> = ({ data }) => {
    // Light Mode Palette
    const competitors = data.brands || [];

    // Transform API radarData to Recharts format if needed
    // API returns: [{ dimension: "Tech", scores: [{brand: "A", score: 90}, ...] }, ...]
    // Recharts needs: [{ attribute: "Tech", "A": 90, "B": 80 }, ...]
    const chartData = data.radarData?.map(item => {
        const obj: any = { attribute: item.dimension };
        item.scores.forEach(s => {
            obj[s.brand] = s.score;
        });
        return obj;
    }) || [];

    return (
        <div className="space-y-8 animate-fade-in font-sans text-slate-900">
            {/* 1. High-Level Summary Cards */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 bg-purple-50/50 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Trophy className="w-6 h-6 text-amber-500" />
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Market Leader & Verdict</h3>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{data.winner}</h2>
                    <p className="text-slate-600 leading-relaxed font-medium max-w-4xl">{data.summary}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Radar Chart Comparison */}
                <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-min">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Market Positioning
                    </h4>
                    <div className="-ml-4">
                        <MarketRadarChart data={chartData} keys={competitors} />
                    </div>
                </div>

                {/* 3. Detailed Feature Matrix */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Dimension</th>
                                    {competitors.map((brand, i) => (
                                        <th key={i} className="px-6 py-4 font-bold tracking-wider">{brand}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.comparisonTable?.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{row.dimension}</td>
                                        {competitors.map((brand, i) => {
                                            const feature = row.features.find(f => f.brand === brand);
                                            return (
                                                <td key={i} className="px-6 py-4 text-slate-600 font-medium">
                                                    {feature?.value || '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonView;
