import React from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Notifications() {
    const {
        notificationFeed,
        markNotificationRead,
        markAllRead,
        clearNotificationFeed
    } = useNotifications();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Notifications</h2>
                <div className="flex items-center gap-2">
                    <button className="btn-1c h-8 px-3 text-xs" onClick={markAllRead}>
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Mark all read
                    </button>
                    <button className="btn-1c h-8 px-3 text-xs" onClick={clearNotificationFeed}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                {notificationFeed.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                ) : (
                    notificationFeed.map((n) => (
                        <button
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`w-full text-left px-4 py-3 border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fff9db] ${n.read ? '' : 'bg-blue-50/40'}`}
                        >
                            <div className="flex items-start gap-3">
                                <Bell className="h-4 w-4 mt-0.5 text-slate-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{n.message}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
