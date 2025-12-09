import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

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
        console.log("RecenterMap triggering with:", lat, lng);
        if (lat !== null && lng !== null) {
            map.setView([lat, lng], 13); // Changed to setView for instant snap, flyTo can sometimes be interrupted
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
        }
    }, [editingCatch])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Function to handle map updates
    const setMapPosition = (latlng) => {
        setFormData(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));
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
            <h2>{editingCatch ? 'Redigera Fångst' : 'Ny Fångst'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div>
                        <label>Art</label>
                        <input
                            name="species"
                            placeholder="T.ex. Gädda"
                            required
                            value={formData.species}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Vikt (kg)</label>
                        <input
                            name="weight"
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            required
                            value={formData.weight}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div>
                        <label>Datum & Tid</label>
                        <input
                            name="catchDate"
                            type="datetime-local"
                            required
                            value={formData.catchDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Plats (Namn)</label>
                        <input
                            name="location"
                            placeholder="T.ex. Mälaren"
                            value={formData.location}
                            onChange={handleChange}
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
                    <label>Bete</label>
                    <input
                        name="bait"
                        placeholder="T.ex. Jigg, Mask"
                        value={formData.bait}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-grid">
                    <div>
                        <label>Lufttemp (°C)</label>
                        <input
                            name="airTemp"
                            type="number"
                            placeholder="20"
                            value={formData.airTemp}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Vattentemp (°C)</label>
                        <input
                            name="waterTemp"
                            type="number"
                            placeholder="15"
                            value={formData.waterTemp}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label>Bild</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    />
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
