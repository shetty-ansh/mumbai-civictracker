import { NextRequest, NextResponse } from 'next/server'

// ─── Per-ward cache ───────────────────────────────────────────────────────
// Keyed by "lat,lon" string. Each ward click result cached for 1 hour.

const wardCache = new Map<string, { data: object; timestamp: number }>()
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

// ─── AQI level label mapping (OpenWeatherMap 1–5 scale) ──────────────────

const AQI_LABELS: Record<number, string> = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor',
}

const AQI_COLORS: Record<number, string> = {
    1: '#00C853',  // green
    2: '#8BC34A',  // light green
    3: '#FFC107',  // amber
    4: '#FF5722',  // orange
    5: '#B71C1C',  // red
}

// ─── Route handler ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const lat = searchParams.get('lat')
        const lon = searchParams.get('lon')

        // Validate coordinates
        if (!lat || !lon) {
            return NextResponse.json(
                { error: 'lat and lon query parameters are required.' },
                { status: 400 }
            )
        }

        const latNum = parseFloat(lat)
        const lonNum = parseFloat(lon)

        if (isNaN(latNum) || isNaN(lonNum)) {
            return NextResponse.json(
                { error: 'lat and lon must be valid numbers.' },
                { status: 400 }
            )
        }

        // Check per-ward cache
        const cacheKey = `${lat},${lon}`
        const cached = wardCache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
            return NextResponse.json(cached.data, {
                headers: { 'X-Cache': 'HIT' },
            })
        }

        const apiKey = process.env.OPENWEATHER_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenWeatherMap API key not configured.' },
                { status: 500 }
            )
        }

        // Call OpenWeatherMap Air Pollution API with the exact ward coordinates
        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latNum}&lon=${lonNum}&appid=${apiKey}`
        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`OpenWeatherMap returned ${res.status}`)
        }

        const raw = await res.json()
        const item = raw.list[0]
        const aqiLevel = item.main.aqi

        const data = {
            aqi: aqiLevel,
            label: AQI_LABELS[aqiLevel],
            color: AQI_COLORS[aqiLevel],
            components: {
                co: item.components.co,
                no2: item.components.no2,
                o3: item.components.o3,
                so2: item.components.so2,
                pm2_5: item.components.pm2_5,
                pm10: item.components.pm10,
            },
            updated_at: item.dt,
        }

        // Store in per-ward cache
        wardCache.set(cacheKey, { data, timestamp: Date.now() })

        return NextResponse.json(data, {
            headers: { 'X-Cache': 'MISS' },
        })

    } catch (error) {
        console.error('Ward AQI error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch AQI for this ward.' },
            { status: 500 }
        )
    }
}