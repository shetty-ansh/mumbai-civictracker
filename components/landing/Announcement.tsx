
"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const NEW_FEATURES = [
    "Their Actual Promises",
    "Shareable Report Cards",
    "Rate Your Corporator",
    "Contact Info and much more",
]

const STORAGE_KEY = "mumbaitracker-announcement-dismissed"

export function AnnouncementPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY)
        if (dismissed) return
        const timer = setTimeout(() => setIsOpen(true), 2500)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus("loading")
        setErrMsg("")

        const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        const data = await res.json()

        if (!res.ok) {
            setStatus("error")
            setErrMsg(data.error)
        } else {
            setStatus("success")
            setEmail("")
        }
    }

    if (!isOpen) return null

    return (
        <div
            className={cn(
                "fixed z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500",
                "bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6",
                "shadow-2xl rounded-2xl overflow-hidden bg-[#2C392C]",
                "w-auto md:w-full max-w-[680px] mx-auto md:mx-0",
                "bg-cover md:bg-[length:100%_100%] bg-center bg-no-repeat"
            )}
            style={{
                backgroundImage: "url('/images/announcement.png')"
            }}
        >
            {/* Inner safe area to avoid the ornate borders */}
            <div className="px-8 py-16 md:px-20 md:py-16 relative h-full w-full">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 md:top-12 md:right-14 p-1.5 text-amber-200/50 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                {status === "success" ? (

                    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center h-full">
                        <CheckCircle className="w-12 h-12 text-amber-400" />
                        <p className="text-xl font-semibold text-amber-50">You&apos;re on the list!</p>
                        <p className="text-sm text-amber-100/70">
                            We&apos;ll send you one email when the next update drops.
                        </p>
                    </div>

                ) : (

                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center h-full mt-2">

                        {/* Left Column: Features */}
                        <div className="flex-1 flex flex-col gap-3 w-full">
                            <div>
                                <p className="text-[10px] font-semibold tracking-widest uppercase text-[#FF8C00] mb-0.5">
                                    What&apos;s New
                                </p>
                                <h3 className="text-lg font-bold text-amber-50 tracking-tight leading-snug">
                                    Mumbai Tracker just got better
                                </h3>
                            </div>

                            <div className="w-full flex items-center gap-2">
                                <span className="flex-1 border-t-2 border-dashed border-amber-200/20" />
                            </div>

                            <ul className="space-y-1.5">
                                {NEW_FEATURES.map((feature) => (
                                    <li
                                        key={feature}
                                        className="text-[13px] text-amber-100/80 leading-snug"
                                    >
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Column: Form */}
                        <div className="flex-1 flex flex-col gap-3 w-full md:border-l-2 md:border-dashed md:border-amber-200/20 md:pl-6">
                            
                            {/* Mobile divider */}
                            <div className="w-full flex items-center gap-2 md:hidden">
                                <span className="flex-1 border-t-2 border-dashed border-amber-200/20" />
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 justify-center h-full w-full">
                                <p className="text-[13px] text-amber-50 font-medium mb-0.5 text-center">
                                    Get notified when we launch.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        disabled={status === "loading"}
                                        className="bg-black/20 border-amber-200/20 text-white placeholder:text-amber-200/40 focus-visible:ring-amber-500/50 h-9 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full bg-[#FF8C00] text-stone-900 text-[13px] font-bold px-4 py-2 rounded-md hover:bg-amber-500 active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap shadow-lg h-9"
                                    >
                                        {status === "loading" ? "Saving..." : "Notify me"}
                                    </button>
                                </div>

                                {status === "error" && (
                                    <p className="text-xs text-red-400 text-center">{errMsg}</p>
                                )}

                                <p className="text-[9px] text-amber-200/40 text-center font-bold uppercase tracking-widest mt-1">
                                    Only one update. No spam.
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
