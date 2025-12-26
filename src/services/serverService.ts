
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Server, Group, ServerStatus } from '../types';

const LS_KEYS = {
  SERVERS: 'agenda_servers_data',
  GROUPS: 'agenda_groups_data'
};

const getLocal = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const setLocal = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const handleError = (error: any, context: string) => {
    const message = error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    const code = error?.code || 'N/A';
    
    console.error(`ERROR EN ${context}:`, error);
    
    if (code === '42501') {
        alert(`🚨 ERROR DE PERMISOS (RLS):\nLa base de datos prohíbe borrar desde la app.\n\nSolución: Ve a Supabase > SQL Editor y ejecuta el script de "Desactivar RLS" o "Grant Delete".`);
    } else {
        alert(`Error en ${context}:\n${message}\n(Código: ${code})`);
    }
    throw error;
};

export const getServers = async (): Promise<Server[]> => {
  if (!isSupabaseConfigured()) return getLocal<Server>(LS_KEYS.SERVERS);

  const { data, error } = await supabase
    .from('servidores')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) handleError(error, 'fetching servers');

  return (data || []).map((s: any) => ({
    ...s,
    status: s.status as ServerStatus
  }));
};

export const addServer = async (serverData: Omit<Server, 'id' | 'createdAt'>): Promise<Server> => {
  const newServer = {
    ...serverData,
    createdAt: Date.now()
  };

  if (!isSupabaseConfigured()) {
    const localServer = { ...newServer, id: generateId() } as Server;
    const servers = getLocal<Server>(LS_KEYS.SERVERS);
    setLocal(LS_KEYS.SERVERS, [localServer, ...servers]);
    return localServer;
  }

  const { data, error } = await supabase
    .from('servidores')
    .insert([newServer])
    .select()
    .single();

  if (error) handleError(error, 'adding server');
  return data;
};

export const updateServer = async (id: string, updates: Partial<Server>): Promise<Server> => {
  if (!id) throw new Error("ID is required for update");

  if (!isSupabaseConfigured()) {
    const servers = getLocal<Server>(LS_KEYS.SERVERS);
    const index = servers.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Server not found locally");
    const updated = { ...servers[index], ...updates };
    servers[index] = updated;
    setLocal(LS_KEYS.SERVERS, servers);
    return updated;
  }

  const { data, error } = await supabase
    .from('servidores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleError(error, 'updating server');
  return data;
};

export const deleteServer = async (id: string): Promise<void> => {
  if (!id) return;
  
  if (!isSupabaseConfigured()) {
    const servers = getLocal<Server>(LS_KEYS.SERVERS);
    setLocal(LS_KEYS.SERVERS, servers.filter(s => s.id !== id));
    return;
  }

  try {
    // 1. Limpieza manual de hijos primero para asegurar éxito
    await supabase.from('asignaciones_servicio').delete().eq('serverId', id);
    await supabase.from('asistencias_puntaje').delete().eq('servidor_id', id);
    
    // 2. Borrar padre
    const { error } = await supabase.from('servidores').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    handleError(err, 'borrar servidor');
  }
};

export const getGroups = async (): Promise<Group[]> => {
  if (!isSupabaseConfigured()) return getLocal<Group>(LS_KEYS.GROUPS);
  const { data, error } = await supabase.from('grupos').select('*').order('name', { ascending: true });
  if (error) handleError(error, 'fetching groups');
  return data || [];
};

export const addGroup = async (name: string): Promise<Group> => {
  if (!isSupabaseConfigured()) {
    const newGroup = { id: generateId(), name };
    const groups = getLocal<Group>(LS_KEYS.GROUPS);
    setLocal(LS_KEYS.GROUPS, [...groups, newGroup]);
    return newGroup;
  }
  const { data, error } = await supabase.from('grupos').insert([{ name }]).select().single();
  if (error) handleError(error, 'adding group');
  return data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  if (!id) return;
  
  if (!isSupabaseConfigured()) {
    const groups = getLocal<Group>(LS_KEYS.GROUPS);
    setLocal(LS_KEYS.GROUPS, groups.filter(g => g.id !== id));
    return;
  }

  const { error } = await supabase.from('grupos').delete().eq('id', id);
  if (error) handleError(error, 'borrar grupo');
};
