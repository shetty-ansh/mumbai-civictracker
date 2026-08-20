import { NextRequest, NextResponse } from 'next/server'
import zoneCoordinates from '@/data/zone-coordinates.json'

// ─── Types ────────────────────────────────────────────────────────────────

interface AQIComponents {
    co: number
    no2: number
    o3: number
    so2: number
    pm2_5: number
    pm10: number
}

interface ZoneAQI {
    aqi: number       // 1–5 from OpenWeatherMap
    components: AQIComponents
    updated_at: number
}

interface WeatherData {
    temp: number
    feels_like: number
    humidity: number
    wind_kmh: number
    condition: string
    description: string
    icon: string
    icon_url: string
    rainfall_1h: number
    updated_at: number
}

interface EnvironmentResponse {
    weather: WeatherData
    zones: Record<string, ZoneAQI>
    cached_at: number
}

// ─── In-memory cache ──────────────────────────────────────────────────────
// Resets when the server restarts (Vercel cold start), which is fine.
// In production this gives you ~30 min cache per serverless instance.

let cache: { data: EnvironmentResponse; timestamp: number } | null = null
const CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────

function isCacheValid(): boolean {
    if (!cache) return false
    return Date.now() - cache.timestamp < CACHE_DURATION_MS
}

function buildIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

function msToKmh(ms: number): number {
    return Math.round(ms * 3.6 * 10) / 10  // 1 decimal place
}

// ─── Fetch weather for Mumbai (city-wide, called once) ────────────────────

async function fetchWeather(apiKey: string): Promise<WeatherData> {
    // Mumbai coordinates
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=19.076&lon=72.877&appid=${apiKey}&units=metric`
    const res = await fetch(url, { next: { revalidate: 0 } }) // no Next.js cache — we handle caching ourselves

    if (!res.ok) throw new Error(`Weather API error: ${res.status}`)

    const data = await res.json()

    return {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind_kmh: msToKmh(data.wind.speed),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        icon_url: buildIconUrl(data.weather[0].icon),
        // rain["1h"] only exists when it's actually raining — default to 0
        rainfall_1h: data.rain?.['1h'] ?? 0,
        updated_at: data.dt,
    }
}

// ─── Fetch AQI for one zone coordinate ───────────────────────────────────

async function fetchZoneAQI(
    apiKey: string,
    lat: number,
    lon: number
): Promise<ZoneAQI> {
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 0 } })

    if (!res.ok) throw new Error(`AQI API error: ${res.status}`)

    const data = await res.json()
    const item = data.list[0]

    return {
        aqi: item.main.aqi,   // integer 1–5
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
}

// ─── Fetch all 7 zones in parallel ────────────────────────────────────────

async function fetchAllZones(
    apiKey: string
): Promise<Record<string, ZoneAQI>> {
    const zoneKeys = Object.keys(zoneCoordinates) as Array<
        keyof typeof zoneCoordinates
    >

    // Fire all 7 API calls simultaneously — don't wait for one to finish before starting the next
    const results = await Promise.allSettled(
        zoneKeys.map((zone) => {
            const { lat, lon } = zoneCoordinates[zone]
            return fetchZoneAQI(apiKey, lat, lon).then((data) => ({ zone, data }))
        })
    )

    const zones: Record<string, ZoneAQI> = {}

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            zones[result.value.zone] = result.value.data
        } else {
            // One zone failed — log it but don't crash the whole response
            console.error('Zone AQI fetch failed:', result.reason)
        }
    })

    return zones
}

// ─── Route handler ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        // Serve from cache if still fresh
        if (isCacheValid() && cache) {
            return NextResponse.json(cache.data, {
                headers: {
                    'X-Cache': 'HIT',
                    'X-Cache-Age': String(
                        Math.round((Date.now() - cache.timestamp) / 1000)
                    ) + 's',
                },
            })
        }

        const apiKey = process.env.OPENWEATHER_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenWeatherMap API key not configured.' },
                { status: 500 }
            )
        }

        // Fetch weather and all zone AQIs in parallel
        const [weather, zones] = await Promise.all([
            fetchWeather(apiKey),
            fetchAllZones(apiKey),
        ])

        const responseData: EnvironmentResponse = {
            weather,
            zones,
            cached_at: Date.now(),
        }

        // Store in cache
        cache = { data: responseData, timestamp: Date.now() }

        return NextResponse.json(responseData, {
            headers: { 'X-Cache': 'MISS' },
        })

    } catch (error) {
        console.error('Environment API error:', error)

        // If cache exists but is stale, return it anyway rather than erroring
        // Better to show slightly old data than nothing
        if (cache) {
            return NextResponse.json(cache.data, {
                headers: { 'X-Cache': 'STALE' },
            })
        }

        return NextResponse.json(
            { error: 'Failed to fetch environment data.' },
            { status: 500 }
        )
    }
}