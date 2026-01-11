"use client";

import { useState, useEffect } from "react";
import { Mail, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function FeedbackButton() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);

    // Reset visibility when navigating to a different page
    useEffect(() => {
        setIsVisible(true);
    }, [pathname]);

    // Do not show on landing page or home dashboard
    if (pathname === "/" || pathname === "/home" || !isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <a
                href="mailto:shettyansh205@gmail.com?subject=Correction/Complaint%20Report"
                className="flex items-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-full shadow-lg hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 group"
                aria-label="Send correction or complaint"
            >
                <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-medium">Corrections?</span>
            </a>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute -top-2 -right-2 p-1.5 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-all"
                aria-label="Dismiss"
            >
                <X className="w-2 h-2" />
            </button>
        </div>
    );
}
