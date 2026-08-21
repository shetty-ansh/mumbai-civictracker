"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, LogIn, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { fetchReviewStatus, submitReview, fetchAllRatings } from "@/lib/services/reviewService";
import { CandidateRatingsData } from "@/lib/types/candidate.type";

interface UserRatingStatus {
    hasRated: boolean;
    rating?: number;
    review_text?: string;
    status?: "quarantined" | "published" | "removed";
    created_at?: string;
}

type ViewState =
    | { kind: "loading" }
    | { kind: "unauthenticated" }
    | { kind: "form" }
    | { kind: "submitting" }
    | { kind: "submitted"; rating: number; status: string }
    | { kind: "existing"; rating: number; review_text?: string; status: string; created_at?: string }
    | { kind: "error"; message: string };

function StatusStamp({ status }: { status: string }) {
    if (status === 'published') {
        return (
            <span title="Verified Review" className="text-emerald-500 flex items-center">
                <CheckCircle2 className="w-4 h-4" />
            </span>
        );
    }
    
    if (status === 'removed') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                <XCircle className="w-3 h-3" /> Removed
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
            <Clock className="w-3 h-3" /> Under Review
        </span>
    );
}

function StarButton({
    filled,
    hovered,
    onClick,
    onMouseEnter,
    onMouseLeave,
    disabled,
    index,
}: {
    filled: boolean;
    hovered: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    disabled: boolean;
    index: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            disabled={disabled}
            aria-label={`Rate ${index + 1} out of 5`}
            className={`p-0.5 transition-all duration-150 ${disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
                }`}
        >
            <Star
                className={`w-7 h-7 transition-colors duration-150 ${filled || hovered
                    ? "text-amber-500 fill-amber-500"
                    : "text-stone-300"
                    }`}
            />
        </button>
    );
}

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 ${i <= rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-stone-300"
                        }`}
                />
            ))}
        </div>
    );
}

export function CandidateRating({ candidateId }: { candidateId: string }) {
    const [view, setView] = useState<ViewState>({ kind: "loading" });
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [ratings, setRatings] = useState<CandidateRatingsData[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStatus = useCallback(async () => {
        const { status: fetchStatus, data, error } = await fetchReviewStatus(candidateId);

        if (fetchStatus === 401) {
            setView({ kind: "unauthenticated" });
            return;
        }

        if (error || !data) {
            setView({ kind: "error", message: error || "Failed to load rating status" });
            return;
        }

        if (data.hasRated) {
            setView({
                kind: "existing",
                rating: data.rating!,
                review_text: data.review_text,
                status: data.status!,
                created_at: data.created_at,
            });
        } else {
            setView({ kind: "form" });
        }
    }, [candidateId]);

    useEffect(() => {
        fetchStatus();
        fetchRatingsandReviews();
    }, [fetchStatus]);

    async function fetchRatingsandReviews() {
        setLoading(true);
        //TODO Add a generic loader
        const res = await fetchAllRatings(candidateId);

        if (res.error || !res.data) {
            setRatings([]);
            return;
        }

        setRatings(res?.data);
        setLoading(false);

    }

    const handleSubmit = async () => {
        if (selectedRating < 1 || selectedRating > 5) return;

        setView({ kind: "submitting" });

        const { status: submitStatus, data, error } = await submitReview(candidateId, selectedRating, reviewText);

        if (submitStatus === 401) {
            setView({ kind: "unauthenticated" });
            return;
        }

        if (submitStatus === 409) {
            // Already rated — refresh to show existing
            await fetchStatus();
            return;
        }

        if (error) {
            setView({
                kind: "error",
                message: error,
            });
            return;
        }

        setView({
            kind: "submitted",
            rating: selectedRating,
            status: data?.status || "quarantined",
        });
    };

    const validRatings = ratings.filter(r => r.status !== 'removed');
    const publishedRatings = ratings.filter(r => r.status === 'published');
    const average = publishedRatings.length > 0
        ? publishedRatings.reduce((sum, r) => sum + r.rating, 0) / publishedRatings.length
        : 0;

    return (
        <div className="rounded-xl border bg-white border-stone-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-3">
                <div className="flex items-end gap-2">
                    <span className="text-[10px] uppercase tracking-widest whitespace-nowrap text-stone-600">
                        Your Rating
                    </span>
                    <span className="flex-1 border-b border-dotted border-stone-500/40 mb-1" />
                </div>
            </div>

            {/* Tear line */}
            {/* <div className="w-full flex items-center gap-2 px-6 pb-4">
                <span className="flex-1 border-t-2 border-dashed border-stone-500/30" />
                <span className="text-xs text-stone-400/50">✂</span>
                <span className="flex-1 border-t-2 border-dashed border-stone-500/30" />
            </div> */}

            {/* Content area */}
            <div className="px-6 pb-6">
                {/* Loading state */}
                {view.kind === "loading" && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
                    </div>
                )}

                {/* Unauthenticated */}
                {view.kind === "unauthenticated" && (
                    <div className="text-center py-4 space-y-3">
                        <p className="text-sm text-stone-500">
                            Sign in to rate this candidate
                        </p>
                        <Link
                            href="/auth"
                            className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-stone-800 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Link>
                    </div>
                )}

                {/* Rating form */}
                {view.kind === "form" && (
                    <div className="space-y-4">
                        {/* Stars */}
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <StarButton
                                    key={i}
                                    index={i - 1}
                                    filled={i <= selectedRating}
                                    hovered={i <= hoveredRating}
                                    onClick={() => setSelectedRating(i)}
                                    onMouseEnter={() => setHoveredRating(i)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    disabled={false}
                                />
                            ))}
                            {selectedRating > 0 && (
                                <span className="ml-2 text-sm font-medium text-stone-700">
                                    {selectedRating}/5
                                </span>
                            )}
                        </div>

                        {/* Review textarea */}
                        <div className="space-y-1.5">
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Write an optional review..."
                                maxLength={1000}
                                rows={3}
                                className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors"
                            />
                            <p className="text-[11px] text-stone-400 text-right tabular-nums">
                                {reviewText.length}/1000
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={selectedRating === 0}
                            className="w-full flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest rounded-lg py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-stone-800 text-white hover:bg-stone-700"
                        >
                            Submit Rating
                        </button>
                    </div>
                )}

                {/* Submitting */}
                {view.kind === "submitting" && (
                    <div className="flex items-center justify-center py-8 gap-2">
                        <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
                        <span className="text-sm text-stone-500">Submitting…</span>
                    </div>
                )}

                {/* Just submitted */}
                {view.kind === "submitted" && (
                    <div className="text-center py-4 space-y-3">
                        <StarDisplay rating={view.rating} />
                        <div className="flex justify-center">
                            <StatusStamp status={view.status} />
                        </div>
                        <p className="text-xs text-stone-500">
                            Submitted — pending review
                        </p>
                    </div>
                )}

                {/* Existing rating */}
                {view.kind === "existing" && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <StarDisplay rating={view.rating} />
                            <StatusStamp status={view.status} />
                        </div>
                        {view.review_text && (
                            <p className="text-sm text-stone-600 leading-relaxed border-l-2 border-stone-200 pl-3 italic">
                                &ldquo;{view.review_text}&rdquo;
                            </p>
                        )}
                        {view.created_at && (
                            <p className="text-[11px] text-stone-400">
                                Rated {new Date(view.created_at).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                        )}
                    </div>
                )}

                {/* Error */}
                {view.kind === "error" && (
                    <div className="text-center py-4 space-y-3">
                        <p className="text-sm text-red-600">{view.message}</p>
                        <button
                            onClick={() => {
                                setView({ kind: "loading" });
                                fetchStatus();
                            }}
                            className="text-sm text-stone-600 underline hover:text-stone-800"
                        >
                            Try again
                        </button>
                    </div>
                )}
            </div>

            {/* Public Reviews Section */}
            {(validRatings.length > 0 || loading) && (
                <>
                    <div className="w-full flex items-center gap-2 px-6 pb-4">
                        <span className="flex-1 border-t-2 border-dashed border-stone-500/30" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400/80">Public Reviews</span>
                        <span className="flex-1 border-t-2 border-dashed border-stone-500/30" />
                    </div>

                    {!loading && publishedRatings.length > 0 && (
                        <div className="px-6 pb-4 text-center space-y-1">
                            <div className="flex justify-center items-center gap-2">
                                <span className="text-2xl font-bold text-stone-800">{average.toFixed(1)}</span>
                                <StarDisplay rating={Math.round(average)} />
                            </div>
                            <p className="text-[11px] text-stone-500 uppercase tracking-wider">
                                Based on {publishedRatings.length} verified* review{publishedRatings.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    <div className="px-6 pb-6 space-y-6 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
                            </div>
                        ) : (
                            validRatings.map((rating, idx) => (
                                <div key={idx} className="space-y-2 border-b border-stone-100 pb-5 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <StarDisplay rating={rating.rating} />
                                            {rating.status === 'published' ? (
                                                <span title="Verified Review" className="text-emerald-500">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                                                    <Clock className="w-3 h-3" /> Under Review
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-stone-400">
                                            {new Date(rating.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    {rating.review_text && (
                                        <p className="text-sm text-stone-600 leading-relaxed italic">
                                            &ldquo;{rating.review_text}&rdquo;
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {!loading && publishedRatings.length > 0 && (
                        <div className="px-6 pb-4 pt-3 border-t border-stone-100 bg-stone-50/30">
                            <p className="text-[10px] text-stone-400 leading-relaxed italic">
                                * By verified we mean it's a real user and not actually verifying the corporator's work.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
