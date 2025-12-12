import React from 'react';

export default function FilterSortBar({
    catches,
    filterCriteria,
    onFilterChange,
    sortConfig,
    onSortChange
}) {
    // 1. Extract unique values for filters
    const uniqueSpecies = [...new Set(catches.map(c => c.species).filter(Boolean))].sort();
    const uniqueBaits = [...new Set(catches.map(c => c.bait).filter(Boolean))].sort();
    const uniqueMethods = [...new Set(catches.map(c => c.fishing_method).filter(Boolean))].sort();

    // Extract unique years from catch_date or created_at
    const uniqueYears = [...new Set(catches.map(c => {
        const date = c.catch_date ? new Date(c.catch_date) : new Date(c.created_at);
        return date.getFullYear();
    }))].sort((a, b) => b - a); // Newest years first

    const months = [
        { value: 0, label: 'Januari' },
        { value: 1, label: 'Februari' },
        { value: 2, label: 'Mars' },
        { value: 3, label: 'April' },
        { value: 4, label: 'Maj' },
        { value: 5, label: 'Juni' },
        { value: 6, label: 'Juli' },
        { value: 7, label: 'Augusti' },
        { value: 8, label: 'September' },
        { value: 9, label: 'Oktober' },
        { value: 10, label: 'November' },
        { value: 11, label: 'December' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [key, direction] = value.split('-');
        onSortChange({ key, direction });
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: '1px solid var(--color-border)'
        }}>
            {/* Row 1: Filters */}
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Filtrera:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {/* Species Filter */}
                <select
                    name="species"
                    value={filterCriteria.species}
                    onChange={handleChange}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
                >
                    <option value="" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>🐟 Alla arter</option>
                    {uniqueSpecies.map(s => <option key={s} value={s} style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>{s}</option>)}
                </select>

                <select
                    name="method"
                    value={filterCriteria.method}
                    onChange={handleChange}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
                >
                    <option value="" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>🎣 Alla metoder</option>
                    {uniqueMethods.map(m => <option key={m} value={m} style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>{m}</option>)}
                </select>

                {/* Bait Filter */}
                <select
                    name="bait"
                    value={filterCriteria.bait}
                    onChange={handleChange}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
                >
                    <option value="" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>🪱 Alla beten</option>
                    {uniqueBaits.map(b => <option key={b} value={b} style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>{b}</option>)}
                </select>

                {/* Year Filter */}
                <select
                    name="year"
                    value={filterCriteria.year}
                    onChange={handleChange}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
                >
                    <option value="" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>📅 Alla år</option>
                    {uniqueYears.map(y => <option key={y} value={y} style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>{y}</option>)}
                </select>

                {/* Month Filter */}
                <select
                    name="month"
                    value={filterCriteria.month}
                    onChange={handleChange}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
                >
                    <option value="" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>🗓️ Alla månader</option>
                    {months.map(m => <option key={m.value} value={m.value} style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>{m.label}</option>)}
                </select>
            </div>

            {/* Row 2: Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Sortera efter:</label>
                <select
                    value={`${sortConfig.key}-${sortConfig.direction}`}
                    onChange={handleSortChange}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
                >
                    <option value="date-desc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Nyast först</option>
                    <option value="date-asc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Äldst först</option>
                    <option value="weight-desc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Tyngst först</option>
                    <option value="weight-asc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Lättast först</option>
                    <option value="length-desc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Längst först</option>
                    <option value="length-asc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Kortast först</option>
                    <option value="species-asc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Art (A-Ö)</option>
                    <option value="species-desc" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}>Art (Ö-A)</option>
                </select>
            </div>
        </div>
    );
}
