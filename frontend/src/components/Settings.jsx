import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get('/api/settings').then(res => {
            setSettings(res.data);
            setLoading(false);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/api/settings', settings);
            alert('Settings saved!');
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 pb-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Configuration</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <Section title="Zone 1 (Warm Side)">
                <InputGroup label="Day Target Temp (°C)" name="zone1_target_temp_day" value={settings.zone1_target_temp_day} onChange={handleChange} type="number" step="0.5" />
                <InputGroup label="Night Target Temp (°C)" name="zone1_target_temp_night" value={settings.zone1_target_temp_night} onChange={handleChange} type="number" step="0.5" />
            </Section>

            <Section title="Zone 2 (Cool Side)">
                <InputGroup label="Day Target Temp (°C)" name="zone2_target_temp_day" value={settings.zone2_target_temp_day} onChange={handleChange} type="number" step="0.5" />
                <InputGroup label="Night Target Temp (°C)" name="zone2_target_temp_night" value={settings.zone2_target_temp_night} onChange={handleChange} type="number" step="0.5" />
            </Section>

            <Section title="Timing (Day/Night Cycle)">
                <InputGroup label="Day Start Hour (0-23)" name="day_start_hour" value={settings.day_start_hour} onChange={handleChange} type="number" />
                <InputGroup label="Night Start Hour (0-23)" name="night_start_hour" value={settings.night_start_hour} onChange={handleChange} type="number" />
            </Section>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    )
}

function InputGroup({ label, name, value, onChange, type = "text", step }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-slate-400 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                step={step}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
        </div>
    )
}
