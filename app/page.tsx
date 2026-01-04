"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Users, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
            Mumbai Tracker
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Know who represents your street. Rate them. Hold them accountable.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/map">
                <Map className="w-4 h-4" />
                Explore Map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/home">
                <Users className="w-4 h-4" />
                View Representatives
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
            <div className="p-5 bg-card border border-border">
              <Map className="w-6 h-6 mb-3" />
              <h3 className="font-medium mb-1">Interactive Map</h3>
              <p className="text-sm text-muted-foreground">
                Click any ward to see who's responsible
              </p>
            </div>
            <div className="p-5 bg-card border border-border">
              <Users className="w-6 h-6 mb-3" />
              <h3 className="font-medium mb-1">227 Wards</h3>
              <p className="text-sm text-muted-foreground">
                Complete coverage of BMC electoral wards
              </p>
            </div>
            <div className="p-5 bg-card border border-border">
              <Star className="w-6 h-6 mb-3" />
              <h3 className="font-medium mb-1">Rate & Review</h3>
              <p className="text-sm text-muted-foreground">
                Share your experience with representatives
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted-foreground">
        <p>Open data for civic transparency</p>
      </footer>
    </div>
  );
}
