import React, { useState } from 'react';
import { LayoutDashboard, Settings as SettingsIcon, Wrench } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import TestHardware from './components/TestHardware';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Terrarium Control
                    </h1>
                    <div className="text-xs text-slate-500">v1.0</div>
                </div>
            </header>

            <main className="container mx-auto p-4 mb-20">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'settings' && <Settings />}
                {activeTab === 'test' && <TestHardware />}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4">
                <div className="container mx-auto flex justify-around">
                    <NavButton
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                        icon={<LayoutDashboard size={24} />}
                        label="Dashboard"
                    />
                    <NavButton
                        active={activeTab === 'test'}
                        onClick={() => setActiveTab('test')}
                        icon={<Wrench size={24} />}
                        label="Test"
                    />
                    <NavButton
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                        icon={<SettingsIcon size={24} />}
                        label="Settings"
                    />
                </div>
            </nav>
        </div>
    );
}

function NavButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
}

export default App;
