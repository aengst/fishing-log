import exifr from 'exifr';

export const exifUtils = {
    extractData: async (file) => {
        try {
            const output = await exifr.parse(file);
            if (!output) return null;

            const result = {};

            if (Number.isFinite(output.latitude) && Number.isFinite(output.longitude)) {
                result.lat = output.latitude;
                result.lng = output.longitude;
            }

            const date = output.DateTimeOriginal || output.CreateDate;
            if (date) {
                const d = new Date(date);
                if (!isNaN(d.getTime())) {
                    result.date = d;
                }
            }

            return result;
        } catch (err) {
            console.error("Fel vid EXIF-läsning:", err);
            return null;
        }
    }
};
