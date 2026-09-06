"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export interface RepCard {
  id: string;
  name: string;
  constituency: string;
  party: string;
  partyColor: string;
  type: "mp" | "mla" | "corporator";
  href?: string;
  wardNo?: number;
  index?: number; // display number like 001, 002
  gender?: string;
  image?: string;
}

/* =========================================================
   CARD COMPONENT — Inspired by reference design
========================================================= */

function RepresentativeCard({ card }: { card: RepCard }) {
  const initials = card.name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isCorporator = card.type === "corporator";

  const inner = (
    <div className={`rep-card group relative flex flex-col ${isCorporator ? "bg-[#FDFBF7]" : "bg-[#F9ECD7]"} border border-stone-300/90 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-stone-400 hover:-translate-y-1.5 h-full`}>
      {/* Top: Image filling the whole block */}
      <div className={`mx-3 mt-3 rounded-xl overflow-hidden h-48 md:h-56 relative shrink-0 ${isCorporator ? "bg-stone-900" : "bg-gradient-to-br from-[#F5ECE0] to-[#EADCC9]"}`}>
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : isCorporator ? (
          <img
            src={
              card.gender === "Female"
                ? "/images/party-symbols/generic-female.png"
                : "/images/party-symbols/generic.jpg"
            }
            alt="Avatar"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-extrabold text-3xl transition-transform duration-500 group-hover:scale-105"
            style={{
              background: `linear-gradient(145deg, ${card.type === "mp" ? "#800020" : card.partyColor}, ${card.type === "mp" ? "#800020" : card.partyColor}bb)`,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Bottom: Party label + Name */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Party label */}
          <span
            className="inline-block text-[11px] md:text-xs font-bold uppercase tracking-widest"
            style={{ color: card.type === "mp" ? "#800020" : card.partyColor }}
          >
            {card.party}
          </span>

          {/* Name */}
          <p className={`font-semibold text-stone-800 leading-snug line-clamp-2 mt-1 ${card.type === "mp" ? "text-base md:text-lg" : "text-sm md:text-[15px]"}`}>
            {card.name}
          </p>
        </div>

        {/* Constituency / Ward text */}
        <p className="text-xs text-stone-600 font-semibold">
          {card.constituency}
        </p>
      </div>
    </div>
  );

  if (card.href) {
    return (
      <Link
        href={card.href}
        className="block shrink-0 carousel-card-width"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="shrink-0 carousel-card-width cursor-default">
      {inner}
    </div>
  );
}

/* =========================================================
   CAROUSEL COMPONENT
========================================================= */

export function RepCarousel({
  cards,
  autoScrollSpeed = 0.5,
}: {
  cards: RepCard[];
  autoScrollSpeed?: number;
  isInfinite?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  // Duplicate cards for seamless loop
  const displayCards = cards.length > 0 ? [...cards, ...cards, ...cards] : cards;

  // Auto-scroll animation
  const animate = useCallback(() => {
    if (autoScrollSpeed > 0 && scrollRef.current && !isPaused.current && !isDragging.current) {
      scrollRef.current.scrollLeft += autoScrollSpeed;

      const singleSetWidth = scrollRef.current.scrollWidth / 3;
      if (scrollRef.current.scrollLeft >= singleSetWidth * 2) {
        scrollRef.current.scrollLeft -= singleSetWidth;
      }
      if (scrollRef.current.scrollLeft <= 0) {
        scrollRef.current.scrollLeft += singleSetWidth;
      }
    }
    if (autoScrollSpeed > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [autoScrollSpeed]);

  useEffect(() => {
    if (scrollRef.current) {
      const singleSetWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = singleSetWidth;
    }
    if (autoScrollSpeed > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate, autoScrollSpeed]);

  // Handle loop wrapping on manual scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const singleSetWidth = container.scrollWidth / 3;
    if (singleSetWidth > 0) {
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft -= singleSetWidth;
      } else if (container.scrollLeft <= 10) {
        container.scrollLeft += singleSetWidth;
      }
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      scrollLeft: scrollRef.current?.scrollLeft || 0,
    };
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    isPaused.current = true;
    dragStart.current = {
      x: e.touches[0].clientX,
      scrollLeft: scrollRef.current?.scrollLeft || 0,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    setTimeout(() => {
      isPaused.current = false;
    }, 2000);
  };

  // Manual scroll buttons
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = direction === "left" ? -320 : 320;
    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/carousel">
      {/* Left arrow - Always visible, larger, white background, burgundy arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-stone-300 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-stone-50 hover:scale-110 active:scale-95"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6 text-[#800020]" />
      </button>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 md:gap-5 overflow-x-auto py-2 cursor-grab select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onMouseEnter={() => (isPaused.current = true)}
        onMouseLeave={() => {
          isPaused.current = false;
          isDragging.current = false;
          if (scrollRef.current) scrollRef.current.style.cursor = "grab";
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayCards.map((card, idx) => (
          <RepresentativeCard key={`${card.id}-${idx}`} card={card} />
        ))}
      </div>

      {/* Right arrow - Always visible, larger, white background, burgundy arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-stone-300 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-stone-50 hover:scale-110 active:scale-95"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6 text-[#800020]" />
      </button>

      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#FAFAFA] to-transparent pointer-events-none z-[5]" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#FAFAFA] to-transparent pointer-events-none z-[5]" />
    </div>
  );
}

/* =========================================================
   HIERARCHY BARS
========================================================= */

export function HierarchyBars() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const tiers = [
    {
      id: "section-mps",
      label: "Parliament",
      value: "6 MPs",
      colorWidth: "30%",
      color: "#0EA5E9", // Bright Sky Blue
    },
    {
      id: "section-mlas",
      label: "State Assembly",
      value: "36 MLAs",
      colorWidth: "40%",
      color: "#F97316", // Bright Tangerine/Peach
    },
    {
      id: "section-corporators",
      label: "Municipal Corporation",
      value: "227 Corporators",
      colorWidth: "50%",
      color: "#10B981", // Bright Mint/Emerald
    },
  ];

  return (
    <div className="flex flex-col gap-0 my-8 md:my-12 border border-stone-200 overflow-hidden">
      {tiers.map((tier, idx) => (
        <button
          key={tier.id}
          onClick={() => scrollToSection(tier.id)}
          className={`group relative flex items-center h-20 md:h-24 overflow-hidden transition-all duration-300 hover:brightness-[0.97] ${idx < tiers.length - 1 ? "border-b border-stone-200" : ""
            }`}
          style={{ background: "#FDFBF7", "--tier-color": tier.color } as React.CSSProperties}
        >
          {/* Smooth gradient wash on the left - higher opacity so it's not too see-through */}
          <div
            className="absolute inset-y-0 left-0 transition-opacity duration-300 opacity-100 group-hover:opacity-0"
            style={{
              width: tier.colorWidth,
              background: `linear-gradient(to right, ${tier.color}CC 0%, ${tier.color}88 60%, transparent 100%)`,
            }}
          />

          {/* Text — centered perfectly in the bar */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-stone-500 group-hover:text-[var(--tier-color)] transition-colors duration-300 mb-0.5">
              {tier.label}
            </p>
            <p className="text-xl md:text-2xl font-extrabold text-stone-900 group-hover:text-[var(--tier-color)] transition-colors duration-300 tracking-tight">
              {tier.value}
            </p>
          </div>

          {/* Arrow on the far right */}
          <div className="absolute right-6 z-10 text-stone-300 group-hover:text-[var(--tier-color)] transition-colors duration-300">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </button>
      ))}

      <p className="text-[11px] text-stone-400 mt-3 px-1 text-center">
        Tap on any tier to jump to that section ↓
      </p>
    </div>
  );
}
