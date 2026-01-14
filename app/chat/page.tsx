"use client";

import { Navbar } from "@/components/ui/navbar";
import { Badge } from "@/components/ui/badge";
import { SplineScene } from "@/components/ui/splite";
import {
    MessageSquare,
    Sparkles,
    Clock,
    Bell
} from "lucide-react";

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Hero Section with Spline 3D */}
                <div className="relative w-full h-44 md:h-56 mb-8 rounded-xl overflow-hidden bg-stone-900 shadow-lg">
                    {/* Spline 3D Scene */}
                    <div className="absolute inset-0">
                        <SplineScene
                            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                            className="w-full h-full"
                        />
                    </div>

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />

                    {/* Header Content */}
                    <div className="absolute inset-0 flex items-center p-6 md:p-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-fraunces)] text-white">
                                    Ask Mumbai AI
                                </h1>
                                <Badge className="bg-amber-100 text-amber-800 border-0 font-medium">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    BETA
                                </Badge>
                            </div>
                            <p className="text-stone-300 text-sm md:text-base max-w-md">
                                Your AI assistant for Mumbai civic information
                            </p>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-200">
                            <MessageSquare className="h-10 w-10 text-amber-600" />
                        </div>

                        {/* Coming Soon Badge */}
                        <Badge className="bg-stone-900 text-white border-0 font-medium mb-4 px-4 py-1.5">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            COMING SOON
                        </Badge>

                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-fraunces)] text-stone-900 mb-3">
                            AI Chat is Under Development
                        </h2>

                        {/* Description */}
                        <p className="text-stone-600 max-w-md mb-8 leading-relaxed">
                            We&apos;re building an intelligent assistant to help you navigate Mumbai&apos;s civic landscape.
                            Ask questions about wards, candidates, elections, and more.
                        </p>

                        {/* Features Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full mb-8">
                            <div className="bg-stone-50 rounded-lg p-4 text-left border border-stone-100">
                                <p className="text-sm font-medium text-stone-900 mb-1">Ward Information</p>
                                <p className="text-xs text-stone-500">Find your ward and representatives</p>
                            </div>
                            <div className="bg-stone-50 rounded-lg p-4 text-left border border-stone-100">
                                <p className="text-sm font-medium text-stone-900 mb-1">Candidate Details</p>
                                <p className="text-xs text-stone-500">Learn about candidates in your area</p>
                            </div>
                            <div className="bg-stone-50 rounded-lg p-4 text-left border border-stone-100">
                                <p className="text-sm font-medium text-stone-900 mb-1">Election Process</p>
                                <p className="text-xs text-stone-500">Understand how BMC elections work</p>
                            </div>
                            <div className="bg-stone-50 rounded-lg p-4 text-left border border-stone-100">
                                <p className="text-sm font-medium text-stone-900 mb-1">Civic Services</p>
                                <p className="text-xs text-stone-500">Explore BMC responsibilities</p>
                            </div>
                        </div>

                        {/* Notify Section */}
                        <div className="flex items-center gap-2 text-sm text-stone-500">
                            <Bell className="h-4 w-4" />
                            <span>Stay tuned for updates!</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-stone-500 mt-6">
                    In the meantime, explore our <a href="/map" className="text-stone-900 underline hover:no-underline">ward map</a> and <a href="/candidates" className="text-stone-900 underline hover:no-underline">candidate directory</a>.
                </p>
            </main>
        </div>
    );
}
