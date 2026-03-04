import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Calendar,
    RefreshCcw,
    TrendingUp,
    Package
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import classNames from 'classnames';
import { API_BASE } from '../config/runtime';

export default function Reports() {
    const [profitReport, setProfitReport] = useState([]);
    const [inventoryReport, setInventoryReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState({ start: '2024-01-01', end: '2024-12-31' });
    const { showNotification } = useNotifications();

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [profitRes, invRes] = await Promise.all([
                axios.get(`${API_BASE}/reports/profits`, { params: { start: period.start, end: period.end } }),
                axios.get(`${API_BASE}/reports/inventory`, { params: { date: period.end } })
            ]);
            setProfitReport(profitRes.data || []);
            setInventoryReport(invRes.data || []);
            showNotification('Report generated successfully', 'success');
        } catch (err) {
            console.error('Report Fetch Error:', err);
            showNotification('Failed to generate report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (field, value) => {
        setPeriod((prev) => {
            const next = { ...prev, [field]: value };
            if (next.start && next.end && next.start > next.end) {
                showNotification('Start date cannot be later than end date', 'warning');
                return prev;
            }
            return next;
        });
    };

    useEffect(() => {
        fetchReports();
    }, [period]);

    const totalProfit = profitReport.reduce((sum, r) => sum + (r.profit || 0), 0);
    const totalInventoryValue = inventoryReport.reduce((sum, i) => sum + (i.total_value || 0), 0);

    const toCsvCell = (value) => {
        const str = value === null || value === undefined ? '' : String(value);
        return `"${str.replace(/"/g, '""')}"`;
    };

    const handleExport = () => {
        const hasProfit = profitReport.length > 0;
        const hasInventory = inventoryReport.length > 0;

        if (!hasProfit && !hasInventory) {
            showNotification('No data to export for selected period', 'warning');
            return;
        }

        const lines = [];
        lines.push(`Report Period,${toCsvCell(`${period.start} -> ${period.end}`)}`);
        lines.push('');

        lines.push('Profitability Matrix');
        lines.push('Item Name,Qty,Revenue,Profit');
        if (hasProfit) {
            profitReport.forEach((r) => {
                lines.push([
                    toCsvCell(r.name),
                    toCsvCell(r.qty_sold || 0),
                    toCsvCell(r.total_revenue || 0),
                    toCsvCell(r.profit || 0)
                ].join(','));
            });
            lines.push(`Net Consolidated Profit,,,${toCsvCell(totalProfit)}`);
        } else {
            lines.push('No profit rows,0,0,0');
        }

        lines.push('');
        lines.push('Active Warehouse Balances');
        lines.push('Asset Name,Stock,Valuation');
        if (hasInventory) {
            inventoryReport.forEach((item) => {
                lines.push([
                    toCsvCell(item.name),
                    toCsvCell(item.total_stock || 0),
                    toCsvCell(item.total_value || 0)
                ].join(','));
            });
            lines.push(`Total Asset Exposure,,${toCsvCell(totalInventoryValue)}`);
        } else {
            lines.push('No inventory rows,0,0');
        }

        const csv = '\uFEFF' + lines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${period.start}_${period.end}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Report exported', 'success');
    };

    return (
        <div className="space-y-4 animate-fade-in flex flex-col h-full w-full overflow-x-hidden">
            <div className="bg-[#f8f8f8] p-3 border border-[#c0c0c0] shadow-sm space-y-3 shrink-0">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">Period:</span>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <input
                                    type="date"
                                    value={period.start}
                                    onChange={(e) => handlePeriodChange('start', e.target.value)}
                                    className="input-1c h-11 sm:h-8 text-xs pr-8"
                                />
                                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            </div>
                            <span className="text-xs text-slate-500">to</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={period.end}
                                    onChange={(e) => handlePeriodChange('end', e.target.value)}
                                    className="input-1c h-11 sm:h-8 text-xs pr-8"
                                />
                                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-[#e0e0e0] pt-2">
                    <button
                        onClick={fetchReports}
                        disabled={loading}
                        className="btn-primary-1c h-11 sm:h-7 space-x-1"
                    >
                        <RefreshCcw className={classNames('h-3.5 w-3.5', loading && 'animate-spin')} />
                        <span>Generate</span>
                    </button>
                    <button onClick={() => window.print()} className="btn-1c h-11 sm:h-7">Print...</button>
                    <button onClick={handleExport} className="btn-1c h-11 sm:h-7">Export</button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white border border-[#c0c0c0] p-6 space-y-10">
                <div className="text-center space-y-1">
                    <h1 className="text-lg font-bold text-black border-b-2 border-slate-900 inline-block px-8 pb-1">Statement of Corporate Profit & Losses</h1>
                    <p className="text-xs text-slate-600 mt-2">Period: {period.start} - {period.end}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <h2 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Profitability Matrix
                        </h2>
                        <table className="table-1c border-t-2 border-slate-800">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th className="text-right">Qty</th>
                                    <th className="text-right">Revenue</th>
                                    <th className="text-right">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profitReport.map((row, i) => (
                                    <tr key={i}>
                                        <td className="font-bold text-xs">{row.name}</td>
                                        <td className="text-right font-mono text-xs">{row.qty_sold}</td>
                                        <td className="text-right text-xs">${(row.total_revenue || 0).toLocaleString()}</td>
                                        <td className="text-right font-bold text-xs text-emerald-700">${(row.profit || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                                    <td colSpan="3" className="text-right text-xs p-3">NET CONSOLIDATED PROFIT:</td>
                                    <td className="text-right text-sm text-black p-3">${totalProfit.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Active Warehouse Balances
                        </h2>
                        <table className="table-1c border-t-2 border-slate-800">
                            <thead>
                                <tr>
                                    <th>Asset Name</th>
                                    <th className="text-right">Stock</th>
                                    <th className="text-right">Valuation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryReport.map((item, i) => (
                                    <tr key={i}>
                                        <td className="font-bold text-xs">{item.name}</td>
                                        <td className="text-right font-mono text-xs">{item.total_stock}</td>
                                        <td className="text-right font-bold text-xs text-slate-700">${(item.total_value || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                                    <td colSpan="2" className="text-right text-xs p-3">TOTAL ASSET EXPOSURE:</td>
                                    <td className="text-right text-sm text-black p-3">${totalInventoryValue.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pt-20 text-[10px] text-slate-400 flex justify-between font-bold">
                    <span>GEN_ID: 1CBAS_RPT_PRFT_2026</span>
                    <div className="flex items-center space-x-4">
                        <span>Administrator: AD</span>
                        <div className="w-1 h-3 bg-slate-300"></div>
                        <span>Page 1 / 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
