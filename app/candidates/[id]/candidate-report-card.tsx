import React from 'react';
import { Star, AlertTriangle, Phone, Mail, TicketCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CandidateReportCardProps {
    candidate: any;
    caseInfo: any;
    averageRating: number | null;
    ratingsData: any[];
    promises: any[];
    manifesto: any;
    contactInfo: any;
}

// Simple divider rule between sections.
function Divider() {
    return <div className="w-full border-t-2 border-stone-900/20" />;
}

// QR code linking to the candidate's profile page.
function CandidateQR({ candidateId }: { candidateId: string | number }) {
    const url = `https://mumbaitracker.in/candidates/${candidateId}`;
    return (
        <QRCodeSVG
            value={url}
            size={64}
            bgColor="transparent"
            fgColor="#1c1710"
            level="M"
        />
    );
}

export function CandidateReportCard({
    candidate,
    caseInfo,
    averageRating,
    ratingsData,
    promises,
    manifesto,
    contactInfo
}: CandidateReportCardProps) {
    const hasCases = caseInfo && (caseInfo.active_cases > 0 || caseInfo.closed_cases > 0);
    let education = caseInfo?.education || 'Not Available';
    if (/^\d+$/.test(education.trim())) {
        education = `${education.trim()}th Pass`;
    }

    return (
        <div
            id="candidate-report-card"
            className="w-[800px] text-stone-900 p-10 flex flex-col gap-6 relative"
            style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                backgroundColor: '#FBEAC0',
                backgroundImage: `linear-gradient(180deg, rgba(254,246,224,0.92) 0%, rgba(249, 244, 230, 0.92) 100%), url('/images/mumbai-outline-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: '2px solid rgba(28,23,16,0.15)',
            }}
        >
            {/* Ticket eyebrow strip */}
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-stone-900/50">
                <span style={{ fontFamily: "ui-monospace, 'Courier New', monospace" }}>
                    Mumbaitracker &middot; BMC Civic Ticket
                </span>
                <span style={{ fontFamily: "ui-monospace, 'Courier New', monospace" }}>
                    No. {String(candidate.id ?? '000000').toString().padStart(6, '0')}
                </span>
            </div>

            {/* Header */}
            <div className="flex justify-between items-end gap-6">
                <div>
                    <h1
                        className="text-4xl font-semibold uppercase tracking-tight pdf-link cursor-pointer hover:text-amber-700 transition-colors leading-none"
                        data-href={`https://mumbaitracker.in/candidates/${candidate.id}`}
                    >
                        {candidate.candidate_name}
                    </h1>
                    <p className="text-lg font-bold mt-2 inline-block px-2 py-0.5 bg-[#FBC02D] text-stone-900 -skew-x-3">
                        {candidate.party_name}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900/50">Ward No.</p>
                    <p
                        className="text-5xl font-semibold leading-none px-3 py-1 border-2 border-stone-900"
                        style={{ background: '#FBC02D' }}
                    >
                        {candidate.ward_no}
                    </p>
                </div>
            </div>

            <Divider />

            {/* Top Stats Row — styled as ticket fields with dotted leaders */}
            <div className="grid grid-cols-3 gap-4">
                {/* Education */}
                <div className="p-4 border border-stone-900/15 rounded-md bg-white/40">
                    <p
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900/50 mb-1"
                        style={{ fontFamily: "ui-monospace, 'Courier New', monospace" }}
                    >
                        Education
                    </p>
                    <p className="text-lg font-bold">{education.toUpperCase()}</p>
                </div>

                {/* Legal History */}
                <div className="p-4 border border-stone-900/15 rounded-md bg-white/40">
                    <div className="flex items-center gap-1.5 mb-1">
                        {hasCases && <AlertTriangle className="w-3.5 h-3.5 text-[#A3391F]" />}
                        <p
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900/50"
                            style={{ fontFamily: "ui-monospace, 'Courier New', monospace" }}
                        >
                            Legal History
                        </p>
                    </div>
                    {caseInfo ? (
                        <p className="text-sm font-bold">
                            {caseInfo.active_cases} Pending, {caseInfo.closed_cases} Convicted
                        </p>
                    ) : (
                        <p className="text-sm">N/A</p>
                    )}
                </div>

                {/* Rating */}
                <div className="p-4 border border-stone-900/15 rounded-md bg-white/40">
                    <p
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900/50 mb-1"
                        style={{ fontFamily: "ui-monospace, 'Courier New', monospace" }}
                    >
                        Avg Rating
                    </p>
                    <div className="flex items-center gap-1">
                        <p className="text-lg font-bold">{averageRating !== null ? averageRating.toFixed(1) : 'N/A'}</p>
                        {averageRating !== null && <Star className="w-5 h-5 fill-[#FBC02D] text-stone-900" />}
                    </div>
                    {ratingsData && ratingsData.length > 0 && (
                        <p className="text-[10px] text-stone-900/40 mt-2 font-medium">Based on {ratingsData.length} verified* reviews</p>
                    )}
                </div>
            </div>

            {/* Promises Section */}
            {promises && promises.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="inline-block w-2 h-6 bg-[#FBC02D]" />
                        Candidate Promises
                    </h2>
                    <ul className="space-y-2 list-disc pl-5 marker:text-[#FBC02D]">
                        {promises.map((promise, idx) => (
                            <li key={idx} className="text-stone-800 font-medium">
                                {promise.promise_text}{' '}
                                <span
                                    className="text-stone-900/40 text-xs uppercase tracking-wide"
                                    style={{ fontFamily: "ui-monospace, 'Courier New', monospace" }}
                                >
                                    ({promise.category})
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Manifesto Section */}
            {manifesto && (
                <div>
                    <h2 className="text-xl font-semibold uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="inline-block w-2 h-6 bg-[#FBC02D]" />
                        Party Manifesto Highlights ({candidate.party_name})
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {manifesto.detailedSections?.slice(0, 4).map((section: any, idx: number) => (
                            <div key={idx} className="bg-white/40 p-4 rounded-md border border-stone-900/15">
                                <h3 className="font-semibold mb-2">{section.title}</h3>
                                <ul className="list-disc pl-4 text-sm text-stone-700 space-y-1">
                                    {section.points?.slice(0, 2).map((pt: string, pIdx: number) => (
                                        <li key={pIdx}>{pt}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Latest Reviews Section — styled as ticket stub cards */}
            {ratingsData && ratingsData.filter(r => r.review_text).length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="inline-block w-2 h-6 bg-[#FBC02D]" />
                        Recent Public Reviews
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {ratingsData.filter(r => r.review_text).slice(0, 4).map((rating: any, idx: number) => (
                            <div key={idx} className="bg-white/40 p-4 rounded-md border border-stone-900/15">
                                <div className="flex items-center gap-1 mb-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < rating.rating ? 'fill-[#FBC02D] text-stone-900' : 'text-stone-900/20'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-stone-700 italic">&ldquo;{rating.review_text}&rdquo;</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Divider />

            {/* Contact Details */}
            <div>
                <h2
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900/50 mb-3"
                    style={{ fontFamily: "ui-monospace, 'Courier New', monospace" }}
                >
                    Contact Details
                </h2>
                <div className="flex gap-8">
                    <div
                        className={`flex items-center gap-2 font-bold ${contactInfo?.mobile ? 'pdf-link text-stone-900 cursor-pointer hover:text-amber-700' : 'text-stone-900/30'}`}
                        data-href={contactInfo?.mobile ? `tel:${contactInfo.mobile}` : undefined}
                    >
                        <Phone className="w-5 h-5" />
                        {contactInfo?.mobile || 'Not available'}
                    </div>
                    <div
                        className={`flex items-center gap-2 font-bold ${contactInfo?.email ? 'pdf-link text-stone-900 cursor-pointer hover:text-amber-700' : 'text-stone-900/30'}`}
                        data-href={contactInfo?.email ? `mailto:${contactInfo.email}` : undefined}
                    >
                        <Mail className="w-5 h-5" />
                        {contactInfo?.email || 'Not available'}
                    </div>
                </div>
            </div>

            {/* Footer — QR code + branding */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col items-center gap-1.5">
                    <CandidateQR candidateId={candidate.id} />
                    <span className="normal-case tracking-normal text-[9px] text-stone-900/60 font-medium">
                        Scan to view full profile
                    </span>
                </div>
                <div className="text-center text-[10px] text-stone-900/50 uppercase tracking-widest flex flex-col items-end gap-1.5">
                    <span className="normal-case tracking-normal italic text-[9px] text-right max-w-[280px]">
                        * By verified we mean it's a real user and not actually verifying the corporator's work.
                    </span>
                    <div className="flex items-start gap-2">
                        <TicketCheck className="w-3.5 h-3.5 mt-0.5" />
                        <div className="flex flex-col items-end">
                            <span
                                className="pdf-link cursor-pointer hover:text-amber-700 transition-colors font-semibold"
                                data-href="https://mumbaitracker.in"
                            >
                                Generated by mumbaitracker.in
                            </span>
                            <span className="font-medium normal-case tracking-normal mt-0.5 text-[9px]">
                                By{' '}
                                <span
                                    className="pdf-link cursor-pointer hover:text-amber-700 transition-colors"
                                    data-href="https://www.anshshetty.in/"
                                >
                                    Ansh Shetty
                                </span>
                                {' | '}
                                <span
                                    className="pdf-link cursor-pointer hover:text-amber-700 transition-colors"
                                    data-href="https://samaaj.foundation"
                                >
                                    samaaj.foundation
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}