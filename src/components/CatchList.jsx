import React from 'react';

export default function CatchList({ catches }) {
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
                <div key={item.id} className="catch-item">
                    <div>
                        <span className="catch-title">{item.species} - {item.weight} kg</span>
                        <div className="catch-details">
                            <span>📍 {item.location || '-'}</span>
                            <span>🪱 {item.bait || '-'}</span>
                        </div>
                        <div className="catch-details">
                            {item.air_temp && <span>🌤️ {item.air_temp}°C</span>}
                            {item.water_temp && <span>💧 {item.water_temp}°C</span>}
                        </div>
                        {item.image_url && (
                            <img
                                src={item.image_url}
                                alt="Fångst"
                                style={{ marginTop: '0.5rem', borderRadius: '8px', maxWidth: '200px', display: 'block' }}
                            />
                        )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </span>
                </div>
            ))}
        </div>
    );
}
