"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogHeaderProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogTitleProps {
    className?: string;
    children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            {/* Content wrapper */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {children}
            </div>
        </div>
    );
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative z-50 w-full max-w-lg max-h-[85vh] overflow-auto rounded-xl bg-white p-6 shadow-xl",
                    "animate-in fade-in-0 zoom-in-95",
                    className
                )}
            >
                {children}
            </div>
        );
    }
);
DialogContent.displayName = "DialogContent";

const DialogClose = ({
    onClose,
    className,
}: {
    onClose: () => void;
    className?: string;
}) => {
    return (
        <button
            onClick={onClose}
            className={cn(
                "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2",
                className
            )}
        >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
        </button>
    );
};

const DialogHeader = ({ className, children }: DialogHeaderProps) => {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
            {children}
        </div>
    );
};

const DialogTitle = ({ className, children }: DialogTitleProps) => {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h2>
    );
};

export { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle };
