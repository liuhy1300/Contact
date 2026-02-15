
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
    data: any[];
    keys?: string[]; // If provided, renders multiple radars. If undefined, assumes single 'score' key.
}

// Professional B2B Color Palette (Light Mode Optimized)
// Primary Blue, Emerald, Amber, Red, Indigo
const COLORS = ['#0f172a', '#059669', '#d97706', '#dc2626', '#4f46e5'];

const MarketRadarChart: React.FC<Props> = ({ data, keys }) => {
    // If no keys provided, standard single mode
    if (!keys || keys.length === 0) {
        return (
            <div className="h-64 w-full font-sans">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" /> {/* Light Slate-200 grid */}
                        <PolarAngleAxis
                            dataKey="attribute"
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500, fontFamily: 'system-ui' }} // Slate-500
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="评分"
                            dataKey="score"
                            stroke="#2563eb" // Blue-600
                            fill="#3b82f6"   // Blue-500
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderColor: '#e2e8f0',
                                color: '#0f172a',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                fontSize: '12px',
                                fontWeight: 500
                            }}
                            itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Multi-brand comparison mode
    return (
        <div className="h-80 w-full font-sans">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="attribute"
                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                    {keys.map((key, index) => (
                        <Radar
                            key={key}
                            name={key}
                            dataKey={key}
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.2}
                        />
                    ))}

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            color: '#0f172a',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#475569' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MarketRadarChart;

