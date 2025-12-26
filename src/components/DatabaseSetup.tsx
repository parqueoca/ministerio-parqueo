
import React from 'react';
import { Copy, ExternalLink, RefreshCw, X, AlertCircle, Zap, ShieldOff } from 'lucide-react';

const NUCLEAR_SQL = `-- OPCIÓN NUCLEAR: DESACTIVAR SEGURIDAD Y PERMITIR TODO
-- Ejecuta esto si no puedes borrar nada en la aplicación.

DO $$ 
DECLARE
    r record;
BEGIN
    -- 1. Desactivar RLS (Seguridad) en TODAS las tablas
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;

    -- 2. Otorgar permisos totales
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, postgres', r.tablename);
    END LOOP;

    -- 3. Permisos a secuencias
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;

    -- 4. Reparar Cascade (Borrado automático de hijos)
    ALTER TABLE IF EXISTS public.asignaciones_servicio DROP CONSTRAINT IF EXISTS asignaciones_servicio_serverId_fkey;
    ALTER TABLE IF EXISTS public.asignaciones_servicio ADD CONSTRAINT asignaciones_servicio_serverId_fkey FOREIGN KEY ("serverId") REFERENCES servidores(id) ON DELETE CASCADE;
    
    ALTER TABLE IF EXISTS public.asistencias_puntaje DROP CONSTRAINT IF EXISTS asistencias_puntaje_servidor_id_fkey;
    ALTER TABLE IF EXISTS public.asistencias_puntaje ADD CONSTRAINT asistencias_puntaje_servidor_id_fkey FOREIGN KEY (servidor_id) REFERENCES servidores(id) ON DELETE CASCADE;

    ALTER TABLE IF EXISTS public.asignaciones_servicio DROP CONSTRAINT IF EXISTS asignaciones_servicio_serviceId_fkey;
    ALTER TABLE IF EXISTS public.asignaciones_servicio ADD CONSTRAINT asignaciones_servicio_serviceId_fkey FOREIGN KEY ("serviceId") REFERENCES servicios(id) ON DELETE CASCADE;
END $$;

NOTIFY pgrst, 'reload schema';`;

const DatabaseSetup: React.FC<{onClose?: () => void}> = ({ onClose }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(NUCLEAR_SQL);
    alert('Código NUCLEAR copiado. Pégalo en Supabase y dale a RUN.');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-rose-200 dark:border-rose-900/30">
        <div className="bg-rose-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <ShieldOff size={28} className="fill-current" />
            </div>
            <div>
                <h1 className="text-lg font-black uppercase tracking-tight">Opción Nuclear SQL</h1>
                <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest">Desactivar Seguridad RLS</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex gap-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border-l-4 border-rose-500">
            <AlertCircle className="text-rose-600 shrink-0" size={24} />
            <div className="space-y-1">
              <p className="text-[11px] font-black text-rose-800 dark:text-rose-200 uppercase">¿Qué hace este código?</p>
              <p className="text-[10px] font-bold text-rose-700/80 dark:text-rose-300/80 leading-relaxed uppercase">
                Este es el último recurso. Deshabilita la seguridad interna de Supabase para que la aplicación pueda borrar libremente sin pedir permisos. **Si esto no lo arregla, es un problema de conexión o credenciales.**
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-rose-400 rounded-2xl font-black uppercase text-xs hover:bg-black transition-all shadow-xl"
            >
                <Zap size={18} /> Copiar Código Nuclear
            </button>
          </div>

          <div className="pt-4 space-y-3">
            <a 
              href="https://supabase.com/dashboard/project/_/sql/new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg active:scale-95"
            >
              <span>Ir al SQL Editor</span>
              <ExternalLink size={18} />
            </a>

            <button 
               onClick={() => window.location.reload()}
               className="w-full inline-flex items-center justify-center gap-2 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
             >
               <RefreshCw size={14} /> Refrescar Aplicación
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
