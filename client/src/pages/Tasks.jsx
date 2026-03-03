import React from 'react';
import { Clock3, ArrowRightCircle } from 'lucide-react';

const TASKS = [
    { id: 1, title: 'Approve pending Purchase Invoices', priority: 'High', age: '2h ago' },
    { id: 2, title: 'Inventory count for Main Warehouse', priority: 'Medium', age: '5h ago' },
    { id: 3, title: 'Re-calculate FIFO for period Q1', priority: 'Low', age: '1d ago' }
];

export default function Tasks() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">All Tasks</h2>
            <div className="glass-panel overflow-hidden">
                {TASKS.map((task) => (
                    <div key={task.id} className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fff9db]">
                        <div>
                            <p className="text-sm font-bold text-slate-800">{task.title}</p>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                                <Clock3 className="h-3 w-3" />
                                <span>{task.age}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'text-rose-600' : task.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'}`}>
                                {task.priority}
                            </span>
                            <ArrowRightCircle className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
