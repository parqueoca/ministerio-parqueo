import { supabase, isSupabaseConfigured } from './supabaseClient';

const BUCKET_NAME = 'Foto_Servidores';

export const uploadImageToStorage = async (imageBlob: Blob): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, cannot upload image.");
    return null;
  }

  try {
    // 1. Generar nombre único
    const fileName = `server_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    // 2. Subir al bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (error) {
      console.error("Error uploading to storage:", error);
      throw error;
    }

    // 3. Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("Storage upload failed", error);
    return null;
  }
};