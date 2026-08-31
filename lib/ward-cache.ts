/**
 * lib/ward-cache.ts
 * =================
 * Loads ward-data.json once into memory when the server starts.
 * All API routes read from this cache — zero file I/O per request.
 */

import wardDataRaw from '@/data/api/ward-data.json'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WardWinner {
    id: string
    name: string
    party: string
    symbol: string | null
    votes: number | null
    education: string | null
    pending_cases: number | null
    closed_cases: number | null
}

export interface WardPromise {
    id: string
    text: string
    category: string
    upvotes: number
    total_votes: number
    created_at: string
}

export interface WardData {
    ward_number: number
    ward_name: string | null
    is_women_reserved: boolean
    winner: WardWinner
    promises: WardPromise[]
}

export interface WardDataFile {
    _meta: {
        generated_at: string
        total_wards: number
        total_promises: number
        version: string
    }
    wards: Record<string, WardData>
}

// ─── Cache ────────────────────────────────────────────────────────────────────

// Cast the imported JSON to our typed structure
const wardData = wardDataRaw as WardDataFile

/**
 * Get a single ward by ward number.
 * Returns null if the ward doesn't exist.
 */
export function getWard(wardNo: number | string): WardData | null {
    return wardData.wards[String(wardNo)] ?? null
}

/**
 * Get all wards as an array, optionally filtered.
 */
export function getAllWards(filters?: {
    party?: string
    is_women_reserved?: boolean
}): WardData[] {
    let wards = Object.values(wardData.wards)

    if (filters?.party) {
        const party = filters.party.toLowerCase()
        wards = wards.filter(w =>
            w.winner.party.toLowerCase().includes(party)
        )
    }

    if (filters?.is_women_reserved !== undefined) {
        wards = wards.filter(w =>
            w.is_women_reserved === filters.is_women_reserved
        )
    }

    return wards.sort((a, b) => a.ward_number - b.ward_number)
}

/**
 * Get just the winners array — lighter payload than full ward data.
 */
export function getAllWinners(): Array<WardData['winner'] & {
    ward_number: number
    ward_name: string | null
}> {
    return Object.values(wardData.wards)
        .sort((a, b) => a.ward_number - b.ward_number)
        .map(w => ({
            ward_number: w.ward_number,
            ward_name: w.ward_name,
            ...w.winner,
        }))
}

/**
 * Get metadata about the cached data.
 */
export function getCacheMeta() {
    return wardData._meta
}