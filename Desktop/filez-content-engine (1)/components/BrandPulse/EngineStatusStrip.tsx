import React from 'react';
import { EngineState } from '../../types/geo';

interface EngineStatusStripProps {
    engines: EngineState[];
}

const EngineStatusStrip: React.FC<EngineStatusStripProps> = ({ engines }) => {
    return (
        <div className="flex items-center gap-4 py-3 px-1 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Live Status:</span>
            {engines.map(engine => (
                <div key={engine.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-medium whitespace-nowrap">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(engine.status)} ${engine.status === 'online' ? 'animate-pulse' : ''}`}></div>
                    <span className="text-slate-700">{engine.name}</span>
                    {engine.latency && <span className="text-slate-400 text-[10px]">{engine.latency}ms</span>}
                </div>
            ))}
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'online': return 'bg-emerald-500';
        case 'latency': return 'bg-amber-500';
        case 'offline': return 'bg-red-500';
        default: return 'bg-slate-300';
    }
};

export default EngineStatusStrip;
