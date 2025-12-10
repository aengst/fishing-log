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
    return directions[index];
};

export default function CatchList({ catches, onDelete, onEdit }) {
    if (!catches || catches.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🎣</div>
                <h3>Inga fångster än</h3>
                <p>Det ekar tomt här! Dags att ge sig ut?</p>
                <button
                    className="btn-primary-ghost"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        // Optional: focus the file input if possible, or just scroll top
                    }}
                >
                    📍 Registrera din första fångst
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2>Loggbok</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {catches.map((item) => (
                    <div
                        key={item.id}
                        className="catch-card"
                    >
                        {/* Header: Species & Date */}
                        <div className="catch-header">
                            <span className="catch-species">{item.species}</span>
                            <span className="catch-date">
                                {item.catch_date
                                    ? new Date(item.catch_date).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })
                                    : new Date(item.created_at).toLocaleDateString('sv-SE')}
                            </span>
                        </div>

                        {/* Body: Stats & Image */}
                        <div className="catch-body">
                            <div className="catch-info">
                                {/* Stats Row 1: Weight, Length, Temp */}
                                <div className="catch-stats-row">
                                    <span className="catch-stat" title="Vikt">⚖️ {item.weight} kg</span>
                                    {item.length && <span className="catch-stat" title="Längd">📏 {item.length} cm</span>}
                                    {item.air_temp && <span className="catch-stat" title="Lufttemperatur">🌡️ {item.air_temp}°C</span>}
                                </div>

                                {/* Stats Row 2: Location & Bait */}
                                <div className="catch-stats-row">
                                    {item.latitude && item.longitude ? (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="catch-stat"
                                            style={{ textDecoration: 'none', color: 'var(--color-accent)' }}
                                        >
                                            📍 {item.location || 'Visa karta'}
                                        </a>
                                    ) : (
                                        <span className="catch-stat">📍 {item.location || '-'}</span>
                                    )}
                                    <span className="catch-stat">🪱 {item.bait || '-'}</span>
                                </div>

                                {/* Stats Row 3: Weather & Wind */}
                                <div className="catch-stats-row">
                                    {item.weather_description && (
                                        <span className="catch-stat">
                                            {getWeatherIcon(item.weather_description)} {item.weather_description}
                                        </span>
                                    )}
                                    {item.wind_speed && (
                                        <span className="catch-stat">
                                            🌬️ {item.wind_speed} m/s
                                            {(item.wind_direction !== null && item.wind_direction !== undefined)
                                                ? ` (${getWindDirectionCardinal(item.wind_direction)})`
                                                : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Image Thumbnail */}
                            {item.image_url && (
                                <div onClick={() => window.open(item.image_url, '_blank')} style={{ cursor: 'pointer' }}>
                                    <img
                                        src={item.image_url}
                                        alt="Fångst"
                                        className="catch-image-thumb"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer: Actions */}
                        <div className="catch-actions">
                            <button
                                className="btn-icon"
                                onClick={() => onEdit(item)}
                            >
                                ✏️ Ändra
                            </button>
                            <button
                                className="btn-icon"
                                onClick={() => onDelete(item.id)}
                                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            >
                                🗑️ Ta bort
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
