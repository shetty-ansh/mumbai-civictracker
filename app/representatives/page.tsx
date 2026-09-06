import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getMumbaiMPsList } from "@/lib/services/mpService";
import { Navbar } from "@/components/ui/navbar";
import {
  RepCarousel,
  HierarchyBars,
  RepCard,
} from "./representatives-client";
import { ArrowRight } from "lucide-react";

/* =========================================================
   SSG CONFIG
========================================================= */

export const dynamic = "force-static";
export const revalidate = 604800; // 7 days

export const metadata: Metadata = {
  title: "Your Representatives | aamchi मुंबई",
  description:
    "Meet your elected representatives running Mumbai — Members of Parliament, MLAs, and Corporators. Track their work and hold them accountable.",
};

/* =========================================================
   HELPERS
========================================================= */

function formatName(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/* =========================================================
   DATA FETCHERS
========================================================= */

interface CorporatorBasic {
  id: string;
  candidate_name: string;
  party_name: string;
  ward_no: number;
  ward_name: string;
  is_women_reserved: boolean;
}

const PARTY_COLORS: Record<string, string> = {
  "Indian National Congress": "#19AAED",
  "Shiv Sena (Uddhav Balasaheb Thackeray)": "#FF6B00",
  "Bharatiya Janata Party": "#FF9933",
  "Shiv Sena": "#F58220",
  "Nationalist Congress Party - Sharad Pawar": "#004B87",
  "Nationalist Congress Party": "#003366",
  "Bahujan Samaj Party": "#1560BD",
  "Samajwadi Party": "#E31E24",
  "Aam Aadmi Party": "#0066CC",
  "Maharashtra Navnirman Sena": "#2E6B30",
};

function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || "#888888";
}

async function getCorporatorsPreview(): Promise<CorporatorBasic[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("bmc_candidates")
    .select("id, candidate_name, party_name, ward_no, ward_name, is_women_reserved")
    .eq("winnner", true)
    .order("ward_no", { ascending: true })
    .limit(15);

  if (error || !data) {
    console.error("Error fetching corporators preview:", error);
    return [];
  }

  return data;
}

/* =========================================================
   DUMMY MLA DATA
========================================================= */

const DUMMY_MLAS: RepCard[] = [
  {
    id: "mla-1",
    name: "MLA 1",
    constituency: "Colaba",
    party: "Coming Soon",
    partyColor: "#6366f1",
    type: "mla",
    index: 1,
  },
  {
    id: "mla-2",
    name: "MLA 2",
    constituency: "Byculla",
    party: "Coming Soon",
    partyColor: "#8b5cf6",
    type: "mla",
    index: 2,
  },
  {
    id: "mla-3",
    name: "MLA 3",
    constituency: "Andheri East",
    party: "Coming Soon",
    partyColor: "#a78bfa",
    type: "mla",
    index: 3,
  },
];

/* =========================================================
   PAGE COMPONENT
========================================================= */

export default async function RepresentativesPage() {
  const [{ data: mpsList }, corporators] = await Promise.all([
    getMumbaiMPsList(),
    getCorporatorsPreview(),
  ]);

  // Transform MPs to RepCard format
  const mpCards: RepCard[] = (mpsList || []).map((mp, idx) => ({
    id: mp.id,
    name: formatName(mp.name),
    constituency: mp.constituency.replace("MUMBAI ", "Mumbai "),
    party: mp.party,
    partyColor: mp.color,
    type: "mp" as const,
    href: `/representatives/mp/${mp.id}`,
    index: idx + 1,
    image: mp.image,
  }));

  // Transform Corporators to RepCard format
  const corporatorCards: RepCard[] = corporators.map((c, idx) => ({
    id: c.id,
    name: c.candidate_name,
    constituency: `Ward ${c.ward_no}`,
    party: c.party_name,
    partyColor: getPartyColor(c.party_name),
    type: "corporator" as const,
    href: `/candidates/${c.id}`,
    wardNo: c.ward_no,
    index: idx + 1,
    gender: c.is_women_reserved ? "Female" : "Male",
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900">
      <Navbar />

      {/* CSS for card sizing — 3.5 cards visible */}
      <style dangerouslySetInnerHTML={{ __html: `
        .carousel-card-width {
          width: calc((100vw - 3rem - 4 * 1.25rem) / 2.2);
          min-width: 160px;
        }
        @media (min-width: 768px) {
          .carousel-card-width {
            width: calc((min(72rem, 100vw) - 3rem - 4 * 1.25rem) / 3.5);
            min-width: 200px;
          }
        }
      `}} />

      <main className="max-w-6xl mx-auto px-4 md:px-6">
        {/* ============================================
            HERO SECTION
        ============================================ */}
        <section className="pt-10 md:pt-16 pb-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 mb-3">
            <span className="text-amber-600">तुमचे</span> Representatives
          </h1>
          <p className="text-lg md:text-xl text-stone-500 max-w-xl mx-auto">
            Meet your Elected Reps running the City
          </p>
        </section>

        {/* ============================================
            HIERARCHY BARS
        ============================================ */}
        <HierarchyBars />

        {/* ============================================
            SECTION: MEMBERS OF PARLIAMENT
        ============================================ */}
        <section id="section-mps" className="py-8 md:py-12 scroll-mt-20">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
                Members of Parliament
              </h2>
              <p className="text-sm md:text-base text-stone-500 mt-1">
                6 MPs representing Mumbai in the Lok Sabha
              </p>
            </div>
            <Link
              href="/representatives/mp"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FDFBF7] text-stone-900 border border-stone-800 rounded-[2px] text-xs font-bold uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all duration-200 shadow-sm"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {mpCards.length > 0 ? (
            <RepCarousel cards={mpCards} autoScrollSpeed={0} isInfinite={false} />
          ) : (
            <div className="text-center py-12 text-stone-400 bg-white border border-stone-200 rounded-2xl">
              <p className="text-lg font-medium">Loading MP data...</p>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-stone-200" />

        {/* ============================================
            SECTION: MLAs
        ============================================ */}
        <section id="section-mlas" className="py-8 md:py-12 scroll-mt-20">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
                Members of Legislative Assembly
              </h2>
              <p className="text-sm md:text-base text-stone-500 mt-1">
                36 MLAs representing Mumbai constituencies in Vidhan Sabha
              </p>
            </div>
            <Link
              href="/representatives/mla"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FDFBF7] text-stone-900 border border-stone-800 rounded-[2px] text-xs font-bold uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all duration-200 shadow-sm"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RepCarousel cards={DUMMY_MLAS} autoScrollSpeed={0.3} />

          <p className="text-center text-sm text-stone-400 mt-4">
            MLA data will be added soon. Stay tuned!
          </p>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-stone-200" />

        {/* ============================================
            SECTION: CORPORATORS
        ============================================ */}
        <section
          id="section-corporators"
          className="py-8 md:py-12 scroll-mt-20"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
                Corporators
              </h2>
              <p className="text-sm md:text-base text-stone-500 mt-1">
                227 elected corporators governing Mumbai through the BMC
              </p>
            </div>
            <Link
              href="/candidates"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FDFBF7] text-stone-900 border border-stone-800 rounded-[2px] text-xs font-bold uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all duration-200 shadow-sm"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {corporatorCards.length > 0 ? (
            <RepCarousel cards={corporatorCards} autoScrollSpeed={0.5} />
          ) : (
            <div className="text-center py-12 text-stone-400 bg-white border border-stone-200 rounded-2xl">
              <p className="text-lg font-medium">Loading corporator data...</p>
            </div>
          )}
        </section>

        {/* ============================================
            FOOTER
        ============================================ */}
        <footer className="py-8 text-center border-t border-stone-200">
          <p className="text-xs text-stone-400">
            Data sourced from official government records. Updated periodically.
          </p>
        </footer>
      </main>
    </div>
  );
}
