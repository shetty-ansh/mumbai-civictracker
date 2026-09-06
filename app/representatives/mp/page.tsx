import { Metadata } from "next";
import Link from "next/link";
import { getMumbaiMPsList } from "@/lib/services/mpService";
import { Navbar } from "@/components/ui/navbar";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-static";
export const revalidate = 604800; // 7 days

export const metadata: Metadata = {
  title: "Mumbai Members of Parliament (MPs) | aamchi मुंबई",
  description:
    "Explore Mumbai's 6 Lok Sabha Members of Parliament. Track their MPLADS fund utilization, recommended development works, and constituency performance.",
};

function formatName(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function MPListPage() {
  const { data: mps } = await getMumbaiMPsList();
  const mpList = mps || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Back Link */}
        <Link
          href="/representatives"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#800020] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Representatives
        </Link>

        {/* Hero Section */}
        <section className="mb-10">
          <span className="inline-block px-3 py-1 bg-amber-100 text-[#800020] rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            18th Lok Sabha
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-3">
            Members of Parliament (MPs)
          </h1>
          <p className="text-base md:text-lg text-stone-600 max-w-2xl">
            Mumbai is represented by 6 Members of Parliament in the Lok Sabha. Click on any MP to view their MPLADS fund spending, constituency work records, and development performance.
          </p>
        </section>

        {/* MPs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mpList.map((mp) => {
            const formattedName = formatName(mp.name);
            const constituencyName = mp.constituency.replace("MUMBAI ", "Mumbai ");
            const initials = formattedName
              .split(" ")
              .map((w) => w.charAt(0))
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <Link
                key={mp.id}
                href={`/representatives/mp/${mp.id}`}
                className="group rep-card relative flex flex-col bg-[#F9ECD7] border border-stone-300/90 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-stone-400 hover:-translate-y-1.5 h-full"
              >
                {/* Top: Image filling block */}
                <div className="mx-3 mt-3 rounded-xl overflow-hidden h-52 md:h-60 relative bg-gradient-to-br from-[#F5ECE0] to-[#EADCC9] shrink-0">
                  {mp.image ? (
                    <img
                      src={mp.image}
                      alt={formattedName}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-3xl bg-[#800020]">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Bottom: Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Party Tag */}
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#800020]">
                      {mp.party}
                    </span>

                    {/* Name */}
                    <h2 className="text-lg md:text-xl font-bold text-stone-900 leading-snug mt-1 group-hover:text-[#800020] transition-colors">
                      {formattedName}
                    </h2>

                    {/* Constituency */}
                    <p className="text-sm text-stone-600 font-semibold mt-1">
                      {constituencyName}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-stone-300/60 flex items-center justify-between text-xs font-bold text-[#800020] group-hover:translate-x-0.5 transition-transform">
                    <span>View MPLADS & Works</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
