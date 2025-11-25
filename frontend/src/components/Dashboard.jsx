import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Thermometer, Droplets, Lightbulb, Flame } from 'lucide-react';
import History from './History';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/status');
            setData(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to connect to backend");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) return <div className="p-8 text-center animate-pulse">Loading Terrarium Status...</div>;
    if (error) return <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-lg">{error}</div>;

    const { readings, hardware } = data;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zone 1 */}
                <ZoneCard
                    name="Zone 1 (Warm)"
                    temp={readings?.zone1_temp}
                    humidity={readings?.zone1_humidity}
                    heaterOn={hardware?.heat1}
                    lightOn={hardware?.light1}
                />

                {/* Zone 2 */}
                <ZoneCard
                    name="Zone 2 (Cool)"
                    temp={readings?.zone2_temp}
                    humidity={readings?.zone2_humidity}
                    heaterOn={hardware?.heat2}
                    lightOn={false} // No separate light for Zone 2
                />
            </div>

            {/* History Charts */}
            <div className="pt-6 border-t border-slate-800">
                <h2 className="text-xl font-semibold mb-4 text-slate-200">History</h2>
                <History />
            </div>
        </div>
    );
}

function ZoneCard({ name, temp, humidity, heaterOn, lightOn }) {
    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-200 border-b border-slate-700 pb-2">{name}</h2>

            <div className="grid grid-cols-2 gap-4">
                {/* Temperature */}
                <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                        {heaterOn && <Flame className="text-orange-500 animate-pulse" size={20} />}
                    </div>
                    <Thermometer className="text-emerald-400 mb-2" size={32} />
                    <span className="text-3xl font-bold text-white">{temp?.toFixed(1)}°C</span>
                    <span className="text-xs text-slate-400 mt-1">Temperature</span>
                </div>

                {/* Humidity */}
                <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <Droplets className="text-blue-400 mb-2" size={32} />
                    <span className="text-3xl font-bold text-white">{humidity?.toFixed(1)}%</span>
                    <span className="text-xs text-slate-400 mt-1">Humidity</span>
                </div>
            </div>

            {/* Status Indicators */}
            <div className="mt-4 flex gap-3">
                <StatusBadge active={heaterOn} label="Heater" activeColor="bg-orange-500/20 text-orange-400 border-orange-500/50" />
                <StatusBadge active={lightOn} label="Light" activeColor="bg-yellow-500/20 text-yellow-400 border-yellow-500/50" />
            </div>
        </div>
    );
}

function StatusBadge({ active, label, activeColor }) {
    return (
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${active ? activeColor : 'bg-slate-700/50 text-slate-500 border-slate-600'
            }`}>
            {label}: {active ? 'ON' : 'OFF'}
        </div>
    )
}
