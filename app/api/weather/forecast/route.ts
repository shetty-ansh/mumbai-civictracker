import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

interface ForecastRequest {
  lat: number;
  lon: number;
  wardId?: string;
}

interface WeatherForecast {
  wardId?: string;
  lat: number;
  lon: number;
  forecast: unknown;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenWeather API key not configured' },
        { status: 500 }
      );
    }

    const body: ForecastRequest = await request.json();
    const { lat, lon, wardId } = body;

    // Validate coordinates
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat and lon must be numbers.' },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      );
    }

    // Build OpenWeather API URL
    const url = new URL(OPENWEATHER_BASE_URL);
    url.searchParams.append('lat', lat.toString());
    url.searchParams.append('lon', lon.toString());
    url.searchParams.append('appid', OPENWEATHER_API_KEY);
    url.searchParams.append('units', 'metric'); // Use Celsius

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenWeather API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch weather data from OpenWeather' },
        { status: response.status }
      );
    }

    const forecastData = await response.json();

    const result: WeatherForecast = {
      lat,
      lon,
      forecast: forecastData,
      timestamp: new Date().toISOString(),
    };

    if (wardId) {
      result.wardId = wardId;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Weather forecast API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
