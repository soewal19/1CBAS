import React from 'react';
import {
    HelpCircle,
    Book,
    Settings,
    FileText,
    ShieldCheck,
    ChevronRight,
    Info,
    ExternalLink,
    MessageSquare
} from 'lucide-react';

export default function Help() {
    const sections = [
        {
            title: "Getting Started",
            icon: Book,
            items: [
                "Introduction to 1CBAS Enterprise Interface",
                "Setting up your first Counterparty",
                "Warehouse and Inventory Initialization",
                "Understanding the Role-Based Access Control"
            ]
        },
        {
            title: "Document Workflow",
            icon: FileText,
            items: [
                "How to create a Sales Order",
                "Posting vs Saving Drafts explained",
                "Generating Invoices from Orders",
                "Transaction Audit Log and History"
            ]
        },
        {
            title: "Financial Intelligence",
            icon: ShieldCheck,
            items: [
                "FIFO Inventory Write-off Logic",
                "Real-time Profit & Loss Reporting",
                "Stock Valuation Methodologies",
                "System Integrity and Data Persistence"
            ]
        }
    ];

    const steps = [
        { id: '01', text: "Initialize your product catalog in the Database cluster." },
        { id: '02', text: "Create a 'Purchase Invoice' to increase warehouse stock." },
        { id: '03', text: "Generate a 'Sales Order' for your counterparties." },
        { id: '04', text: "Use 'Post and Close' to finalize entries in the ledger." },
        { id: '05', text: "Convert Order → InvoiceFactor → SalesInvoice via toolbar buttons." },
        { id: '06', text: "After posting SalesInvoice you can create a TaxInvoice." }
    ];

    return (
        <div className="space-y-6 animate-fade-in flex flex-col h-full max-w-5xl mx-auto">
            <header className="flex items-center justify-between border-b border-[#c0c0c0] pb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#ffd700] rounded-sm border border-black/10">
                        <HelpCircle className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 uppercase">Knowledge Base</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Enterprise Standard Operating Procedures</p>
                    </div>
                </div>
                <button className="btn-1c space-x-2">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                    <span>Contact Support</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="glass-panel flex flex-col">
                        <div className="bg-[#f2f2f2] border-b border-[#c0c0c0] p-3 flex items-center space-x-2">
                            <section.icon className="h-4 w-4 text-slate-600" />
                            <span className="text-xs font-bold uppercase text-slate-700 tracking-wider font-outfit">{section.title}</span>
                        </div>
                        <div className="p-4 flex-1 space-y-3 bg-white">
                            {section.items.map((item, i) => (
                                <button key={i} className="flex items-start w-full text-left group">
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 mt-0.5 group-hover:text-amber-500 transition-colors" />
                                    <span className="text-sm text-slate-600 group-hover:text-black group-hover:font-medium transition-colors ml-1">{item}</span>
                                </button>
                            ))}
                        </div>
                        <div className="p-2 bg-slate-50 border-t border-[#f0f0f0] text-center">
                            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-amber-600">Explore Section</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-6 bg-white border-[#c0c0c0]">
                    <h2 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] mb-6 flex items-center">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        Standard Operating Procedure (SOP)
                    </h2>
                    <div className="space-y-4">
                        {steps.map((step) => (
                            <div key={step.id} className="flex items-center space-x-4 p-4 rounded-sm border border-slate-100 hover:border-amber-200 hover:bg-[#fff9db] transition-all group">
                                <span className="text-xl font-black text-slate-200 group-hover:text-amber-300 transition-colors">{step.id}</span>
                                <p className="text-sm text-slate-600 font-medium">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 bg-slate-50 border-[#c0c0c0] flex flex-col justify-center text-center space-y-4">
                    <Settings className="h-12 w-12 text-slate-300 mx-auto animate-spin-slow" />
                    <h3 className="text-sm font-bold text-slate-800">Need Technical Guidance?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Refer to our engineering specification for Socket.IO protocols and FIFO recursive implementation detail.
                    </p>
                    <button onClick={() => window.open('/api-docs','_blank')} className="btn-primary-1c w-full py-2 flex items-center justify-center space-x-2">
                        <ExternalLink className="h-4 w-4" />
                        <span>View API Specs</span>
                    </button>
                </div>
            </div>

            <footer className="pt-10 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                    1CBAS Enterprise Edition &copy; 2026. All System Rights Reserved.
                </p>
            </footer>
        </div>
    );
}
