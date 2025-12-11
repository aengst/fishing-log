import React, { useState, useEffect } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { useAIIdentification } from '../../hooks/useAIIdentification';
import { exifUtils } from '../../utils/exif';
import MapSection from './MapSection';
import ImageUpload from './ImageUpload';
import WeatherSection from './WeatherSection';
import CatchDetailsFields from './CatchDetailsFields';

export default function CatchForm({ onAddCatch, onUpdateCatch, selectedCatch, isEditing, onStartEdit, onCancelEdit, onClose }) {
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
        weatherDescription: ''
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
                species: '', weight: '', length: '', bait: '', location: '', catchDate: new Date().toISOString().slice(0, 16), airTemp: '', waterTemp: '', windSpeed: '', windDirection: '', weatherDescription: ''
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
                {!selectedCatch && <span></span>}
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
                            <img src={selectedCatch.image_url} alt="Fångst" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', backgroundColor: '#000' }} />
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
