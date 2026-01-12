"use client";

import { useState, useEffect } from "react";
import { X, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

export function SupportPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        // Show the popup after a short delay
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        // Reset state after closing animation would finish (simulated here by just resetting next open)
        setTimeout(() => setShowQR(false), 500);
    };

    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500",
            // Mobile: Centered at bottom with padding
            "bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6",
            // Container styles
            "p-5 bg-white/95 backdrop-blur-md border border-stone-200 shadow-2xl rounded-2xl",
            // Size constraints
            "w-auto md:w-full max-w-sm mx-auto md:mx-0"
        )}>
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-stone-900 bg-stone-100/50 hover:bg-stone-200/50 rounded-full transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
                {!showQR ? (
                    <>
                        <div className="p-3 bg-red-100/80 text-red-600 rounded-full mb-1">
                            <Heart className="w-6 h-6 fill-current" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-stone-900 tracking-tight">Support the Project</h3>
                            <p className="text-sm text-stone-600 leading-relaxed mt-2">
                                Running this platform requires time and resources. We will only accept support until our website costs are covered.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowQR(true)}
                            className="w-full py-2.5 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-stone-900/10"
                        >
                            Support Project
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-200">
                        <h3 className="font-bold text-stone-900 mb-4">Scan to Contribute</h3>

                        <div className="bg-white p-3 rounded-2xl border border-stone-100 shadow-inner mb-4">
                            <NextImage
                                src="/images/payment.png"
                                alt="Scan to Support"
                                width={180}
                                height={180}
                                className="object-contain rounded-lg"
                            />
                        </div>

                        <p className="text-xs text-stone-500 mb-4">
                            Every contribution helps us keep the servers running.
                        </p>

                        <button
                            onClick={() => setShowQR(false)}
                            className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                        >
                            ← Go back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
