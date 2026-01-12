"use client";

import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

export function SupportPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show the popup after a short delay
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500",
            "p-4 bg-white/90 backdrop-blur-md border border-stone-200 shadow-2xl rounded-2xl max-w-sm w-full"
        )}>
            <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-full">
                    <Heart className="w-5 h-5 fill-current" />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-stone-900">Support the Project</h3>
                    <p className="text-sm text-stone-600 leading-snug mt-1">
                        Running this platform requires time and resources. We will only accept support until our website costs are covered.
                    </p>
                </div>

                {/* QR Code Placeholder - User to add their image here */}
                <div className="w-40 h-40 bg-white rounded-xl border border-stone-200 flex items-center justify-center p-2 shadow-sm overflow-hidden">
                    <NextImage
                        src="/images/payment.png"
                        alt="Scan to Support"
                        width={160}
                        height={160}
                        className="w-full h-full object-contain"
                    />
                </div>

                <button
                    onClick={handleClose}
                    className="text-xs text-stone-400 hover:text-stone-600 hover:underline mt-1"
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
}
