"use client";

import Image from "next/image";

interface LoaderProps {
    message?: string;
}

export function Loader({ message = "Loading..." }: LoaderProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
            {/* Branding */}
            <div className="text-center mb-8">
                <p className="text-amber-500 text-lg font-small tracking-widest mb-2">aamchi</p>
                <h1 className="text-4xl md:text-5xl font-bold text-stone-800" style={{ fontFamily: 'serif' }}>
                    मुंबई
                </h1>
            </div>

            {/* Loader GIF */}
            <Image
                src="/images/loader.gif"
                alt="Loading"
                width={200}
                height={200}
                className="w-90 h-60"
                unoptimized
            />

            {/* Message */}
            <p className="mt-6 text-stone-500 text-base font-medium tracking-wide">{message}</p>

            {/* Decorative dots */}
            <div className="flex gap-1 mt-4">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Footer text */}
            <p className="absolute bottom-8 text-stone-400 text-xs tracking-wide">
                Civic transparency for Mumbai
            </p>
        </div>
    );
}

