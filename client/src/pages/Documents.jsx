import React, { useEffect, useState, useRef } from 'react';
import {
    Plus,
    Search,
    RefreshCcw,
    FileText,
    CheckCircle2,
    Clock,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Filter,
    Eye,
    FileEdit,
    Trash2,
    Calendar,
    Layers,
    ShoppingBag,
    CreditCard
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { useNotifications } from '../context/NotificationContext';
import classNames from 'classnames';

export default function Documents() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef(null);
    const {
        documents,
        pagination,
        isLoading,
        fetchDocuments,
        initSockets,
        setSearch,
        setFilter,
        clearFilters,
        filterTerm,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        deleteDocument,
        socketConnected
    } = useDocumentStore();
    const { showNotification } = useNotifications();

    const [searchTerm, setSearchTerm] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const docTypeOptions = ['', 'PurchaseInvoice', 'SalesInvoice', 'Order', 'InvoiceFactor', 'TaxInvoice'];

    useEffect(() => {
        initSockets();
        fetchDocuments(pagination.page, pagination.limit);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const presetQuery = params.get('q');
        const shouldFocusSearch = params.get('focusSearch') === '1';

        if (presetQuery !== null) {
            setSearchTerm(presetQuery);
            setSearch(presetQuery);
        }

        if (shouldFocusSearch && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }
    }, [location.search, setSearch]);

    const handleRefresh = () => {
        fetchDocuments(pagination.page, pagination.limit);
    };

    const handleSearch = () => {
        setSearch(searchTerm);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleClearFilters = () => {
        clearFilters();
        setSearchTerm('');
        setMenuOpen(false);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchDocuments(newPage, pagination.limit);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (window.confirm('Delete document #' + id + '?')) {
            try {
                await deleteDocument(id);
                showNotification('Document deleted', 'success');
            } catch (e) {
                showNotification('Failed to delete', 'error');
            }
        }
    };

    const DocumentIcon = ({ type }) => {
        switch (type) {
            case 'PurchaseInvoice': return <ShoppingBag className="h-4 w-4 text-blue-500" />;
            case 'SalesInvoice': return <CreditCard className="h-4 w-4 text-emerald-500" />;
            case 'Order': return <Layers className="h-4 w-4 text-amber-500" />;
            default: return <FileText className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4 animate-fade-in w-full overflow-hidden">
            {/* 1C Toolbar */}
            <div className="bg-[#f8f8f8] p-2 border border-[#c0c0c0] shadow-sm flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                    <Link to="/documents/new/Order" className="btn-primary-1c h-11 sm:h-8 space-x-1">
                        <Plus className="h-4 w-4" />
                        <span>Create</span>
                    </Link>
                    <button onClick={handleRefresh} className="btn-1c h-11 sm:h-8 space-x-1">
                        <RefreshCcw className={classNames("h-4 w-4", isLoading && "animate-spin")} />
                        <span>Refresh</span>
                    </button>
                    <div className="w-px h-6 bg-[#c0c0c0] mx-2"></div>
                    <div className="flex flex-wrap items-center gap-2">
                    <button className="btn-1c h-11 sm:h-8 space-x-1" type="button">
                        <Filter className="h-4 w-4" />
                        <span>Filter Type</span>
                    </button>
                    <select
                        className="input-1c h-11 sm:h-8 text-xs min-w-40"
                        value={filterTerm}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        {docTypeOptions.map((opt) => (
                            <option key={opt || 'all'} value={opt}>
                                {opt || 'All types'}
                            </option>
                        ))}
                    </select>
                    </div>
                    {filterTerm && (
                        <span className="ml-2 text-xs text-amber-600">(filter: {filterTerm})</span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search document registry..."
                            className="input-1c h-11 sm:h-8 pl-8 w-full sm:w-64 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                        <input
                            type="date"
                            className="input-1c h-11 sm:h-8 text-xs"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-xs">—</span>
                        <input
                            type="date"
                            className="input-1c h-11 sm:h-8 text-xs"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button onClick={toggleMenu} className="btn-1c h-11 sm:h-8 relative">
                        <MoreVertical className="h-4 w-4" />
                        {menuOpen && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-[#c0c0c0] shadow-lg z-20">
                                <div onClick={handleClearFilters} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer">Clear filters</div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="flex-1 bg-white border border-[#c0c0c0] overflow-hidden flex flex-col relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                        <div className="loader-1c scale-75"></div>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    <table className="table-1c w-full sticky-header">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th className="w-10">St.</th>
                                <th className="w-32">Number</th>
                                <th className="w-40">Date</th>
                                <th className="w-32">Type</th>
                                <th>Counterparty / Description</th>
                                <th className="text-right w-32">Amount</th>
                                <th className="w-20 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-[#fff9db] cursor-pointer group" onClick={() => navigate(`/documents/edit/${doc.id}`)}>
                                        <td className="text-center">
                                            {doc.status === 'posted' ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" title="Posted" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-slate-400 inline" title="Draft" />
                                            )}
                                        </td>
                                        <td className="font-mono text-xs font-bold text-blue-700">
                                            {String(doc.id).padStart(6, '0')}
                                        </td>
                                        <td className="text-xs text-slate-600">
                                            {new Date(doc.document_date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td>
                                            <div className="flex items-center space-x-2">
                                                <DocumentIcon type={doc.doc_type} />
                                                <span className="text-xs font-bold text-slate-700">{doc.doc_type}</span>
                                            </div>
                                        </td>
                                        <td className="text-xs text-slate-600 truncate max-w-xs">
                                            Main Client Group <br />
                                            <span className="text-[10px] text-slate-400 italic">Auto-generated wholesale transaction</span>
                                        </td>
                                        <td className="text-right font-bold text-xs">
                                            {doc.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px] text-slate-400">USD</span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/documents/edit/${doc.id}`); }}
                                                    className="p-2 sm:p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 hover:bg-white rounded border border-transparent hover:border-[#c0c0c0]"
                                                ><FileEdit className="h-3.5 w-3.5 text-slate-600" /></button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                                    className="p-2 sm:p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 hover:bg-white rounded border border-transparent hover:border-[#c0c0c0]"
                                                ><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-20 text-slate-400">
                                        <div className="flex flex-col items-center">
                                            <Layers className="h-12 w-12 mb-2 opacity-20" />
                                            <p className="text-sm">No documents found in registry</p>
                                            <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">Filter or create new entry</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 1C Pagination */}
                <div className="bg-[#f2f2f2] border-t border-[#c0c0c0] p-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between shrink-0 text-xs text-slate-600 font-medium">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span>Total: <span className="font-bold text-black">{pagination.total}</span> entries</span>
                        <div className="flex items-center gap-2">
                            <span>Rows per page:</span>
                            <select
                                className="bg-white border border-[#c0c0c0] rounded-sm text-[10px] font-bold outline-none"
                                value={pagination.limit}
                                onChange={(e) => fetchDocuments(1, parseInt(e.target.value))}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="btn-1c min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 px-2 py-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center space-x-1">
                            <span>Page</span>
                            <input
                                type="number"
                                className="w-10 text-center bg-white border border-[#c0c0c0] font-bold rounded-sm outline-none"
                                value={pagination.page}
                                readOnly
                            />
                            <span>of {pagination.pages}</span>
                        </div>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="btn-1c min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 px-2 py-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="hidden sm:block text-[10px] uppercase tracking-tighter text-slate-400 font-black">
                        Registry View: Default
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="hidden sm:flex items-center justify-between px-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                        <div className={classNames("w-1.5 h-1.5 rounded-full", socketConnected ? "bg-emerald-500" : "bg-rose-500")}></div>
                        <span>{socketConnected ? "Socket Connected" : "Socket Disconnected"}</span>
                    </div>
                    <span>Database: 1CBAS_PROD</span>
                </div>
                <div>Last Synchronized: {new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    );
}
