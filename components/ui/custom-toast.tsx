"use client"

import { AlertCircle, CheckCircle2, Info, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomToastProps {
    type: "success" | "error" | "processing" | "warning" | "confirm" | "confirmDelete" | "info"
    title: string
    message: string
    onConfirm?: () => void
    onCancel?: () => void
}

export const CustomToast = ({
    type,
    title,
    message,
    onConfirm,
    onCancel,
}: CustomToastProps) => {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <XCircle className="h-5 w-5 text-rose-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        processing: <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />,
        confirm: <Info className="h-5 w-5 text-sky-500" />,
        confirmDelete: <AlertCircle className="h-5 w-5 text-rose-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
    }

    return (
        <div className={cn(
            "w-full rounded-lg border border-stone-200 bg-white p-4 shadow-lg font-[family-name:var(--font-fraunces)]",
            "flex flex-col gap-3"
        )}>
            <div className="flex items-start gap-4">
                <div className="mt-0.5">{icons[type]}</div>
                <div className="flex-1">
                    <h3 className="font-semibold leading-none tracking-tight mb-1 text-stone-900">
                        {title}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>

            {(type === "confirm" || type === "confirmDelete") && (
                <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors",
                            type === "confirmDelete"
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-blue-500 hover:bg-blue-600"
                        )}
                    >
                        {type === "confirmDelete" ? "Delete" : "Confirm"}
                    </button>
                </div>
            )}
        </div>
    )
}
