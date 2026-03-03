import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [notificationFeed, setNotificationFeed] = useState([]);

    const showNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.floor(Math.random() * 10000);
        setToasts(prev => [...prev, { id, message, type }]);
        setNotificationFeed(prev => [
            { id, message, type, read: false, createdAt: new Date().toISOString() },
            ...prev
        ].slice(0, 100));

        setTimeout(() => {
            setToasts(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setToasts(prev => prev.filter(n => n.id !== id));
    }, []);

    const markNotificationRead = useCallback((id) => {
        setNotificationFeed(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    }, []);

    const markAllRead = useCallback(() => {
        setNotificationFeed(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotificationFeed = useCallback(() => {
        setNotificationFeed([]);
    }, []);

    const unreadCount = notificationFeed.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                notificationFeed,
                unreadCount,
                markNotificationRead,
                markAllRead,
                clearNotificationFeed
            }}
        >
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 min-w-[320px] max-w-md">
                {toasts.map(n => (
                    <div
                        key={n.id}
                        className={`glass-panel p-4 flex items-start space-x-4 animate-slide-in shadow-2xl border-white/10 ${n.type === 'success' ? 'bg-emerald-500/10' :
                                n.type === 'error' ? 'bg-rose-500/10' :
                                    'bg-primary-500/10'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${n.type === 'success' ? 'text-emerald-400 bg-emerald-500/10' :
                                n.type === 'error' ? 'text-rose-400 bg-rose-500/10' :
                                    'text-primary-400 bg-primary-500/10'
                            }`}>
                            {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {n.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-sm font-bold text-slate-200 leading-tight">{n.message}</p>
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="text-slate-500 hover:text-slate-300 transition-colors pt-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};
