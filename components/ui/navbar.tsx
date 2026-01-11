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
                        width={32}
                        height={32}
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
                        className={`text-sm transition-colors ${pathname?.startsWith('/map')
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Map
                    </Link>
                    <Link
                        href="/candidates"
                        className={`text-sm transition-colors ${pathname === '/candidates'
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground hover:text-accent'
                            }`}
                    >
                        Candidates
                    </Link>
                    <Link
                        href="/news"
                        className={`text-sm transition-colors ${pathname === '/news'
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground hover:text-accent'
                            }`}
                    >
                        News
                    </Link>
                </nav>
            </div>
        </header>
    );
}
