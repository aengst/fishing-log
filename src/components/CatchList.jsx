import React from 'react';

const getWeatherIcon = (description) => {
    if (!description) return '🌤️';
    const lower = description.toLowerCase();
    if (lower.includes('sol') || lower.includes('klart')) return '☀️';
    if (lower.includes('moln') || lower.includes('mulet')) return '☁️';
    if (lower.includes('regn') || lower.includes('skur')) return '🌧️';
    if (lower.includes('åska')) return '⚡';
    if (lower.includes('snö') || lower.includes('frost')) return '❄️';
    if (lower.includes('dimma')) return '🌫️';
    if (lower.includes('halvklart')) return '⛅';
    return '🌤️';
};

const getWindDirectionCardinal = (degrees) => {
    if (degrees === undefined || degrees === null) return '';
    const directions = ['N', 'NO', 'O', 'SO', 'S', 'SV', 'V', 'NV'];
    const index = Math.round(degrees / 45) % 8;
    return `${directions[index]} (${degrees}°)`;
};

export default function CatchList({ catches, onDelete, onEdit }) {
    if (!catches || catches.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <p>Inga fångster registrerade än. Ut och fiska! 🎣</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>Loggbok</h2>
            {catches.map((item) => (
                <div
                    key={item.id}
                    className="catch-item"
                    onClick={() => onEdit(item)}
                    style={{ cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <div>
                        <span className="catch-title">{item.species} - {item.weight} kg</span>
                        <div className="catch-details">
                            {item.latitude && item.longitude ? (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--color-accent)', textDecoration: 'none', cursor: 'pointer' }}
                                >
                                    📍 {item.location || 'Visa på karta'}
                                </a>
                            ) : (
                                <span>📍 {item.location || '-'}</span>
                            )}

                            <span>🪱 {item.bait || '-'}</span>
                        </div>
                        <div className="catch-details">
                            {item.air_temp && <span>🌡️ Luft: {item.air_temp}°C</span>}
                            {item.water_temp && <span>💧 Vatten: {item.water_temp}°C</span>}
                        </div>
                        <div className="catch-details">
                            {item.weather_description && (
                                <span>{getWeatherIcon(item.weather_description)} {item.weather_description}</span>
                            )}
                            {item.wind_speed && (
                                <span>💨 {item.wind_speed} m/s {item.wind_direction ? `(${getWindDirectionCardinal(item.wind_direction)})` : ''}</span>
                            )}
                        </div>
                        {item.image_url && (
                            <img
                                src={item.image_url}
                                alt="Fångst"
                                style={{ marginTop: '0.5rem', borderRadius: '8px', maxWidth: '200px', display: 'block' }}
                                onError={(e) => {
                                    console.error("Image failed to load:", item.image_url);
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {item.catch_date
                            ? new Date(item.catch_date).toLocaleString()
                            : new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => onEdit(item)}
                            style={{ padding: '0.5rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#3b82f6' }}
                        >
                            ✏️ Ändra
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            style={{ padding: '0.5rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#ef4444' }}
                        >
                            🗑️ Ta bort
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
