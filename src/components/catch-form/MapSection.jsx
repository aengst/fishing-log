import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
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
        console.log("RecenterMap update:", lat, lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            map.setView([lat, lng], 13);
            map.invalidateSize(); // Force redraw
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

export default function MapSection({ lat, lng, setMapPosition, readOnly }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label>Kartposition</label>
            <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative', pointerEvents: readOnly ? 'none' : 'auto' }}>
                <MapContainer
                    key={`${lat}-${lng}`}
                    center={[lat || 59.3293, lng || 18.0686]}
                    zoom={lat && lng ? 13 : 6}
                    style={{ height: '100%', width: '100%' }}
                    dragging={!readOnly}
                    touchZoom={!readOnly}
                    doubleClickZoom={!readOnly}
                    scrollWheelZoom={!readOnly}
                    zoomControl={!readOnly}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <RecenterMap lat={lat} lng={lng} />
                    <LocationMarker
                        position={lat ? [lat, lng] : null}
                        setPosition={setMapPosition}
                    />
                </MapContainer>
            </div>
            {lat && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Vald position: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none' }}
                    >
                        Öppna i Google Maps ↗
                    </a>
                </div>
            )}
        </div>
    );
}
