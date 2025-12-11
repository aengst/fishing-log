export const weatherApi = {
    fetchHistoricalWeather: async (lat, lng, dateString) => {
        const date = new Date(dateString);
        const yyyyMmDd = date.toISOString().slice(0, 10);

        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${yyyyMmDd}&end_date=${yyyyMmDd}&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m&windspeed_unit=ms`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data.hourly) {
            throw new Error("Ingen väderdata hittades");
        }

        const hourIndex = date.getHours();

        return {
            temp: data.hourly.temperature_2m[hourIndex],
            wind: data.hourly.windspeed_10m[hourIndex],
            dir: data.hourly.winddirection_10m[hourIndex],
            code: data.hourly.weathercode[hourIndex]
        };
    }
};
