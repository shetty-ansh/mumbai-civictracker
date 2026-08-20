
"use client"

import { useState, useEffect } from "react"
import { X, Mail, Sparkles, Map, Users, BarChart3, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const COMING_FEATURES = [
    { icon: Map, label: "Live ward results tracking" },
    { icon: Users, label: "Corporator performance history" },
    { icon: BarChart3, label: "Deeper election analytics" },
]

export function AnnouncementPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 2000)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => setIsOpen(false)

    const handleSubmit = async (e: React.SubmitEvent) => {
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
        <div className={cn(
            "fixed z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500",
            "bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6",
            "p-5 bg-white/95 backdrop-blur-md border border-stone-200 shadow-2xl rounded-2xl",
            "w-auto md:w-full max-w-sm mx-auto md:mx-0"
        )}>

            <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-stone-900 bg-stone-100/50 hover:bg-stone-200/50 rounded-full transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>

            {status === "success" ? (

                <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                    <p className="font-semibold text-stone-900">You're on the list!</p>
                    <p className="text-sm text-stone-500">
                        We'll email you the moment v2 launches.
                    </p>
                </div>

            ) : (

                <div className="flex flex-col gap-4">

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
                                Coming soon
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                            Mumbai Tracker is getting an update
                        </h3>
                        <p className="text-sm text-stone-500 mt-1">
                            Be the first to know when v2 goes live.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        {COMING_FEATURES.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5"
                            >
                                <Icon className="w-4 h-4 text-amber-500 shrink-0" />
                                <span className="text-sm font-medium text-stone-700">{label}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={status === "loading"}
                                    className="pl-9"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="bg-stone-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                                {status === "loading" ? "Saving..." : "Notify me"}
                            </button>
                        </div>

                        {status === "error" && (
                            <p className="text-xs text-red-500">{errMsg}</p>
                        )}

                        <p className="text-xs text-stone-400">
                            No spam. Unsubscribe any time.
                        </p>
                    </form>

                </div>
            )}

        </div>
    )
}
