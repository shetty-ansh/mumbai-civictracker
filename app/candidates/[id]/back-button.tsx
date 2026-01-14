"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-black hover:text-stone-900 mb-6 transition-colors bg-transparent border-none cursor-pointer"
        >
            <ArrowLeftIcon className="w-6 h-6" />
            Back to Candidates
        </button>
    );
}
