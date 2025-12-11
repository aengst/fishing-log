export const formatters = {
    getWindDirectionCardinal: (degrees) => {
        if (!degrees && degrees !== 0) return '';
        const directions = ['N', 'NO', 'O', 'SO', 'S', 'SV', 'V', 'NV'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    },

    getWeatherDescription: (code) => {
        const weatherMap = {
            0: 'Klart', 1: 'Mestadels klart', 2: 'Halvklart', 3: 'Mulet',
            45: 'Dimma', 48: 'Rimfrost', 51: 'Lätt duggregn', 53: 'Duggregn',
            55: 'Kraftigt duggregn', 61: 'Lätt regn', 63: 'Regn', 65: 'Kraftigt regn',
            80: 'Regnskurar', 81: 'Kraftiga regnskurar', 95: 'Åska'
        };
        return weatherMap[code] || `Kod ${code}`;
    },

    snapToCardinal: (deg) => {
        if (deg === null || deg === undefined) return null;
        const val = Math.round(deg / 45) * 45;
        return val === 360 ? 0 : val;
    }
};
