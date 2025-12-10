import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import exifr from 'exifr';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ lat, lng }) {
    const map = useMap();
    React.useEffect(() => {

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            map.setView([lat, lng], 13);
        }
    }, [lat, lng, map]);
    return null;
}

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng)
        },
    })

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}



export default function CatchForm({ onAddCatch, onUpdateCatch, editingCatch, onCancelEdit }) {
    const [formData, setFormData] = useState({
        species: '',
        weight: '',
        bait: '',
        location: '',
        lat: null,
        lng: null,
        catchDate: new Date().toISOString().slice(0, 16),
        airTemp: '',
        waterTemp: ''
    });

    React.useEffect(() => {
        if (editingCatch) {
            setFormData({
                species: editingCatch.species || '',
                weight: editingCatch.weight || '',
                bait: editingCatch.bait || '',
                location: editingCatch.location || '',
                lat: editingCatch.latitude ? parseFloat(editingCatch.latitude) : null,
                lng: editingCatch.longitude ? parseFloat(editingCatch.longitude) : null,
                catchDate: editingCatch.catch_date ? new Date(editingCatch.catch_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                airTemp: editingCatch.air_temp || '',
                waterTemp: editingCatch.water_temp || ''
            })
        } else {
            setFormData({
                species: '',
                weight: '',
                bait: '',
                location: '',
                lat: null,
                lng: null,
                catchDate: new Date().toISOString().slice(0, 16),
                airTemp: '',
                waterTemp: ''
            });
        }
    }, [editingCatch])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Function to handle map updates
    const setMapPosition = (latlng) => {
        setFormData(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));

            let output = null;

            try {
                // Parse EXIF data including GPS and Dates using exifr
                output = await exifr.parse(file);

                if (output) {
                    let newLat = output.latitude;
                    let newLng = output.longitude;
                    let newDate = output.DateTimeOriginal || output.CreateDate;

                    let updatedData = {};

                    if (Number.isFinite(newLat) && Number.isFinite(newLng)) {
                        updatedData.lat = newLat;
                        updatedData.lng = newLng;
                        // Only auto-fill location name if empty
                        if (!formData.location) {
                            updatedData.location = "Från bild (GPS)";
                        }
                    }

                    if (newDate) {
                        const d = new Date(newDate);
                        if (!isNaN(d.getTime())) {
                            updatedData.catchDate = d.toISOString().slice(0, 16);
                        }
                    }

                    if (Object.keys(updatedData).length > 0) {
                        setFormData(prev => ({ ...prev, ...updatedData }));
                    }
                }


            } catch (err) {
                console.error("Fel vid inläsning av bild-data (EXIF):", err);
                console.error("Fel vid inläsning av bild-data (EXIF):", err);
            }

            // Weather Fetching Logic
            const fetchWeather = async (lat, lng, dateString) => {
                try {
                    const date = new Date(dateString);
                    const yyyyMmDd = date.toISOString().slice(0, 10);

                    // API requires distinct start/end dates
                    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${yyyyMmDd}&end_date=${yyyyMmDd}&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m`;

                    const response = await fetch(url);
                    const data = await response.json();

                    if (data && data.hourly) {
                        // Find the closest hour
                        const hourIndex = date.getHours();

                        const temp = data.hourly.temperature_2m[hourIndex];
                        const wind = data.hourly.windspeed_10m[hourIndex];
                        const dir = data.hourly.winddirection_10m[hourIndex];
                        const code = data.hourly.weathercode[hourIndex];

                        // WMO Weather interpretation
                        const weatherMap = {
                            0: 'Klart', 1: 'Mestadels klart', 2: 'Halvklart', 3: 'Mulet',
                            45: 'Dimma', 48: 'Rimfrost', 51: 'Lätt duggregn', 53: 'Duggregn',
                            55: 'Kraftigt duggregn', 61: 'Lätt regn', 63: 'Regn', 65: 'Kraftigt regn',
                            80: 'Regnskurar', 81: 'Kraftiga regnskurar', 95: 'Åska'
                        };

                        setFormData(prev => ({
                            ...prev,
                            airTemp: temp,
                            windSpeed: wind,
                            windDirection: dir,
                            weatherDescription: weatherMap[code] || `Kod ${code}`
                        }));
                        console.log("🌦️ Väder hämtat:", { temp, wind, dir, code });
                    }
                } catch (weatherErr) {
                    console.error("Kunde inte hämta väder:", weatherErr);
                }
            };

            // Call fetchWeather if we have location and date from EXIF (or defaults)
            // We use the 'updatedData' or fallback to current state if needed, 
            // but relying on the 'file' change event means we use the NEW values.
            // Getting them from 'output' (exif) is safest.

            if (output && Number.isFinite(output.latitude) && Number.isFinite(output.longitude)) {
                // Use EXIF date or fallback to now
                const dateToUse = output.DateTimeOriginal || output.CreateDate || new Date();
                fetchWeather(output.latitude, output.longitude, dateToUse);
            }


            // AI Fish Recognition
            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (apiKey) {
                    const { GoogleGenerativeAI } = await import("@google/generative-ai");
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

                    // Helper to convert file to base64
                    const fileToGenerativePart = async (file) => {
                        const base64EncodedDataPromise = new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result.split(',')[1]);
                            reader.readAsDataURL(file);
                        });
                        return {
                            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
                        };
                    };

                    const imagePart = await fileToGenerativePart(file);
                    const prompt = "Identifiera fiskarten på bilden. Svara ENDAST med artnamnet på svenska (t.ex. 'Gädda', 'Abborre'). Om det inte är en fisk, svara 'Okänd'.";

                    const result = await model.generateContent([prompt, imagePart]);
                    const response = await result.response;
                    const text = response.text().trim();

                    if (text && text.toLowerCase() !== 'okänd') {
                        setFormData(prev => ({ ...prev, species: text.replace(/\.$/, '') })); // Remove trailing dot
                    }
                } else {
                    console.warn("Ingen API-nyckel för Gemini hittades.");
                }

            } catch (aiErr) {
                console.error("AI-igenkänning misslyckades:", aiErr);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCatch) {
            onUpdateCatch(editingCatch.id, formData);
        } else {
            onAddCatch(formData);
        }

        if (!editingCatch) {
            setFormData({
                species: '', weight: '', bait: '', location: '', catchDate: new Date().toISOString().slice(0, 16), airTemp: '', waterTemp: ''
            });
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>{editingCatch ? 'Redigera Fångst' : 'Ny Fångst'}</h2>
                {editingCatch && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            fontSize: '0.9rem',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        ➕ Ny Fångst
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="form-grid">
                    <div>
                        <label htmlFor="species">Art</label>
                        <input
                            id="species"
                            name="species"
                            placeholder="T.ex. Gädda"
                            required
                            value={formData.species}
                            onChange={handleChange}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </div>
                    <div>
                        <label htmlFor="weight">Vikt (kg)</label>
                        <input
                            id="weight"
                            name="weight"
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            required
                            value={formData.weight}
                            onChange={handleChange}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div>
                        <label htmlFor="catchDate">Datum & Tid</label>
                        <input
                            id="catchDate"
                            name="catchDate"
                            type="datetime-local"
                            required
                            value={formData.catchDate}
                            onChange={handleChange}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </div>
                    <div>
                        <label htmlFor="location">Plats (Namn)</label>
                        <input
                            id="location"
                            name="location"
                            placeholder="T.ex. Mälaren"
                            value={formData.location}
                            onChange={handleChange}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Välj på karta (Klicka för att markera)</label>
                    <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                        <MapContainer
                            center={[59.3293, 18.0686]}
                            zoom={6}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <RecenterMap lat={formData.lat} lng={formData.lng} />
                            <LocationMarker
                                position={formData.lat ? [formData.lat, formData.lng] : null}
                                setPosition={setMapPosition}
                            />
                        </MapContainer>
                    </div>
                    {formData.lat && <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Vald position: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>}
                </div>

                <div>
                    <label htmlFor="bait">Bete</label>
                    <input
                        id="bait"
                        name="bait"
                        placeholder="T.ex. Jigg, Mask"
                        value={formData.bait}
                        onChange={handleChange}
                        autoComplete="off"
                        data-lpignore="true"
                    />
                </div>

                <div className="form-grid">
                    <div>
                        <label htmlFor="airTemp">Lufttemp (°C)</label>
                        <input
                            id="airTemp"
                            name="airTemp"
                            type="number"
                            placeholder="20"
                            value={formData.airTemp}
                            onChange={handleChange}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </div>
                    <div>
                        <label htmlFor="waterTemp">Vattentemp (°C)</label>
                        <input
                            id="waterTemp"
                            name="waterTemp"
                            type="number"
                            placeholder="15"
                            value={formData.waterTemp}
                            onChange={handleChange}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="image">Bild</label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        autoComplete="off"
                        data-lpignore="true"
                    />
                </div>

                {/* Weather Data (Auto-filled) */}
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>🌍 Väderdata (Hämtas automatiskt)</h3>
                    <div className="form-grid">
                        <div>
                            <label htmlFor="weatherDescription">Väderlek</label>
                            <input
                                id="weatherDescription"
                                name="weatherDescription"
                                placeholder="T.ex. Halvklart"
                                value={formData.weatherDescription || ''}
                                onChange={handleChange}
                                autoComplete="off"
                                data-lpignore="true"
                            />
                        </div>
                        <div>
                            <label htmlFor="windSpeed">Vindstyrka (m/s)</label>
                            <input
                                id="windSpeed"
                                name="windSpeed"
                                type="number"
                                placeholder="5.0"
                                value={formData.windSpeed || ''}
                                onChange={handleChange}
                                autoComplete="off"
                                data-lpignore="true"
                            />
                        </div>
                        <div>
                            <label htmlFor="windDirection">Vindriktning (°)</label>
                            <input
                                id="windDirection"
                                name="windDirection"
                                type="number"
                                placeholder="180"
                                value={formData.windDirection || ''}
                                onChange={handleChange}
                                autoComplete="off"
                                data-lpignore="true"
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit">{editingCatch ? 'Uppdatera' : 'Spara Fångst'}</button>
                    {editingCatch && (
                        <button type="button" onClick={onCancelEdit} style={{ backgroundColor: '#64748b' }}>
                            Avbryt
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}






