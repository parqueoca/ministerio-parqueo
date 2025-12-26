
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PeriodoPuntaje, AsistenciaPuntaje, RankingEntry } from '../types';

export const getPeriodos = async (): Promise<PeriodoPuntaje[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('periodos_puntaje')
    .select('*')
    .order('fecha_inicio', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addPeriodo = async (periodo: Omit<PeriodoPuntaje, 'id'>): Promise<PeriodoPuntaje> => {
  if (!isSupabaseConfigured()) throw new Error("Supabase no configurado");
  const { data, error } = await supabase
    .from('periodos_puntaje')
    .insert([periodo])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePeriodo = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('periodos_puntaje')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const getRanking = async (periodoId: string, grupo?: string): Promise<RankingEntry[]> => {
  if (!isSupabaseConfigured()) return [];
  let query = supabase
    .from('vista_ranking_periodo')
    .select('*')
    .eq('periodo_id', periodoId);
  
  if (grupo && grupo !== 'ALL') {
    query = query.eq('grupo', grupo);
  }

  // APLICACIÓN DE CRITERIOS DE DESEMPATE:
  // 1. Puntaje total desc
  // 2. Total asistencias desc
  // 3. Total puntuales desc
  // 4. Fecha ingreso asc (el más antiguo gana si todo es igual)
  const { data, error } = await query
    .order('puntaje_total', { ascending: false })
    .order('total_asistencias', { ascending: false })
    .order('total_puntuales', { ascending: false })
    .order('fecha_ingreso', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const saveAsistencias = async (asistencias: AsistenciaPuntaje[]): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('asistencias_puntaje')
    .upsert(asistencias, { onConflict: 'servidor_id,servicio_id' });
  if (error) throw error;
};

export const getAsistenciasByService = async (serviceId: string): Promise<AsistenciaPuntaje[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('asistencias_puntaje')
    .select('*')
    .eq('servicio_id', serviceId);
  if (error) throw error;
  return data || [];
};

export const getServidorHistory = async (periodoId: string, servidorId: string) => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('asistencias_puntaje')
    .select(`
      *,
      servicios!asistencias_puntaje_servicio_id_fkey (
        name,
        date
      )
    `)
    .eq('periodo_id', periodoId)
    .eq('servidor_id', servidorId)
    .order('creado_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};
