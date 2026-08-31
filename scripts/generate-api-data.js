/**
 * scripts/generate-api-data.js
 * =============================
 * Run at build time to generate the consolidated ward JSON.
 * Pulls winners, candidate info, and promises from Supabase.
 * Outputs: data/api/ward-data.json
 *
 * Usage:
 *   node scripts/generate-api-data.js
 *
 * Add to package.json:
 *   "build": "node scripts/generate-api-data.js && next build"
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// ─── Supabase client ──────────────────────────────────────────────────────────

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
    console.log(`[generate] ${msg}`)
}

/** Paginate through Supabase — 1000 row limit per request */
async function fetchAll(queryFn) {
    const PAGE_SIZE = 1000
    let from = 0
    let results = []
    let hasMore = true

    while (hasMore) {
        const { data, error } = await queryFn(from, from + PAGE_SIZE - 1)
        if (error) throw new Error(`Supabase error: ${error.message}`)
        if (!data || data.length === 0) break
        results = [...results, ...data]
        from += PAGE_SIZE
        if (data.length < PAGE_SIZE) hasMore = false
    }

    return results
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchWinners() {
    log('Fetching winners from bmc_candidates...')

    const winners = await fetchAll((from, to) =>
        supabase
            .from('bmc_candidates')
            .select(`
        id,
        ward_no,
        ward_name,
        candidate_name,
        party_name,
        symbol,
        is_women_reserved,
        votes:bmc_candidate_votes!bmc_candidate_votes_candidate_fkey(votes),
        case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(
          education,
          active_cases,
          closed_cases
        )
      `)
            .eq('winnner', true)
            .order('ward_no', { ascending: true })
            .range(from, to)
    )

    log(`  Found ${winners.length} winners`)
    return winners
}

async function fetchPromises(candidateIds) {
    log('Fetching promises from candidate_promises...')

    if (!candidateIds.length) {
        log('  No candidate IDs — skipping')
        return []
    }

    const promises = await fetchAll((from, to) =>
        supabase
            .from('candidate_promises')
            .select(`
        id,
        candidate_id,
        promise_text,
        category,
        upvote_count,
        total_votes,
        created_at
      `)
            .in('candidate_id', candidateIds)
            .range(from, to)
    )

    log(`  Found ${promises.length} promises`)
    return promises
}

// ─── Shapers ──────────────────────────────────────────────────────────────────

function shapeWinner(raw) {
    const votes = Array.isArray(raw.votes) && raw.votes.length ? raw.votes[0].votes : null
    const caseInfo = Array.isArray(raw.case_info) && raw.case_info.length ? raw.case_info[0] : null

    return {
        id: raw.id,
        name: raw.candidate_name,
        party: raw.party_name,
        symbol: raw.symbol || null,
        votes: votes || null,
        education: caseInfo?.education || null,
        pending_cases: caseInfo?.active_cases ?? null,
        closed_cases: caseInfo?.closed_cases ?? null,
    }
}

function shapePromise(raw) {
    return {
        id: raw.id,
        text: raw.promise_text,
        category: raw.category,
        upvotes: raw.upvote_count,
        total_votes: raw.total_votes,
        created_at: raw.created_at,
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generate() {
    console.log('\n' + '─'.repeat(50))
    log('Starting ward data generation')
    console.log('─'.repeat(50))

    // 1. Validate env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
            'Missing environment variables.\n' +
            'Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local'
        )
    }

    // 2. Fetch winners
    const winners = await fetchWinners()
    if (!winners.length) {
        throw new Error('No winners found — check your Supabase connection and data')
    }

    // 3. Collect winner IDs for promises lookup
    const winnerIds = winners.map(w => w.id)

    // 4. Fetch all promises for all winners in one query
    const allPromises = await fetchPromises(winnerIds)

    // 5. Group promises by candidate_id for O(1) lookup
    const promisesByCandidate = {}
    for (const promise of allPromises) {
        if (!promisesByCandidate[promise.candidate_id]) {
            promisesByCandidate[promise.candidate_id] = []
        }
        promisesByCandidate[promise.candidate_id].push(shapePromise(promise))
    }

    // 6. Build consolidated object keyed by ward number
    log('Building consolidated ward object...')
    const wardData = {}

    for (const winner of winners) {
        const ward_no = winner.ward_no

        wardData[ward_no] = {
            ward_number: ward_no,
            ward_name: winner.ward_name || null,
            is_women_reserved: winner.is_women_reserved || false,
            winner: shapeWinner(winner),
            promises: promisesByCandidate[winner.id] || [],
        }
    }

    // 7. Check coverage
    const totalWards = Object.keys(wardData).length
    log(`Built data for ${totalWards} wards`)

    const missingWards = []
    for (let i = 1; i <= 227; i++) {
        if (!wardData[i]) missingWards.push(i)
    }

    if (missingWards.length) {
        log(`WARNING: Missing data for wards: ${missingWards.join(', ')}`)
    } else {
        log('All 227 wards covered ✓')
    }

    // 8. Final output structure
    const output = {
        _meta: {
            generated_at: new Date().toISOString(),
            total_wards: totalWards,
            total_promises: allPromises.length,
            version: '1.0',
        },
        wards: wardData,
    }

    // 9. Write to file
    const outputDir = path.join(process.cwd(), 'data', 'api')
    const outputFile = path.join(outputDir, 'ward-data.json')

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
        log('Created directory: data/api/')
    }

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8')

    const fileSizeKB = (fs.statSync(outputFile).size / 1024).toFixed(1)
    log(`Written to data/api/ward-data.json (${fileSizeKB} KB)`)

    // 10. Print sample ward for verification
    const firstWard = wardData[1] || wardData[Object.keys(wardData)[0]]
    console.log('\nSample output (Ward 1):')
    console.log(JSON.stringify(firstWard, null, 2))

    console.log('\n' + '─'.repeat(50))
    log('Generation complete ✓')
    console.log('─'.repeat(50) + '\n')
}

generate().catch(err => {
    console.error('\n[generate] FAILED:', err.message)
    process.exit(1)
})