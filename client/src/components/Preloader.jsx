import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Preloader({ onDone }) {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const spinnerRef = useRef(null);

    useEffect(() => {
        // fade in container
        gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });

        // gradient text pulse (subtle scale)
        gsap.fromTo(
            textRef.current,
            { scale: 0.95 },
            { scale: 1.05, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' }
        );

        // spinner rotate
        gsap.to(spinnerRef.current, { rotate: 360, repeat: -1, duration: 1, ease: 'linear' });

        // minimum display time
        const timer = setTimeout(() => {
            gsap.to(containerRef.current, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    if (onDone) onDone();
                }
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-[#F5F5F5] flex flex-col items-center justify-center z-50"
        >
            {/* logo placeholder */}
            <div className="mb-4">
                <div className="w-16 h-16 bg-[#FF6B00] rounded-full animate-pulse"></div>
            </div>
            <h1
                ref={textRef}
                // tailwindcss-disable-next-line
                className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#FF6B00] via-[#003366] to-[#FF6B00]"
            >
                1C Remix
            </h1>
            <div
                ref={spinnerRef}
                className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full mt-4"
            ></div>
        </div>
    );
}
