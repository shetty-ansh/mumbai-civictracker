import { Navbar } from "@/components/ui/navbar";

export default function Loading() {
    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-stone-600 font-medium">Give us a second...</p>
                    <p className="text-stone-400 text-sm mt-1">Loading candidate details</p>
                </div>
            </main>
        </div>
    );
}
