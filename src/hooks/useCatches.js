import { useState, useEffect, useCallback } from 'react';
import { catchesApi } from '../api/catches';

export function useCatches() {
    const [catches, setCatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCatches = useCallback(async () => {
        try {
            setLoading(true);
            const data = await catchesApi.fetchAll();
            setCatches(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCatches();
    }, [fetchCatches]);

    const addCatch = async (catchData) => {
        try {
            let imageUrl = null;
            if (catchData.image) {
                imageUrl = await catchesApi.uploadImage(catchData.image);
            }

            await catchesApi.add({
                species: catchData.species,
                weight: parseFloat(catchData.weight),
                length: catchData.length ? parseFloat(catchData.length) : null,
                bait: catchData.bait,
                location: catchData.location,
                air_temp: catchData.airTemp ? parseFloat(catchData.airTemp) : null,
                water_temp: catchData.waterTemp ? parseFloat(catchData.waterTemp) : null,
                catch_date: catchData.catchDate ? new Date(catchData.catchDate).toISOString() : new Date().toISOString(),
                latitude: catchData.lat,
                longitude: catchData.lng,
                image_url: imageUrl,
                wind_speed: catchData.windSpeed ? parseFloat(catchData.windSpeed) : null,
                wind_direction: catchData.windDirection ? parseFloat(catchData.windDirection) : null,
                weather_description: catchData.weatherDescription || null
            });

            fetchCatches();
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const deleteCatch = async (id) => {
        try {
            await catchesApi.delete(id);
            fetchCatches();
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Logic from App.jsx's updateCatch
    const updateCatch = async (id, updatedData, oldImageUrl) => {
        try {
            let imageUrl = oldImageUrl;

            if (updatedData.image) {
                imageUrl = await catchesApi.uploadImage(updatedData.image);
            }

            await catchesApi.update(id, {
                species: updatedData.species,
                weight: parseFloat(updatedData.weight),
                length: updatedData.length ? parseFloat(updatedData.length) : null,
                bait: updatedData.bait,
                location: updatedData.location,
                air_temp: updatedData.airTemp ? parseFloat(updatedData.airTemp) : null,
                water_temp: updatedData.waterTemp ? parseFloat(updatedData.waterTemp) : null,
                catch_date: updatedData.catchDate ? new Date(updatedData.catchDate).toISOString() : null,
                latitude: updatedData.lat,
                longitude: updatedData.lng,
                image_url: imageUrl,
                wind_speed: updatedData.windSpeed ? parseFloat(updatedData.windSpeed) : null,
                wind_direction: updatedData.windDirection ? parseFloat(updatedData.windDirection) : null,
                weather_description: updatedData.weatherDescription || null
            });

            fetchCatches();
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return {
        catches,
        loading,
        error,
        fetchCatches,
        addCatch,
        deleteCatch,
        updateCatch
    };
}
