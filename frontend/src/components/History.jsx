import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function History() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/history').then(res => {
            // Format timestamp
            const formatted = res.data.map(d => ({
                ...d,
                time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setData(formatted);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading History...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-[400px]">
                <h3 className="text-lg font-semibold mb-4 text-slate-200">Temperature History (Last 12h)</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="zone1_temp" name="Zone 1 Temp" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="zone2_temp" name="Zone 2 Temp" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-[400px]">
                <h3 className="text-lg font-semibold mb-4 text-slate-200">Humidity History (Last 12h)</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="zone1_humidity" name="Zone 1 Hum" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="zone2_humidity" name="Zone 2 Hum" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
