import React, { useState } from 'react';

export default function CatchForm({ onAddCatch }) {
    const [formData, setFormData] = useState({
        species: '',
        weight: '',
        bait: '',
        location: '',
        airTemp: '',
        waterTemp: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddCatch(formData);
        setFormData({
            species: '', weight: '', bait: '', location: '', airTemp: '', waterTemp: ''
        });
    };

    return (
        <div className="card">
            <h2>Ny Fångst</h2>
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

                <div>
                    <label>Plats</label>
                    <input
                        name="location"
                        placeholder="T.ex. Mälaren, Bryggan"
                        value={formData.location}
                        onChange={handleChange}
                    />
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

                <button type="submit">Spara Fångst</button>
            </form>
        </div>
    );
}
