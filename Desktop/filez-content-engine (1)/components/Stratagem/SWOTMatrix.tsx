import React from 'react';
import { SWOTAnalysis, SWOTItem } from '../../types/stratagem';
import { ArrowUpCircle, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';

interface Props {
    swot: SWOTAnalysis;
}

const SWOTSection: React.FC<{ title: string; items: SWOTItem[]; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = ({ title, items, icon, color, bgColor, borderColor }) => (
    <div className={`p-5 rounded-xl border ${borderColor} ${bgColor} shadow-sm`}>
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200/50 pb-3">
            {icon}
            <h3 className={`font-bold text-base ${color}`}>{title}</h3>
        </div>
        <ul className="space-y-3">
            {items.map((item, idx) => (
                <li key={idx} className="text-sm">
                    <span className="font-semibold block text-slate-800">{item.content}</span>
                    <span className="text-xs text-slate-500 mt-1 block font-medium">→ {item.implication}</span>
                </li>
            ))}
        </ul>
    </div>
);

const SWOTMatrix: React.FC<Props> = ({ swot }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <SWOTSection
                title="优势 (Strengths)"
                items={swot.strengths}
                icon={<ArrowUpCircle className="text-emerald-600 w-5 h-5" />}
                color="text-emerald-800"
                bgColor="bg-emerald-50"
                borderColor="border-emerald-100"
            />
            <SWOTSection
                title="劣势 (Weaknesses)"
                items={swot.weaknesses}
                icon={<AlertTriangle className="text-orange-500 w-5 h-5" />}
                color="text-orange-800"
                bgColor="bg-orange-50"
                borderColor="border-orange-100"
            />
            <SWOTSection
                title="机会 (Opportunities)"
                items={swot.opportunities}
                icon={<Lightbulb className="text-blue-500 w-5 h-5" />}
                color="text-blue-800"
                bgColor="bg-blue-50"
                borderColor="border-blue-100"
            />
            <SWOTSection
                title="威胁 (Threats)"
                items={swot.threats}
                icon={<ShieldAlert className="text-red-500 w-5 h-5" />}
                color="text-red-800"
                bgColor="bg-red-50"
                borderColor="border-red-100"
            />
        </div>
    );
};

export default SWOTMatrix;
