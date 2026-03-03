import React from 'react';

export default function Loader() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <div className="flex flex-col items-center space-y-4 p-8 bg-white border border-[#c0c0c0] shadow-xl rounded-sm">
                <div className="loader-1c"></div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">1CBAS Enterprise</span>
                    <span className="text-[10px] text-slate-500 font-bold animate-pulse">Loading Application Data...</span>
                </div>
            </div>
        </div>
    );
}
