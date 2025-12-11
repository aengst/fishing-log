import { supabase } from '../supabaseClient';

export const catchesApi = {
    fetchAll: async () => {
        const { data, error } = await supabase
            .from('catches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('catches')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    uploadImage: async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('catch-images')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('catch-images')
            .getPublicUrl(fileName);

        return publicUrl;
    },

    add: async (catchData) => {
        const { error } = await supabase
            .from('catches')
            .insert([catchData]);
        if (error) throw error;
    },

    update: async (id, catchData) => {
        const { error } = await supabase
            .from('catches')
            .update(catchData)
            .eq('id', id);
        if (error) throw error;
    }
};
