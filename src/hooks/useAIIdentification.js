import { useState } from 'react';
import { geminiApi } from '../api/gemini';

export function useAIIdentification() {
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [error, setError] = useState(null);

    const identify = async (file) => {
        setIsIdentifying(true);
        setError(null);
        try {
            const species = await geminiApi.identifySpecies(file);
            return species;
        } catch (err) {
            console.error("AI-igenkänning misslyckades:", err);
            setError(err.message);
            return null;
        } finally {
            setIsIdentifying(false);
        }
    };

    return { identify, isIdentifying, error };
}
