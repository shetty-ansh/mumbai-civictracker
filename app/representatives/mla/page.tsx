import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Mumbai MLAs (Vidhan Sabha) | aamchi मुंबई",
  description: "Explore Mumbai's 36 Members of Legislative Assembly (MLAs) in Vidhan Sabha.",
};

export default function MLAListPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link
          href="/representatives"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#800020] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Representatives
        </Link>

        <section className="text-center py-16 bg-[#F9ECD7] border border-stone-300/90 rounded-2xl p-8 shadow-sm">
          <span className="inline-block px-3 py-1 bg-amber-100 text-[#800020] rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Vidhan Sabha
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-3">
            Members of Legislative Assembly (MLAs)
          </h1>
          <p className="text-stone-600 max-w-lg mx-auto mb-6">
            Detailed profiles and performance records for all 36 Mumbai MLAs are currently being compiled.
          </p>
          <span className="inline-flex items-center px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
            Coming Soon
          </span>
        </section>
      </main>
    </div>
  );
}
