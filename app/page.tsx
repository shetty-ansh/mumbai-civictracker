"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Full-screen Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/images/mumbai-video.mp4" type="video/mp4" />
      </video>

      {/* Subtle Blur Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      {/* Developer Links - Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <span className="text-white/60 text-sm font-light">By - Ansh Shetty</span>
        <a
          href="https://x.com/anshshetty_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white/90 transition-colors"
          aria-label="Twitter/X"
        >
          <Twitter className="w-4 h-4" strokeWidth={1.5} />
        </a>
        <a
          href="https://www.linkedin.com/in/ansh-shetty/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white/90 transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-4 h-4" strokeWidth={1.5} />
        </a>
        <a
          href="https://anshshetty.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white/90 transition-colors"
          aria-label="Portfolio"
        >
          <Globe className="w-4 h-4" strokeWidth={1.5} />
        </a>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Small 'aamchi' text */}
        < p className="text-2xl md:text-3xl lg:text-4xl font-bold mb-0 ml-20 tracking-widest" style={{ color: '#FF8C00' }
        }>
          aamchi
        </p >

        {/* Main Title - Mumbai in Hindi */}
        < h1
          className="text-[12rem] md:text-[16rem] lg:text-[18rem] font-bold text-white mb-8 leading-none tracking-tight"
          style={{ fontFamily: 'serif' }}
        >
          मुंबई
        </h1 >

        {/* Subtitle */}
        < p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light mb-4 max-w-3xl tracking-wide" >
          Know your ward.Know your corporator.
        </p >

        <p className="text-base md:text-lg text-white/70 font-light mb-12 max-w-2xl">
          Navigate through 227 electoral wards and hold your representatives accountable
        </p>

        {/* CTA Button */}
        <Link href="/home">
          <button className="group px-12 py-5 bg-white text-black hover:bg-white/90 transition-all duration-300 text-lg font-medium tracking-wide flex items-center gap-3">
            <Image
              src="/images/kaali-peeli.png"
              alt="Kaali Peeli Taxi"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            Explore Your Ward
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </Link>
      </div >

      {/* Footer */}
      < div className="absolute bottom-0 left-0 right-0 z-10 py-6 text-center" >
        <p className="text-sm text-white/60 font-light tracking-wide">Open data for civic transparency</p>
      </div >
    </div >
  );
}
