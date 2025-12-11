import React from 'react';
import { formatters } from '../../utils/formatters';

export default function WeatherSection({ formData, handleChange, readOnly }) {
    return (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>🌍 Väderdata</h3>
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
                    <label htmlFor="windDirection">Vindriktning</label>
                    {readOnly ? (
                        <input
                            value={formatters.getWindDirectionCardinal(formData.windDirection) || ''}
                            disabled
                            className="read-only-input"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: 'none',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                backgroundColor: 'transparent',
                                color: 'var(--color-text-main)',
                                fontSize: '1rem',
                            }}
                        />
                    ) : (
                        <select
                            id="windDirection"
                            name="windDirection"
                            value={formData.windDirection !== null ? formData.windDirection : ''}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-input-bg)',
                                color: 'var(--color-text-main)',
                                fontSize: '1rem',
                                marginBottom: '1rem',
                                appearance: 'none',
                            }}
                        >
                            <option value="">Välj riktning...</option>
                            <option value="0">Nord (N)</option>
                            <option value="45">Nordost (NO)</option>
                            <option value="90">Ost (O)</option>
                            <option value="135">Sydost (SO)</option>
                            <option value="180">Syd (S)</option>
                            <option value="225">Sydväst (SV)</option>
                            <option value="270">Väst (V)</option>
                            <option value="315">Nordväst (NV)</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
}
