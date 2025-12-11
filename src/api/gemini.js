import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiApi = {
    identifySpecies: async (file) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("Ingen API-nyckel för Gemini hittades.");
            return null;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const fileToGenerativePart = async (file) => {
            const base64EncodedDataPromise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(file);
            });
            return {
                inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
            };
        };

        const imagePart = await fileToGenerativePart(file);
        const prompt = "Identifiera fiskarten på bilden. Svara ENDAST med artnamnet på svenska (t.ex. 'Gädda', 'Abborre'). Om det inte är en fisk, svara 'Okänd'.";

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text().trim();

        if (text && text.toLowerCase() !== 'okänd') {
            return text.replace(/\.$/, '');
        }
        return null;
    }
};
