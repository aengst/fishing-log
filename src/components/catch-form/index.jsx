import React, { useState, useEffect } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { useAIIdentification } from '../../hooks/useAIIdentification';
import { exifUtils } from '../../utils/exif';
import MapSection from './MapSection';
import ImageUpload from './ImageUpload';
import WeatherSection from './WeatherSection';
import CatchDetailsFields from './CatchDetailsFields';

export default function CatchForm({ onAddCatch, onUpdateCatch, selectedCatch, isEditing, onStartEdit, onCancelEdit, onClose, onNext, onPrevious, hasNext, hasPrevious }) {
    const readOnly = selectedCatch && !isEditing;

    const [formData, setFormData] = useState({
        species: '',
        weight: '',
        length: '',
        bait: '',
        location: '',
        lat: null,
        lng: null,
        catchDate: new Date().toISOString().slice(0, 16),
        airTemp: '',
        waterTemp: '',
        windSpeed: '',
        windDirection: '',
        weatherDescription: '',
        fishingMethod: ''
    });

    const { identify, isIdentifying } = useAIIdentification();
    const { weather: weatherData, fetchWeather } = useWeather();

    useEffect(() => {
        if (weatherData.airTemp || weatherData.weatherDescription) {
            setFormData(prev => ({
                ...prev,
                ...weatherData
            }));
        }
    }, [weatherData]);


    useEffect(() => {
        if (selectedCatch) {
            setFormData({
                species: selectedCatch.species || '',
                weight: selectedCatch.weight || '',
                length: selectedCatch.length || '',
                fishingMethod: selectedCatch.fishing_method || '',
                bait: selectedCatch.bait || '',
                location: selectedCatch.location || '',
                lat: selectedCatch.latitude ? parseFloat(selectedCatch.latitude) : null,
                lng: selectedCatch.longitude ? parseFloat(selectedCatch.longitude) : null,
                catchDate: selectedCatch.catch_date ? new Date(selectedCatch.catch_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                airTemp: selectedCatch.air_temp || '',
                waterTemp: selectedCatch.water_temp || '',
                windSpeed: selectedCatch.wind_speed || '',
                windDirection: selectedCatch.wind_direction,
                weatherDescription: selectedCatch.weather_description || ''
            });
        } else {
            setFormData({
                species: '',
                weight: '',
                length: '',
                bait: '',
                location: '',
                lat: null,
                lng: null,
                catchDate: new Date().toISOString().slice(0, 16),
                airTemp: '',
                waterTemp: '',
                windSpeed: '',
                windDirection: '',
                weatherDescription: '',
                fishingMethod: ''
            });
        }
    }, [selectedCatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const setMapPosition = (latlng) => {
        setFormData(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));

            // 1. EXIF Data
            const exifData = await exifUtils.extractData(file);
            let updatedData = {};

            if (exifData) {
                if (exifData.lat && exifData.lng) {
                    updatedData.lat = exifData.lat;
                    updatedData.lng = exifData.lng;
                    if (!formData.location) {
                        updatedData.location = "Från bild (GPS)";
                    }
                }
                if (exifData.date) {
                    updatedData.catchDate = exifData.date.toISOString().slice(0, 16);
                }
            }

            // Update form with EXIF data immediately so we have it for weather fetching
            setFormData(prev => ({ ...prev, ...updatedData }));

            // 2. Weather Fetching
            // Use the NEW coord/date if available, otherwise existing state
            const targetLat = updatedData.lat || formData.lat;
            const targetLng = updatedData.lng || formData.lng;
            const targetDate = updatedData.catchDate || formData.catchDate;

            if (targetLat && targetLng && targetDate) {
                fetchWeather(targetLat, targetLng, targetDate);
            }

            // 3. AI Identification
            const species = await identify(file);
            if (species) {
                setFormData(prev => ({ ...prev, species }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCatch && isEditing) {
            onUpdateCatch(selectedCatch.id, formData);
        } else {
            onAddCatch(formData);
        }

        if (!selectedCatch) {
            setFormData({
                species: '', weight: '', length: '', fishingMethod: '', bait: '', location: '', catchDate: new Date().toISOString().slice(0, 16), airTemp: '', waterTemp: '', windSpeed: '', windDirection: '', weatherDescription: ''
            });
        }
    };

    return (
        <div className={`card ${readOnly ? 'read-only-mode' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>
                    {selectedCatch
                        ? (isEditing ? 'Redigera Fångst' : 'Fångstdetaljer')
                        : 'Ny Fångst'}
                </h2>
                {readOnly && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', marginRight: '1rem' }}>
                        <button
                            type="button"
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid var(--color-border)',
                                color: hasPrevious ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                cursor: hasPrevious ? 'pointer' : 'not-allowed',
                                fontSize: '1.2rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '8px',
                                opacity: hasPrevious ? 1 : 0.5
                            }}
                            title="Föregående (nyare)"
                        >
                            ⬅️
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!hasNext}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid var(--color-border)',
                                color: hasNext ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                cursor: hasNext ? 'pointer' : 'not-allowed',
                                fontSize: '1.2rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '8px',
                                opacity: hasNext ? 1 : 0.5
                            }}
                            title="Nästa (äldre)"
                        >
                            ➡️
                        </button>
                    </div>
                )}
                {readOnly && (
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-main)',
                            fontSize: '0.9rem',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            width: 'auto'
                        }}
                    >
                        ❌ Stäng
                    </button>
                )}
                {(readOnly || !selectedCatch) && (
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-main)',
                            fontSize: '0.9rem',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            width: 'auto'
                        }}
                    >
                        ❌ Stäng
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
                <fieldset disabled={readOnly} style={{ border: 'none', padding: 0, margin: 0 }}>
                    <ImageUpload
                        onImageChange={handleImageChange}
                        isIdentifying={isIdentifying}
                        readOnly={readOnly}
                    />

                    {readOnly && selectedCatch && selectedCatch.image_url && (
                        <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                            <img
                                src={selectedCatch.image_url}
                                alt="Fångst"
                                onClick={() => window.open(selectedCatch.image_url, '_blank')}
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', backgroundColor: '#000', cursor: 'pointer' }}
                            />
                        </div>
                    )}

                    <CatchDetailsFields
                        formData={formData}
                        handleChange={handleChange}
                    />

                    <MapSection
                        lat={formData.lat}
                        lng={formData.lng}
                        setMapPosition={setMapPosition}
                        readOnly={readOnly}
                    />

                    <WeatherSection
                        formData={formData}
                        handleChange={handleChange}
                        readOnly={readOnly}
                    />
                </fieldset>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    {readOnly ? (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); onStartEdit(); }}
                                style={{ flex: 1 }}
                            >
                                ✏️ Ändra
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                            >
                                Stäng
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="submit" style={{ flex: 1 }}>
                                {isEditing ? 'Uppdatera' : 'Spara Fångst'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={onCancelEdit}
                                    style={{ flex: 1, backgroundColor: '#64748b', color: '#ffffff' }}
                                >
                                    Avbryt
                                </button>
                            )}
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
