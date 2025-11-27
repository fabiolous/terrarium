import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Power, Sun, Thermometer } from 'lucide-react';

export default function TestHardware() {
    const [manualMode, setManualMode] = useState(false);
    const [status, setStatus] = useState({ heat1: false, heat2: false, light1: false, light_pwm: 0 });
    const [pwmValue, setPwmValue] = useState(0);

    useEffect(() => {
        fetchStatus();
        fetchManualMode();
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = () => {
        axios.get('/api/status').then(res => {
            setStatus(res.data.hardware);
            // Only update PWM slider from status if NOT dragging (simplified here by just updating)
            // Ideally we'd separate local slider state from remote state
        });
    };

    const fetchManualMode = () => {
        axios.get('/api/manual/mode').then(res => {
            setManualMode(res.data.manual_mode);
        });
    };

    const toggleManualMode = async () => {
        const newState = !manualMode;
        await axios.post(`/api/manual/mode/${newState}`);
        setManualMode(newState);
    };

    const toggleRelay = async (device) => {
        if (!manualMode) return;
        const newState = !status[device];
        await axios.post(`/api/manual/relay/${device}/${newState}`);
        fetchStatus();
    };

    const handlePwmChange = async (e) => {
        if (!manualMode) return;
        const val = parseInt(e.target.value);
        setPwmValue(val);
        await axios.post(`/api/manual/pwm/${val}`);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div>
                    <h2 className="text-xl font-bold text-white">Manual Control Mode</h2>
                    <p className="text-sm text-slate-400">Pause automatic control to test hardware</p>
                </div>
                <button
                    onClick={toggleManualMode}
                    className={`px-6 py-3 rounded-lg font-bold transition-colors ${manualMode
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                >
                    {manualMode ? 'ENABLED' : 'DISABLED'}
                </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${manualMode ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                {/* Heaters */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                        <Thermometer size={20} /> Heaters
                    </h3>

                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-lg">
                        <span className="text-white font-medium">Heater 1 (Zone 1)</span>
                        <button
                            onClick={() => toggleRelay('heat1')}
                            className={`w-16 h-8 rounded-full transition-colors flex items-center px-1 ${status.heat1 ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                                }`}
                        >
                            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                        </button>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-lg">
                        <span className="text-white font-medium">Heater 2 (Zone 2)</span>
                        <button
                            onClick={() => toggleRelay('heat2')}
                            className={`w-16 h-8 rounded-full transition-colors flex items-center px-1 ${status.heat2 ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                                }`}
                        >
                            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                        </button>
                    </div>
                </div>

                {/* Lights */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                        <Sun size={20} /> Lighting
                    </h3>

                    <div className="p-4 bg-slate-900 rounded-lg space-y-4">
                        <div className="flex justify-between">
                            <span className="text-white font-medium">LED Strip PWM</span>
                            <span className="text-yellow-400 font-mono">{pwmValue}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={pwmValue}
                            onChange={handlePwmChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
