"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();

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
                <nav className="flex items-center gap-8">
                    <Link
                        href="/map"
                        className={`text-base transition-colors ${pathname?.startsWith('/map')
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Map
                    </Link>
                    <Link
                        href="/candidates"
                        className={`text-base transition-colors ${pathname === '/candidates'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Candidates
                    </Link>
                    <Link
                        href="/news"
                        className={`text-base transition-colors ${pathname === '/news'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        News
                    </Link>
                    {/* <Link
                        href="/stats"
                        className={`text-base transition-colors ${pathname === '/stats'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Stats
                    </Link> */}
                </nav>
            </div>
        </header>
    );
}
