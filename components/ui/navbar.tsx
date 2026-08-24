"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [showMore, setShowMore] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
                setShowMore(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const supabase = createClient();

        // Initial fetch
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <header className="border-b border-border px-6 py-4 bg-background/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/home" className="flex items-center gap-3">
                    <Image
                        src="/images/kaali-peeli.png"
                        alt="Kaali Peeli"
                        width={42}
                        height={36}
                        className="w-8 h-8"
                    />
                    <div>
                        <div className="text-sm text-accent">aamchi</div>
                        <div className="text-xl leading-none font-bold" style={{ fontFamily: 'serif' }}>मुंबई</div>
                    </div>
                </Link>
                <nav className="flex items-center gap-4 md:gap-6">
                    <Link
                        href="/map"
                        className={`text-sm md:text-base transition-colors ${pathname?.startsWith('/map')
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Map
                    </Link>
                    <Link
                        href="/candidates"
                        className={`text-sm md:text-base transition-colors ${pathname === '/candidates'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Corporators
                    </Link>
                    <Link
                        href="/news"
                        className={`text-sm md:text-base transition-colors ${pathname === '/news'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        News
                    </Link>
                    {/* <Link
                        href="/sources"
                        className={`text-sm md:text-base transition-colors ${pathname === '/sources'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Resources
                    </Link> */}
                    {/* <Link
                        href="/results"
                        className={`text-sm md:text-base transition-colors ${pathname === '/results'
                            ? 'font-semibold bg-amber-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md'
                            : 'font-semibold bg-amber-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md hover:bg-amber-600'
                            }`}
                    >
                        Results
                    </Link> */}

                    <div className="relative" ref={moreRef}>
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="flex items-center justify-center p-1 md:p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="More options"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        {showMore && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden flex flex-col z-50">
                                <Link
                                    href="/stats"
                                    onClick={() => setShowMore(false)}
                                    className={`px-4 py-3 text-sm transition-colors text-left ${pathname === '/stats'
                                        ? 'bg-accent/10 text-accent font-medium'
                                        : 'text-foreground hover:bg-muted'
                                        }`}
                                >
                                    Election Stats
                                </Link>
                                <Link
                                    href="/candidates/rankings"
                                    onClick={() => setShowMore(false)}
                                    className={`px-4 py-3 text-sm transition-colors text-left ${pathname === '/candidates/rankings'
                                        ? 'bg-accent/10 text-accent font-medium'
                                        : 'text-foreground hover:bg-muted'
                                        }`}
                                >
                                    Leaderboard
                                </Link>
                            </div>
                        )}
                    </div>

                    {user ? (
                        <Link
                            href="/profile"
                            className={`text-sm md:text-base transition-colors ${pathname === '/profile'
                                ? 'font-semibold text-amber-600'
                                : 'font-medium text-stone-600 hover:text-amber-600'
                                }`}
                        >
                            Profile
                        </Link>
                    ) : (
                        <Link
                            href="/auth"
                            className={`text-sm md:text-base transition-colors font-medium bg-stone-900 text-white px-4 py-2 rounded-full hover:bg-stone-800`}
                        >
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
