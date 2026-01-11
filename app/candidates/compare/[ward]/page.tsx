import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Users, AlertTriangle, GraduationCap, FileText, CheckCircle, XCircle } from "lucide-react";
import manifestoData from "@/data/party-manifestos.json";

// Party logo mapping
function getPartyLogo(partyName: string): string {
    switch (partyName) {
        case 'Indian National Congress':
            return '/images/party-symbols/congress-logo.jpg';
        case 'Shiv Sena (Uddhav Balasaheb Thackeray)':
            return '/images/party-symbols/shivsena-ubt-logo.jpg';
        case 'Bharatiya Janata Party':
            return '/images/party-symbols/bjp-logo.jpg';
        case 'Shiv Sena':
            return '/images/party-symbols/shivsena-logo.jpg';
        case 'Nationalist Congress Party':
            return '/images/party-symbols/ncp-logo.jpg';
        case 'Bahujan Samaj Party':
            return '/images/party-symbols/bahujan-party.jpg';
        case 'Samajwadi Party':
            return '/images/party-symbols/samaajvadi-logo.png';
        case 'Aam Aadmi Party':
            return '/images/party-symbols/aap-logo.jpg';
        case 'Maharashtra Navnirman Sena':
            return '/images/party-symbols/mns-logo.jpg';
        default:
            return '/images/party-symbols/generic.jpg';
    }
}

// Get manifesto for a party
function getPartyManifesto(partyName: string) {
    const manifesto = manifestoData.find(m =>
        m.partyName === partyName ||
        m.partyName.includes(partyName) ||
        partyName.includes(m.shortName.split(' ')[0])
    );
    return manifesto;
}

interface CandidateWithInfo {
    id: string;
    ward_no: number;
    candidate_name: string;
    party_name: string;
    ward_name: string;
    is_women_reserved: boolean;
    case_info: { education: string; active_cases: number; closed_cases: number }[] | { education: string; active_cases: number; closed_cases: number } | null;
}

export default async function CompareWardPage({
    params,
}: {
    params: Promise<{ ward: string }>;
}) {
    const { ward } = await params;
    const wardNo = parseInt(ward);

    const { data: candidates, error } = await supabase
        .from('bmc_candidates')
        .select(`
            *,
            case_info:bmc_candidate_case_info(education, active_cases, closed_cases)
        `)
        .eq('ward_no', wardNo)
        .order('party_name', { ascending: true });

    if (error || !candidates || candidates.length === 0) {
        return (
            <div className="min-h-screen bg-stone-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                        <h1 className="text-2xl font-bold mb-2">No Candidates Found</h1>
                        <p className="text-stone-500 mb-6">No candidates found for Ward {wardNo}.</p>
                        <Link href="/candidates" className="text-amber-600 hover:underline">
                            ← Back to Candidates
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const wardName = candidates[0]?.ward_name || `Ward ${wardNo}`;

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <Link
                    href="/candidates"
                    className="inline-flex items-center gap-2 text-sm text-black hover:text-stone-900 mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Candidates
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-fraunces)] mb-2">
                        Compare Candidates
                    </h1>
                    <p className="text-stone-600">
                        Ward {wardNo} • {wardName} • {candidates.length} candidates
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-stone-900 text-white">
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider sticky left-0 bg-stone-900 z-10">
                                        Candidate
                                    </th>
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" />
                                            Education
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Criminal Cases
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-medium text-sm uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Party Manifesto
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(candidates as CandidateWithInfo[]).map((candidate, index) => {
                                    const caseInfo = Array.isArray(candidate.case_info)
                                        ? candidate.case_info[0]
                                        : candidate.case_info;
                                    const manifesto = getPartyManifesto(candidate.party_name);

                                    let education = caseInfo?.education || 'N/A';
                                    if (/^\d+$/.test(education.trim())) {
                                        education = `${education.trim()}th Pass`;
                                    }

                                    const eduNum = parseInt(education);
                                    const isLowEducation = !isNaN(eduNum) && eduNum <= 10;

                                    const hasCases = caseInfo && (caseInfo.active_cases > 0 || caseInfo.closed_cases > 0);
                                    const hasManifesto = manifesto?.manifestoStatus === 'released';

                                    return (
                                        <tr
                                            key={candidate.id}
                                            className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}
                                        >
                                            {/* Candidate Info - Sticky */}
                                            <td className="p-4 sticky left-0 bg-inherit z-10">
                                                <Link
                                                    href={`/candidates/${candidate.id}`}
                                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                                >
                                                    <Image
                                                        src={getPartyLogo(candidate.party_name)}
                                                        alt={candidate.party_name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 object-contain border border-stone-200 rounded-full"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-stone-900 font-[family-name:var(--font-fraunces)]">
                                                            {candidate.candidate_name}
                                                        </p>
                                                        <p className="text-xs text-stone-500 truncate max-w-[150px]">
                                                            {candidate.party_name}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </td>

                                            {/* Education */}
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${isLowEducation
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {education}
                                                </span>
                                            </td>

                                            {/* Criminal Cases */}
                                            <td className="p-4">
                                                {caseInfo ? (
                                                    <div className="space-y-1">
                                                        <div className={`flex items-center gap-2 ${caseInfo.active_cases > 0 ? 'text-red-600' : 'text-stone-400'}`}>
                                                            <span className="font-bold text-lg">{caseInfo.active_cases}</span>
                                                            <span className="text-xs">Active</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 ${caseInfo.closed_cases > 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                                                            <span className="font-bold text-lg">{caseInfo.closed_cases}</span>
                                                            <span className="text-xs">Convicted</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-400 text-sm italic">N/A</span>
                                                )}
                                            </td>

                                            {/* Manifesto */}
                                            <td className="p-4">
                                                {hasManifesto && manifesto?.keyPromises && manifesto.keyPromises.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Key Promises</span>
                                                        </div>
                                                        <ul className="space-y-1 text-xs text-stone-700">
                                                            {manifesto.keyPromises.slice(0, 3).map((promise, idx) => (
                                                                <li key={idx} className="flex items-start gap-1.5">
                                                                    <span className="text-amber-500 mt-0.5">•</span>
                                                                    <span>{promise}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {manifesto.keyPromises.length > 3 && (
                                                            <p className="text-xs text-stone-400 mt-1">
                                                                +{manifesto.keyPromises.length - 3} more promises
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-stone-400">
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="text-sm">Not Released</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></span>
                        <span>Higher Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span>
                        <span>10th or Below</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold">N</span>
                        <span>Active criminal cases</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">N</span>
                        <span>Prior convictions</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
