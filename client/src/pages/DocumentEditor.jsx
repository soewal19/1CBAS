import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Save,
    Plus,
    Trash2,
    ArrowLeft,
    Clock,
    CheckCircle,
    ChevronDown,
    MoreHorizontal,
    FileText,
    Calendar,
    ArrowUp,
    ArrowDown,
    Info
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { API_BASE } from '../config/runtime';

// Helper for conditional class names
const classNames = (...classes) => classes.filter(Boolean).join(' ');

export default function DocumentEditor() {
    const { id, type } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const fromId = query.get('from');

    const [document, setDocument] = useState({
        doc_type: type || 'Order',
        status: 'draft',
        document_date: new Date().toISOString(),
        lines: []
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Goods');
    const [counterpartyOpen, setCounterpartyOpen] = useState(false);
    const [warehouseOpen, setWarehouseOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [selectedLine, setSelectedLine] = useState(null);
    const dateInputRef = useRef(null);
    const { showNotification } = useNotifications();

    const getDateInputValue = (raw) => {
        if (!raw) return '';
        const parsed = new Date(raw);
        if (Number.isNaN(parsed.getTime())) return '';
        return parsed.toISOString().slice(0, 10);
    };

    const setDocumentDateFromInput = (datePart) => {
        if (!datePart) return;
        const current = document.document_date ? new Date(document.document_date) : new Date();
        const base = Number.isNaN(current.getTime()) ? new Date() : current;
        const [year, month, day] = datePart.split('-').map(Number);
        const next = new Date(base);
        next.setFullYear(year, month - 1, day);
        setDocument(prev => ({ ...prev, document_date: next.toISOString() }));
    };

    useEffect(() => {
        axios.get(`${API_BASE}/products`).then(res => setProducts(res.data));

        if (id) {
            setLoading(true);
            axios.get(`${API_BASE}/documents/${id}`)
                .then(res => setDocument(res.data))
                .finally(() => setLoading(false));
        } else if (fromId) {
            setLoading(true);
            axios.get(`${API_BASE}/documents/${fromId}`)
                .then(res => {
                    setDocument({
                        ...document,
                        doc_type: type || 'SalesInvoice',
                        lines: res.data.lines.map(l => ({
                            ...l,
                            id: Date.now() + Math.random()
                        }))
                    });
                })
                .finally(() => setLoading(false));
        }
    }, [id, type, fromId]);

    const addLine = async () => {
        try {
            // ensure we have a product list before adding a row
            let prods = products;
            if (prods.length === 0) {
                try {
                    const res = await axios.get(`${API_BASE}/products`);
                    prods = res.data;
                    setProducts(prods);
                } catch (e) {
                    showNotification('Failed to load products', 'error');
                    // continue with fallback
                }
            }
            if (prods.length === 0) {
                // no products available, create a dummy entry so we can still add a line
                prods = [{ id: Date.now(), price: 0 }];
            }
            const firstProduct = prods[0];

            setDocument(prev => ({
                ...prev,
                lines: [...prev.lines, {
                    id: Date.now(),
                    product_id: firstProduct.id,
                    quantity: 1,
                    price: firstProduct.price
                }]
            }));
            showNotification('Item added to grid', 'info');
        } catch (err) {
            console.error('addLine error', err);
            showNotification('Error adding line', 'error');
        }
    };

    // expose helper for tests in non-production env
    if (typeof window !== 'undefined') {
        window.__testAddLine = addLine;
    }

    const removeLine = (lineId) => {
        setDocument(prev => ({
            ...prev,
            lines: prev.lines.filter(l => l.id !== lineId)
        }));
    };

    const updateLine = (lineId, field, value) => {
        setDocument(prev => ({
            ...prev,
            lines: prev.lines.map(l => {
                if (l.id === lineId) {
                    const updated = { ...l, [field]: value };
                    if (field === 'product_id') {
                        const prod = products.find(p => p.id === parseInt(value));
                        if (prod) updated.price = prod.price;
                    }
                    return updated;
                }
                return l;
            })
        }));
    };

    const moveSelectedLine = (direction) => {
        if (selectedLine === null) {
            showNotification('Select a line first', 'warning');
            return;
        }

        const lineIndex = document.lines.findIndex(l => l.id === selectedLine);
        if (lineIndex < 0) {
            showNotification('Selected line not found', 'warning');
            return;
        }

        const offset = direction === 'up' ? -1 : 1;
        const targetIndex = lineIndex + offset;
        if (targetIndex < 0 || targetIndex >= document.lines.length) {
            showNotification(direction === 'up' ? 'Line is already at the top' : 'Line is already at the bottom', 'info');
            return;
        }

        setDocument(prev => {
            const nextLines = [...prev.lines];
            const [line] = nextLines.splice(lineIndex, 1);
            nextLines.splice(targetIndex, 0, line);
            return { ...prev, lines: nextLines };
        });
        showNotification(direction === 'up' ? 'Line moved up' : 'Line moved down', 'success');
    };

    const handleSave = async (shouldClose = false, shouldPost = false) => {
        try {
            const payload = {
                doc_type: document.doc_type,
                lines: document.lines,
                document_date: document.document_date
            };

            let docId = id;
            if (!id) {
                const res = await axios.post(`${API_BASE}/documents`, payload);
                docId = res.data.id;
            } else {
                // update existing header and lines
                await axios.put(`${API_BASE}/documents/${docId}`, payload);
            }

            if (shouldPost) {
                await axios.post(`${API_BASE}/documents/${docId}/post`);
                showNotification(`Document #${docId} posted successfully!`, 'success');
            } else {
                showNotification(`Document #${docId} saved.`, 'success');
            }

            if (shouldClose) {
                navigate('/documents');
            } else if (!id) {
                navigate(`/documents/edit/${docId}`);
            }
        } catch (err) {
            showNotification(err.response?.data?.error || 'Error processing document', 'error');
        }
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            showNotification('Generating document content...', 'info');
            
            const response = await axios.post(`${API_BASE}/documents/generate`, {
                docType: document.doc_type,
                documentDate: document.document_date
            });
            
            if (response.data.lines && response.data.lines.length > 0) {
                setDocument(prev => ({
                    ...prev,
                    lines: [...prev.lines, ...response.data.lines]
                }));
                showNotification(`Generated ${response.data.lines.length} line(s) successfully!`, 'success');
            } else {
                showNotification('No items were generated. Check if products are available.', 'warning');
            }
        } catch (err) {
            showNotification(err.response?.data?.error || 'Error generating content', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = document.lines.reduce((sum, l) => sum + (l.quantity * l.price), 0);
    const isReadOnly = document.status === 'posted';
    const selectedLineIndex = document.lines.findIndex(l => l.id === selectedLine);
    const canMoveUp = selectedLineIndex > 0;
    const canMoveDown = selectedLineIndex >= 0 && selectedLineIndex < document.lines.length - 1;

    const guard = (action) => () => {
        if (isReadOnly) {
            showNotification('Документ в статусе "Posted" — редактирование запрещено', 'warning');
            return;
        }
        return action();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="loader-1c mb-4"></div>
            <p className="text-sm font-bold text-slate-500">Opening Form...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full space-y-4 animate-fade-in bg-[#f2f2f2]">
            {/* 1C Form Toolbar */}
            <div className="flex flex-wrap items-center gap-2 bg-[#f2f2f2] p-1.5 border-b border-[#c0c0c0]">
                <button
                    onClick={guard(() => handleSave(true, true))}
                    className={classNames(
                        "btn-primary-1c h-11 sm:h-7 px-4 shadow-none",
                        isReadOnly && "opacity-50 cursor-not-allowed"
                    )}
                >
                    Post and Close
                </button>
                {id && document.doc_type === 'Order' && (
                    <button
                        onClick={async () => {
                            try {
                                const res = await axios.post(`${API_BASE}/documents/${id}/invoice-factor`);
                                navigate(`/documents/edit/${res.data.id}`);
                            } catch (e) {
                                showNotification(e.response?.data?.error || 'Failed to create invoice factor','error');
                            }
                        }}
                        className="btn-1c h-11 sm:h-7"
                    >InvoiceFactor</button>
                )}
                {id && document.doc_type === 'InvoiceFactor' && (
                    <button
                        onClick={() => navigate(`/documents/new/SalesInvoice?from=${id}`)}
                        className="btn-1c h-11 sm:h-7"
                    >Create SalesInvoice</button>
                )}
                {id && document.doc_type === 'SalesInvoice' && (
                    <button
                        onClick={async () => {
                            try {
                                const res = await axios.post(`${API_BASE}/documents/${id}/tax-invoice`);
                                navigate(`/documents/edit/${res.data.id}`);
                            } catch (e) {
                                showNotification(e.response?.data?.error || 'Failed to create tax invoice','error');
                            }
                        }}
                        className="btn-1c h-11 sm:h-7"
                    >TaxInvoice</button>
                )}
                <button
                    onClick={guard(() => handleSave(false, true))}
                    className="btn-1c h-11 sm:h-7 flex items-center space-x-1"
                >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Post</span>
                </button>
                <button
                    onClick={guard(() => handleSave(false, false))}
                    className="btn-1c h-11 sm:h-7 flex items-center space-x-1"
                >
                    <Save className="h-3.5 w-3.5 text-blue-600" />
                    <span>Write</span>
                </button>
                <div className="h-4 w-px bg-slate-400 mx-2"></div>
                <button
                    onClick={guard(handleGenerate)}
                    className="btn-1c h-11 sm:h-7"
                >Generate...</button>
                <button
                    onClick={() => window.print()}
                    className="btn-1c h-11 sm:h-7"
                >Print</button>
                <div className="hidden sm:block flex-1"></div>
                <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="btn-1c h-11 sm:h-7 px-2 relative"
                ><MoreHorizontal className="h-4 w-4" />
                    {moreMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#c0c0c0] shadow-lg z-20">
                            <div
                                className="w-full px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer"
                                onClick={() => navigate('/documents')}
                            >Close</div>
                        </div>
                    )}
                </button>
            </div>

            <div className="flex-1 bg-white border border-[#c0c0c0] shadow-sm flex flex-col p-4 space-y-6 overflow-auto">
                {/* Header Information */}
                <header className="flex flex-col space-y-4">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600">Number:</span>
                            <input
                                type="text"
                                readOnly
                                value={id ? id.toString().padStart(6, '0') : 'NEW'}
                                className="input-1c w-24 bg-slate-50 font-mono font-bold"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600">Date:</span>
                            <div className="relative">
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={getDateInputValue(document.document_date)}
                                    className="input-1c w-32 pr-8"
                                    onChange={(e) => setDocumentDateFromInput(e.target.value)}
                                    disabled={isReadOnly}
                                />
                                <button
                                    type="button"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                                    onClick={() => {
                                        if (isReadOnly) return;
                                        try {
                                            dateInputRef.current?.showPicker?.();
                                        } catch (_) {
                                            dateInputRef.current?.focus();
                                        }
                                    }}
                                    disabled={isReadOnly}
                                >
                                    <Calendar className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        {isReadOnly && (
                            <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-sm">
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                                <span className="text-[10px] font-bold text-emerald-700 uppercase">Posted</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 max-w-4xl">
                        <div className="flex items-center">
                            <label className="text-xs text-slate-600 w-24 sm:w-32 shrink-0">Counterparty:</label>
                            <div className="flex-1 relative flex">
                                <input
                                    type="text"
                                    readOnly
                                    value="Main Wholesale Client"
                                    className="input-1c flex-1 rounded-r-none border-r-0"
                                />
                                <button
                                    onClick={() => setCounterpartyOpen(!counterpartyOpen)}
                                    className="btn-1c rounded-l-none border-l-[#c0c0c0] px-1.5 relative"
                                ><ChevronDown className="h-3.5 w-3.5" />
                                    {counterpartyOpen && (
                                        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-[#c0c0c0] shadow-lg z-20">
                                            <div className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer" onClick={() => { showNotification('Chosen A', 'info'); setCounterpartyOpen(false); }}>Main Wholesale Client</div>
                                            <div className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer" onClick={() => { showNotification('Chosen B', 'info'); setCounterpartyOpen(false); }}>Secondary Client</div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="text-xs text-slate-600 w-24 sm:w-32 shrink-0">Warehouse:</label>
                            <div className="flex-1 relative flex">
                                <input
                                    type="text"
                                    readOnly
                                    value="Main Warehouse (Primary)"
                                    className="input-1c flex-1 rounded-r-none border-r-0"
                                />
                                <button
                                    onClick={() => setWarehouseOpen(!warehouseOpen)}
                                    className="btn-1c rounded-l-none border-l-[#c0c0c0] px-1.5 relative"
                                ><ChevronDown className="h-3.5 w-3.5" />
                                    {warehouseOpen && (
                                        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-[#c0c0c0] shadow-lg z-20">
                                            <div className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer" onClick={() => { showNotification('Warehouse 1', 'info'); setWarehouseOpen(false); }}>Main Warehouse (Primary)</div>
                                            <div className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer" onClick={() => { showNotification('Warehouse 2', 'info'); setWarehouseOpen(false); }}>Secondary Warehouse</div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="text-xs text-slate-600 w-24 sm:w-32 shrink-0">Document Type:</label>
                            <input
                                type="text"
                                readOnly
                                value={document.doc_type}
                                className="input-1c flex-1 bg-slate-50 font-bold"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="text-xs text-slate-600 w-24 sm:w-32 shrink-0">Currency:</label>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold">USD</span>
                                <span className="text-[10px] text-slate-400 font-mono">(1.0000 rate)</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Tabs Section */}
                <div className="flex flex-col flex-1 min-h-[300px]">
                    <div className="flex items-end space-x-1 border-b border-[#c0c0c0]">
                        <button
                            onClick={() => setActiveTab('Goods')}
                            className={classNames("tab-1c", activeTab === 'Goods' && "tab-1c-active")}
                        >
                            Goods
                        </button>
                        <button
                            onClick={() => setActiveTab('Services')}
                            className={classNames("tab-1c", activeTab === 'Services' && "tab-1c-active")}
                        >
                            Services
                        </button>
                        <button
                            onClick={() => setActiveTab('Additional')}
                            className={classNames("tab-1c", activeTab === 'Additional' && "tab-1c-active")}
                        >
                            Additional Information
                        </button>
                    </div>

                    <div className="flex-1 border-x border-b border-[#c0c0c0] p-0 flex flex-col">
                        {/* Tab Content: Grid Toolbar */}
                        <div className="bg-[#f8f8f8] p-1 border-b border-[#c0c0c0] flex items-center space-x-2">
                            <button
                                onClick={guard(addLine)}
                                className="btn-1c h-6 px-3 flex items-center space-x-1 hover:bg-white"
                            >
                                <Plus className="h-3 w-3 text-emerald-600" />
                                <span className="text-[11px]">Add</span>
                            </button>
                            <button onClick={() => {
                                if (selectedLine !== null) {
                                    showNotification(`Line ${selectedLine} selected`, 'info');
                                } else if (document.lines.length > 0) {
                                    setSelectedLine(document.lines[0].id);
                                    showNotification('First line selected', 'info');
                                } else {
                                    showNotification('No line selected', 'warning');
                                }
                            }} className="btn-1c h-6 px-3 text-[11px] hover:bg-white">Select</button>
                            <div className="h-4 w-px bg-slate-300 mx-1"></div>
                            <button
                                onClick={guard(() => moveSelectedLine('up'))}
                                disabled={!canMoveUp || isReadOnly}
                                className="btn-1c h-6 px-1.5 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                                onClick={guard(() => moveSelectedLine('down'))}
                                disabled={!canMoveDown || isReadOnly}
                                className="btn-1c h-6 px-1.5 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                                onClick={guard(() => {
                                    if (selectedLine !== null) {
                                        removeLine(selectedLine);
                                        setSelectedLine(null);
                                        showNotification('Line removed', 'success');
                                    } else {
                                        showNotification('Select a line first', 'warning');
                                    }
                                })}
                                className="btn-1c h-6 px-1.5 hover:bg-white text-rose-600"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>

                        {/* Grid Table */}
                        <div className="flex-1 overflow-auto bg-white">
                            <table className="table-1c border-none">
                                <thead className="sticky top-0 z-10">
                                    <tr>
                                        <th className="w-8 text-center bg-[#f2f2f2]">N</th>
                                        <th className="bg-[#f2f2f2]">Item Code / Name</th>
                                        <th className="w-24 bg-[#f2f2f2]">Quantity</th>
                                        <th className="w-24 bg-[#f2f2f2]">Unit</th>
                                        <th className="w-32 text-right bg-[#f2f2f2]">Price</th>
                                        <th className="w-32 text-right bg-[#f2f2f2]">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {document.lines.map((line, idx) => (
                                    <tr
                                        key={line.id}
                                        className={classNames(
                                            "group cursor-pointer",
                                            selectedLine === line.id ? "bg-[#fff0b3]" : "hover:bg-[#fff9db]"
                                        )}
                                        onClick={() => setSelectedLine(line.id)}
                                    >
                                            <td className="text-center text-[10px] text-slate-400">{idx + 1}</td>
                                            <td className="p-0">
                                                <select
                                                    className="w-full h-8 px-2 bg-transparent border-none outline-none text-xs font-medium focus:bg-white focus:ring-1 focus:ring-[#ffd700]"
                                                    value={line.product_id}
                                                    onChange={(e) => updateLine(line.id, 'product_id', e.target.value)}
                                                >
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-0">
                                                <input
                                                    type="number"
                                                    className="w-full h-8 px-2 bg-transparent border-none outline-none text-xs text-center focus:bg-white focus:ring-1 focus:ring-[#ffd700]"
                                                    value={line.quantity}
                                                    onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    disabled={isReadOnly}
                                                />
                                            </td>
                                            <td className="text-center text-[10px] text-slate-500 font-bold uppercase">pcs.</td>
                                            <td className="p-0">
                                                <input
                                                    type="number"
                                                    className="w-full h-8 px-2 bg-transparent border-none outline-none text-xs text-right font-mono focus:bg-white focus:ring-1 focus:ring-[#ffd700]"
                                                    value={line.price}
                                                    onChange={(e) => updateLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                                                    disabled={isReadOnly}
                                                />
                                            </td>
                                            <td className="px-3 text-right text-xs font-bold">
                                                {(line.quantity * line.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {document.lines.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center text-slate-300 italic text-xs">
                                                Click "Add" to insert new line items
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Footer */}
                <footer className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
                    <div className="flex items-center space-x-1 group cursor-pointer">
                        <div className="bg-slate-100 p-1 rounded-sm border border-[#c0c0c0]">
                            <Info className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 hover:text-blue-600">Audit Log & System Comments (0)</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Valuation</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-black text-slate-800 tabular-nums">
                                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-[10px] bg-slate-800 text-white px-1 font-bold rounded-sm">USD</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Status bar */}
            <div className="bg-white border-t border-[#c0c0c0] px-3 py-1 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center"><User className="h-2.5 w-2.5 mr-1" /> Administrator</span>
                    <span className="flex items-center"><Clock className="h-2.5 w-2.5 mr-1" /> {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="font-mono">FORM_ID: DOC_EDITOR_V8</div>
            </div>
        </div>
    );
}

function User(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
