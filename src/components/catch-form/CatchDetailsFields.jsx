import React from 'react';

export default function CatchDetailsFields({ formData, handleChange }) {
    return (
        <>
            <div style={{ marginBottom: '1rem' }}>
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

            <div className="form-grid">
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
                <div>
                    <label htmlFor="length">Längd (cm)</label>
                    <input
                        id="length"
                        name="length"
                        type="number"
                        step="1"
                        placeholder="0"
                        value={formData.length}
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
        </>
    );
}
