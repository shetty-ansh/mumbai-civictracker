"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Twitter, Linkedin, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { SupportPopup } from "@/components/support-popup";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Initial click just shows the modal
  const handleExplore = () => {
    setShowDisclaimer(true);
  };

  // Confirm click performs the routing
  const handleProceed = () => {
    setLoading(true);
    router.push("/home");
  };

  if (loading) {
    return <Loader message="Loading Mumbai..." />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Full-screen Video Background */}
      {/* Desktop Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hidden md:block absolute inset-0 w-full h-full object-cover"
      >
        <source src="/images/mumbai-video.mp4" type="video/mp4" />
      </video>

      {/* Mobile Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="block md:hidden absolute inset-0 w-full h-full object-cover"
      >
        <source src="/images/mumbai-video-phone.mp4" type="video/mp4" />
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
        <p className="text-2xl md:text-3xl lg:text-4xl font-bold mb-0 ml-20 tracking-widest" style={{ color: '#FF8C00' }}>
          aamchi
        </p>

        {/* Main Title - Mumbai in Hindi */}
        <h1
          className="text-[12rem] md:text-[16rem] lg:text-[18rem] font-bold text-white mb-8 leading-none tracking-tight"
          style={{ fontFamily: 'serif' }}
        >
          मुंबई
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light mb-4 max-w-3xl tracking-wide">
          Know your ward. Know your corporator.
        </p>

        <p className="text-base md:text-lg text-white/70 font-light mb-12 max-w-2xl">
          Navigate through 227 electoral wards and hold your representatives accountable
        </p>

        {/* CTA Button */}
        <button
          onClick={handleExplore}
          className="group px-8 py-3.5 md:px-12 md:py-5 bg-white text-black hover:bg-white/90 active:scale-95 transition-all duration-150 text-base md:text-lg font-medium tracking-wide flex items-center gap-3 shadow-lg hover:shadow-xl"
        >
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
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-white/60 font-light tracking-wide mt-2 pt-2">Open data for civic transparency</p>
        <a
          href="/sources"
          className="text-[10px] uppercase tracking-widest text-white border border-white px-3 py-1 rounded-full hover:bg-white/10 hover:text-white/80 transition-all"
        >
          Sources
        </a>
      </div>

      {/* Legal Disclaimer Modal */}
      {showDisclaimer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-stone-200">
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-50 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-stone-900 leading-tight">
                  Important Legal Disclaimer <br /> & Terms of Use
                </h2>
              </div>

              <div className="space-y-3 text-sm text-stone-600 leading-snug mb-6">
                <p className="font-medium text-stone-900">
                  Please read carefully before proceeding:
                </p>

                <ul className="space-y-2 list-disc pl-4 marker:text-stone-400 text-xs sm:text-sm">
                  <li>
                    <strong className="text-stone-900">Civic Initiative:</strong> This is a voluntary, student-led project to make civic data accessible. It is <span className="underline decoration-amber-200 decoration-2 underline-offset-2">independent and not a government website</span>.
                  </li>
                  <li>
                    <strong className="text-stone-900">Data Transparency:</strong> We have manually digitized public records to help you make informed decisions. While we strive for accuracy, sources are manually verified and may contain errors. The developers accept <strong>NO LIABILITY</strong> for any inaccuracies or omissions.
                  </li>
                  <li>
                    <strong className="text-stone-900">Verify Details:</strong> For the most accurate and legally binding information, we encourage you to check the <strong>original affidavits</strong> which are linked directly on every candidate's profile.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleProceed}
                  disabled={loading}
                  className="w-full py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      I Understand & Wish to Proceed
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  disabled={loading}
                  className="w-full py-2.5 text-stone-500 font-medium hover:bg-stone-100 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <SupportPopup />
    </div>
  );
}
