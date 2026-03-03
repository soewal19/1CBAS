import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const STORAGE_KEY = '1cbas-settings';

const DEFAULT_SETTINGS = {
    compactRows: false,
    autoRefreshEnabled: true,
    autoRefreshSeconds: 30
};

export default function Settings() {
    const { showNotification } = useNotifications();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        } catch {
            setSettings(DEFAULT_SETTINGS);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        showNotification('Settings saved', 'success');
    };

    return (
        <div className="space-y-4 max-w-2xl">
            <h2 className="text-xl font-bold">Settings</h2>

            <div className="glass-panel p-4 space-y-4">
                <label className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-700">Compact table rows</span>
                    <input
                        type="checkbox"
                        checked={settings.compactRows}
                        onChange={(e) => setSettings(prev => ({ ...prev, compactRows: e.target.checked }))}
                    />
                </label>

                <label className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-700">Auto refresh</span>
                    <input
                        type="checkbox"
                        checked={settings.autoRefreshEnabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoRefreshEnabled: e.target.checked }))}
                    />
                </label>

                <label className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-700">Refresh interval (seconds)</span>
                    <input
                        className="input-1c w-24"
                        type="number"
                        min="5"
                        max="600"
                        value={settings.autoRefreshSeconds}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoRefreshSeconds: Number(e.target.value) || 30 }))}
                    />
                </label>

                <div>
                    <button className="btn-primary-1c" onClick={saveSettings}>Save</button>
                </div>
            </div>
        </div>
    );
}
