import { NextRequest, NextResponse } from 'next/server'

const wardWeatherCache = new Map<string, { data: object; timestamp: number }>()
const CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const lat = searchParams.get('lat')
        const lon = searchParams.get('lon')

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

        // Check cache
        const cacheKey = `${lat},${lon}`
        const cached = wardWeatherCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
            return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
        }

        const apiKey = process.env.OPENWEATHER_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenWeatherMap API key not configured.' },
                { status: 500 }
            )
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&appid=${apiKey}&units=metric`
        const res = await fetch(url)

        if (!res.ok) throw new Error(`OpenWeatherMap returned ${res.status}`)

        const w = await res.json()

        const data = {
            temp: Math.round(w.main.temp),
            feels_like: Math.round(w.main.feels_like),
            humidity: w.main.humidity,
            wind_kmh: Math.round(w.wind.speed * 3.6 * 10) / 10,
            condition: w.weather[0].main,
            description: w.weather[0].description,
            icon_url: `https://openweathermap.org/img/wn/${w.weather[0].icon}@2x.png`,
            rainfall_1h: w.rain?.['1h'] ?? 0,
        }

        wardWeatherCache.set(cacheKey, { data, timestamp: Date.now() })

        return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } })

    } catch (error) {
        console.error('Ward weather error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch weather for this ward.' },
            { status: 500 }
        )
    }
}