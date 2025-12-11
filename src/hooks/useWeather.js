import { useState } from 'react';
import { weatherApi } from '../api/weather';
import { formatters } from '../utils/formatters';

export function useWeather() {
    const [weather, setWeather] = useState({
        airTemp: '',
        waterTemp: '',
        windSpeed: '',
        windDirection: '',
        weatherDescription: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWeather = async (lat, lng, dateString) => {
        try {
            setLoading(true);
            setError(null);
            const data = await weatherApi.fetchHistoricalWeather(lat, lng, dateString);

            setWeather(prev => ({
                ...prev,
                airTemp: data.temp,
                windSpeed: data.wind,
                windDirection: formatters.snapToCardinal(data.dir),
                weatherDescription: formatters.getWeatherDescription(data.code)
            }));
        } catch (err) {
            console.error("Kunde inte hämta väder:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { weather, setWeather, fetchWeather, loading, error };
}
