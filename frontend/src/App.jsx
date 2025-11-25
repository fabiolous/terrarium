import React, { useState } from 'react';
import { LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                        Terrarium Control
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4 pb-24">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'settings' && <Settings />}
            </main>

            {/* Bottom Navigation Bar (Mobile First) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4">
                <div className="container mx-auto flex justify-around">
                    <NavButton
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                        icon={<LayoutDashboard size={24} />}
                        label="Dashboard"
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
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    )
}

export default App;
