import React from 'react';

export default function ImageUpload({ onImageChange, isIdentifying, readOnly }) {
    if (readOnly) return null;

    return (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <label htmlFor="image" style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>📸 Ladda upp bild</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Vi identifierar art, plats och väder automatiskt!
            </p>
            <input
                id="image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                autoComplete="off"
                data-lpignore="true"
                style={{ backgroundColor: 'var(--color-input-bg)' }}
            />
            {isIdentifying && (
                <p style={{ fontSize: '0.9rem', color: 'var(--color-accent)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="spinner">⌛</span> Identifierar fiskart med AI...
                </p>
            )}
        </div>
    );
}
