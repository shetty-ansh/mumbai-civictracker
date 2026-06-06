'use client';

import { useWeatherForecast } from '@/lib/hooks/useWeatherForecast';
import { getWardCenter } from '@/lib/ward-utils';
import { useEffect, useState } from 'react';

interface ForecastDisplayProps {
  wardId?: string;
  lat?: number;
  lon?: number;
  autoFetch?: boolean;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
}

interface ForecastResponse {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
  };
}

export function ForecastDisplay({
  wardId,
  lat,
  lon,
  autoFetch = false,
}: ForecastDisplayProps) {
  const { forecast, loading, error, fetchForecast, getCurrentLocationForecast } =
    useWeatherForecast();
  const [displayData, setDisplayData] = useState<ForecastResponse | null>(null);

  useEffect(() => {
    if (autoFetch) {
      if (wardId) {
        const wardCenter = getWardCenter(wardId);
        if (wardCenter) {
          fetchForecast(wardCenter.lat, wardCenter.lng, wardId);
        }
      } else if (lat !== undefined && lon !== undefined) {
        fetchForecast(lat, lon);
      }
    }
  }, [autoFetch, wardId, lat, lon, fetchForecast]);

  useEffect(() => {
    if (forecast?.forecast) {
      setDisplayData(forecast.forecast as ForecastResponse);
    }
  }, [forecast]);

  const handleGetMyLocation = async () => {
    await getCurrentLocationForecast();
  };

  const handleWardForecast = async (id: string) => {
    const wardCenter = getWardCenter(id);
    if (wardCenter) {
      await fetchForecast(wardCenter.lat, wardCenter.lng, id);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleGetMyLocation}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Loading...' : 'Get My Location Forecast'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          Fetching forecast...
        </div>
      )}

      {/* Forecast Display */}
      {displayData && !loading && (
        <div className="space-y-4">
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <h3 className="font-semibold text-lg mb-2">
              {displayData.city.name}, {displayData.city.country}
            </h3>
            {forecast?.wardId && (
              <p className="text-sm text-stone-600">Ward {forecast.wardId}</p>
            )}
            <p className="text-xs text-stone-500 mt-1">
              Updated: {new Date(forecast?.timestamp || '').toLocaleString()}
            </p>
          </div>

          {/* Forecast Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayData.list.slice(0, 8).map((item) => {
              const date = new Date(item.dt * 1000);
              const weather = item.weather[0];

              return (
                <div
                  key={item.dt}
                  className="p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-medium text-stone-900">
                    {date.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-stone-500 mb-2">
                    {date.toLocaleDateString()}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-stone-900">
                        {Math.round(item.main.temp)}°C
                      </span>
                      <span className="text-xs text-stone-600">
                        Feels {Math.round(item.main.feels_like)}°C
                      </span>
                    </div>

                    <p className="text-sm capitalize text-stone-700">
                      {weather.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                      <div>
                        <p className="font-medium">Humidity</p>
                        <p>{item.main.humidity}%</p>
                      </div>
                      <div>
                        <p className="font-medium">Wind</p>
                        <p>{item.wind.speed.toFixed(1)} m/s</p>
                      </div>
                      <div>
                        <p className="font-medium">Pressure</p>
                        <p>{item.main.pressure} hPa</p>
                      </div>
                      <div>
                        <p className="font-medium">Clouds</p>
                        <p>{item.clouds.all}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!forecast && !loading && !error && (
        <div className="p-8 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200">
          <p className="text-stone-500">
            Click "Get My Location Forecast" or select a ward to view the forecast
          </p>
        </div>
      )}
    </div>
  );
}
