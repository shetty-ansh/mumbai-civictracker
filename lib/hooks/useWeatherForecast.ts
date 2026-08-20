'use client';

import { useState, useCallback } from 'react';

interface ForecastData {
  wardId?: string;
  lat: number;
  lon: number;
  forecast: unknown;
  timestamp: string;
}

interface UseWeatherForecastReturn {
  forecast: ForecastData | null;
  loading: boolean;
  error: string | null;
  fetchForecast: (lat: number, lon: number, wardId?: string) => Promise<void>;
  getCurrentLocationForecast: () => Promise<void>;
}

export function useWeatherForecast(): UseWeatherForecastReturn {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(
    async (lat: number, lon: number, wardId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/weather/forecast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lat,
            lon,
            wardId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch forecast');
        }

        const data: ForecastData = await response.json();
        setForecast(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('Weather forecast error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCurrentLocationForecast = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchForecast(latitude, longitude);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
        setLoading(false);
      }
    );
  }, [fetchForecast]);

  return {
    forecast,
    loading,
    error,
    fetchForecast,
    getCurrentLocationForecast,
  };
}
