import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    FileText,
    TrendingUp,
    Package,
    AlertTriangle,
    ArrowUpRight,
    Clock,
    Calendar,
    Briefcase,
    MoreVertical
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { gsap } from 'gsap';
import { API_BASE } from '../config/runtime';
import { buildDefaultDocuments, DEFAULT_INVENTORY_REPORT } from '../config/defaultData';
import { useDocumentStore } from '../store/documentStore';


export default function Dashboard() {
    const navigate = useNavigate();
    const { socketConnected, initSockets } = useDocumentStore();
    const [stats, setStats] = useState({
        totalSales: 0,
        stockValue: 0,
        pendingOrders: 0,
        lowStockItems: 0
    });

    useEffect(() => {
        initSockets();
    }, [initSockets]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [salesRes, stockRes, docsRes] = await Promise.all([
                    axios.get(`${API_BASE}/reports/sales?start=2024-01-01`),
                    axios.get(`${API_BASE}/reports/inventory`),
                    axios.get(`${API_BASE}/documents`)
                ]);

                const totalSales = (salesRes.data || []).reduce((sum, row) => sum + (row.total_revenue || 0), 0);
                const stockValue = (stockRes.data || []).reduce((sum, item) => sum + (item.total_value || 0), 0);
                // documents endpoint returns { data: [...], pagination: {...} }
                const docsArray = (docsRes.data && docsRes.data.data) || [];
                const pendingOrders = docsArray.filter(d => d.status === 'draft' && d.doc_type === 'Order').length;
                const lowStockItems = (stockRes.data || []).filter(item => item.total_stock < 10).length;

                setStats({ totalSales, stockValue, pendingOrders, lowStockItems });
            } catch (err) {
                console.error("Error fetching stats:", err);
                const fallbackSales = buildDefaultDocuments(20).reduce((sum, row) => sum + (row.total_amount || 0), 0);
                const fallbackStock = DEFAULT_INVENTORY_REPORT.reduce((sum, item) => sum + (item.total_value || 0), 0);
                const fallbackPending = buildDefaultDocuments(20).filter((d) => d.status === 'draft' && d.doc_type === 'Order').length;
                const fallbackLowStock = DEFAULT_INVENTORY_REPORT.filter((item) => item.total_stock < 10).length;
                setStats({
                    totalSales: fallbackSales,
                    stockValue: fallbackStock,
                    pendingOrders: fallbackPending,
                    lowStockItems: fallbackLowStock
                });
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: "Current Sales", value: `$${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Warehouse Assets", value: `$${stats.stockValue.toLocaleString()}`, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Active Orders", value: stats.pendingOrders, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Inventory Alerts", value: stats.lowStockItems, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" }
    ];

    // refs for animation
    const cardsRef = useRef([]);
    const headerRef = useRef(null);

    useEffect(() => {
        // animate cards on mount
        if (cardsRef.current.length) {
            gsap.from(cardsRef.current, {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power2.out'
            });
        }

        // gradient text pulse
        if (headerRef.current) {
            gsap.fromTo(headerRef.current, { scale: 0.95 }, { scale:1, duration:1, repeat:-1, yoyo:true, ease:'sine.inOut' });
        }
    }, []);


    return (
        <div className="space-y-6 animate-fade-in w-full overflow-x-hidden">
            <header className="flex items-center justify-between border-b border-[#c0c0c0] pb-4 mb-6">
                <div>
                    <h1 ref={headerRef} className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Operational Desktop</h1>
                    <p className="text-xs text-slate-500 font-medium">Real-time enterprise overview</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB')}</span>
                    <button onClick={() => navigate('/session-manager')} className="btn-1c">Session Manager</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        ref={el => cardsRef.current[i] = el}
                        className="glass-panel p-4 flex items-center space-x-4"
                    >
                        <div className={classNames("p-3 rounded-sm border border-black/5", card.bg, card.color)}>
                            <card.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{card.title}</p>
                            <p className="text-xl font-bold text-slate-800 tabular-nums">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <div className="lg:col-span-2 glass-panel flex flex-col">
                    <div className="bg-[#e0e0e0] border-b border-[#c0c0c0] px-4 py-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-600">Company To-Do List</span>
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="p-0 overflow-hidden flex-1">
                        {[
                            { task: "Approve pending Purchase Invoices", time: "2h ago", priority: "High" },
                            { task: "Inventory count for 'Main Warehouse'", time: "5h ago", priority: "Medium" },
                            { task: "Re-calculate FIFO for period Q1", time: "1d ago", priority: "Low" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center p-4 border-b border-[#f0f0f0] hover:bg-[#fff9db] transition-colors cursor-pointer group">
                                <div className={classNames(
                                    "w-1 h-10 mr-4 rounded-full",
                                    item.priority === 'High' ? 'bg-rose-500' : item.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'
                                )}></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-black">{item.task}</p>
                                    <div className="flex items-center text-[10px] text-slate-400 mt-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>Added {item.time}</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/tasks')} className="m-4 btn-1c justify-center">View All Tasks</button>
                </div>

                <div className="glass-panel flex flex-col justify-between">
                    <div>
                        <div className="bg-[#e0e0e0] border-b border-[#c0c0c0] px-4 py-2 font-black text-[10px] uppercase tracking-widest text-slate-600">
                            Quick Actions
                        </div>
                        <div className="p-4 space-y-2">
                            <Link to="/documents/new/Order" className="btn-primary-1c w-full py-3 space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Create New Order</span>
                            </Link>
                            <Link to="/documents" className="btn-1c w-full py-3 space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Document Registry</span>
                            </Link>
                            <Link to="/reports" className="btn-1c w-full py-3 space-x-2">
                                <TrendingUp className="h-4 w-4" />
                                <span>Profit Analytics</span>
                            </Link>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-[#f0f0f0]">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">System Health</p>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-600">Database Connection</span>
                            <div className={classNames("w-2 h-2 rounded-full shadow-sm", socketConnected ? "bg-emerald-500 shadow-emerald-500/50" : "bg-rose-500 shadow-rose-500/50")}></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Socket Node Status</span>
                            <div className={classNames("w-2 h-2 rounded-full shadow-sm", socketConnected ? "bg-emerald-500 shadow-emerald-500/50 animate-pulse" : "bg-rose-500 shadow-rose-500/50")}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
