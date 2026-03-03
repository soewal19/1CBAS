import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const INITIAL_SESSIONS = [
    { id: 'A01', user: 'Administrator', host: 'WS-01', startedAt: '08:41', status: 'active' },
    { id: 'A02', user: 'Warehouse', host: 'WH-02', startedAt: '09:07', status: 'idle' },
    { id: 'A03', user: 'Accountant', host: 'AC-03', startedAt: '09:45', status: 'active' }
];

export default function SessionManager() {
    const { showNotification } = useNotifications();
    const [sessions, setSessions] = useState(INITIAL_SESSIONS);

    const terminateSession = (id) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        showNotification(`Session ${id} terminated`, 'success');
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Session Manager</h2>
            <div className="glass-panel overflow-hidden">
                <table className="table-1c w-full">
                    <thead>
                        <tr>
                            <th>Session</th>
                            <th>User</th>
                            <th>Host</th>
                            <th>Started</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session.id}>
                                <td className="font-mono text-xs font-bold">{session.id}</td>
                                <td>{session.user}</td>
                                <td>{session.host}</td>
                                <td>{session.startedAt}</td>
                                <td>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${session.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {session.status}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <button className="btn-1c h-7 px-3 text-xs" onClick={() => terminateSession(session.id)}>
                                        Terminate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
