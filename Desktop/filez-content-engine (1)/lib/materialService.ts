import { supabase } from './supabaseClient';
import { MaterialItem } from '../types';

export const materialService = {
    async getMaterials(type?: 'image' | 'document' | 'link'): Promise<MaterialItem[]> {
        let query = supabase.from('materials').select('*').order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching materials:', error);
            throw error;
        }
        return data as MaterialItem[];
    },

    async uploadFile(file: File, type: 'image' | 'document'): Promise<MaterialItem | null> {
        try {
            // Create a unique file path
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${type}s/${fileName}`; // Organize by type folders e.g. images/..., documents/...

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('materials')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('materials')
                .getPublicUrl(filePath);

            // Insert into Database
            const { data, error: dbError } = await supabase
                .from('materials')
                .insert({
                    type,
                    name: file.name,
                    url: publicUrl,
                    meta: {
                        size: file.size,
                        mimeType: file.type,
                        path: filePath
                    }
                })
                .select()
                .single();

            if (dbError) throw dbError;
            return data as MaterialItem;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    async addLink(name: string, url: string): Promise<MaterialItem | null> {
        try {
            const { data, error } = await supabase
                .from('materials')
                .insert({
                    type: 'link',
                    name,
                    url,
                    meta: {}
                })
                .select()
                .single();

            if (error) throw error;
            return data as MaterialItem;
        } catch (error) {
            console.error('Error adding link:', error);
            throw error;
        }
    },

    async deleteMaterial(id: string, type: string, meta?: any): Promise<void> {
        try {
            // Delete from Database
            const { error: dbError } = await supabase
                .from('materials')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // If it's a file, delete from Storage
            if (type !== 'link' && meta?.path) {
                const { error: storageError } = await supabase.storage
                    .from('materials')
                    .remove([meta.path]);

                if (storageError) console.error('Error deleting file from storage:', storageError);
            }
        } catch (error) {
            console.error('Error deleting material:', error);
            throw error;
        }
    }
};
