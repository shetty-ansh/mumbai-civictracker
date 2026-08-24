"use client";

import { Share2, Download, Check, ChevronDown, Image as ImageIcon, FileText } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface CandidateShareActionsProps {
    candidateName: string;
    wardNo: number;
}

export function CandidateShareActions({ candidateName, wardNo }: CandidateShareActionsProps) {
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleShare = async () => {
        setIsSharing(true);
        const url = window.location.href;
        const title = `Check out ${candidateName}'s profile (Ward ${wardNo})`;
        const text = `View the election profile and affidavit for ${candidateName} in Ward ${wardNo}.`;

        try {
            if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent.toLowerCase())) {
                await navigator.share({
                    title,
                    text,
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setIsCopied(false), 2000);
            }
        } catch (error) {
            console.error("Error sharing:", error);
            // Fallback to clipboard if share fails
            try {
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                toast.error("Failed to copy link");
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownload = useCallback(async (format: 'image' | 'pdf') => {
        setShowDropdown(false);
        setIsDownloading(true);
        try {
            const node = document.getElementById("candidate-report-card");
            if (!node) {
                throw new Error("Card element not found");
            }

            // A small delay to ensure rendering is complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            const dataUrl = await htmlToImage.toPng(node, {
                quality: 0.95,
                pixelRatio: 2,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                }
            });

            const filename = `${candidateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-ward-${wardNo}`;

            if (format === 'image') {
                const link = document.createElement("a");
                link.download = `${filename}.png`;
                link.href = dataUrl;
                link.click();
                toast.success("Card downloaded as Image!");
            } else if (format === 'pdf') {
                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "px",
                    format: [800, node.offsetHeight]
                });
                pdf.addImage(dataUrl, 'PNG', 0, 0, 800, node.offsetHeight);
                
                // Add hyperlinks
                const links = node.querySelectorAll('.pdf-link');
                const nodeRect = node.getBoundingClientRect();
                
                links.forEach(linkEl => {
                    const href = linkEl.getAttribute('data-href');
                    if (href) {
                        const rect = linkEl.getBoundingClientRect();
                        const x = rect.left - nodeRect.left;
                        const y = rect.top - nodeRect.top;
                        pdf.link(x, y, rect.width, rect.height, { url: href });
                    }
                });

                pdf.save(`${filename}.pdf`);
                toast.success("Card downloaded as PDF!");
            }
        } catch (error) {
            console.error("Error generating file:", error);
            toast.error(`Failed to download card ${format}`);
        } finally {
            setIsDownloading(false);
        }
    }, [candidateName, wardNo]);

    return (
        <div className="flex gap-2">
            <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-amber-400 transition-all shadow-sm active:scale-95"
            >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                {isCopied ? "Copied" : "Share"}
            </button>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 border border-stone-800 rounded-lg text-sm font-semibold text-white hover:bg-stone-700 transition-all shadow-sm active:scale-95"
                >
                    {isDownloading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isDownloading ? "Saving..." : "Save Card"}
                    <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden z-50">
                        <button
                            onClick={() => handleDownload('image')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left"
                        >
                            <ImageIcon className="w-4 h-4 text-stone-400" />
                            Save as Image (PNG)
                        </button>
                        <div className="h-px bg-stone-100" />
                        <button
                            onClick={() => handleDownload('pdf')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left"
                        >
                            <FileText className="w-4 h-4 text-stone-400" />
                            Save as PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
