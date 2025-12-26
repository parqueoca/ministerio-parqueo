
import { createClient } from '@supabase/supabase-js';

/**
 * Acceso seguro a las variables de entorno de Vite/Vercel.
 * Se utiliza una verificación para evitar el error "Cannot read properties of undefined"
 * si 'import.meta.env' no está presente en el entorno de ejecución actual.
 */
const env = (import.meta as any).env || {};

const SUPABASE_URL: string = env.VITE_SUPABASE_URL || 'https://medypyixvyksbfxedkga.supabase.co'; 
const SUPABASE_ANON_KEY: string = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZHlweWl4dnlrc2JmeGVka2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDY1NjgsImV4cCI6MjA4MTQ4MjU2OH0._9mUSSlGLWSYVCIPcW7dpxyxHpMtexf1TEyPrrpYcL0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'x-client-info': 'agenda-servidores-app'
    }
  }
});

export const isSupabaseConfigured = () => {
  return (
    typeof SUPABASE_URL === 'string' && 
    SUPABASE_URL.includes('supabase.co') && 
    typeof SUPABASE_ANON_KEY === 'string' && 
    SUPABASE_ANON_KEY.length > 10
  );
};
