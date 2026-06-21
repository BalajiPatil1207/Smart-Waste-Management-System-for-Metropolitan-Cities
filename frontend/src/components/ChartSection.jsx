import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Download } from 'lucide-react';

export default function ChartSection({ activeHistory, handleDownloadPdf, chartRef }) {
    return (
        <div className="glass-panel">
            <div className="chart-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trash2 size={20} /> Fill Level & Odor History</span>
                <button onClick={handleDownloadPdf} className="ping-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <Download size={16}/> Download PDF Report
                </button>
            </div>
            <div className="chart-container" style={{ width: '100%', minHeight: '300px', padding: '10px' }} ref={chartRef}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={activeHistory}>
                        <defs>
                            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient>
                            <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.8} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickFormatter={(tick) => typeof tick === 'string' ? tick.replace(/:\d{2}\s/, ' ') : tick} />
                        <YAxis stroke="#94a3b8" yAxisId="left" />
                        <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                        <Area yAxisId="left" type="monotone" dataKey="level" stroke="#38bdf8" fillOpacity={1} fill="url(#colorLevel)" name="Fill Level (%)" isAnimationActive={false} />
                        <Area yAxisId="right" type="monotone" dataKey="gas" stroke="#34d399" fillOpacity={1} fill="url(#colorGas)" name="Gas (PPM)" isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
