
import { Service, ServiceType, ServiceAssignment, ParkingPosition } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LS_KEYS = {
  SERVICES: 'agenda_services_calendar',
  SERVICE_TYPES: 'agenda_service_types',
  POSITIONS: 'agenda_parking_positions'
};

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const handleSupabaseError = (error: any, context: string) => {
  const message = error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  const code = error?.code || 'N/A';
  
  console.error(`Error en ${context}:`, error);
  
  if (code === '42501') {
      alert(`🚨 ERROR DE PERMISOS (RLS):\nLa app no tiene permiso para borrar en "${context}".\n\nDebes ejecutar el script SQL de "GRANT ALL" en Supabase.`);
  } else {
      alert(`Error en ${context}:\n${message}`);
  }
  throw error;
};

const DEFAULT_TYPES: ServiceType[] = [
  { id: 'sun-pm', name: 'Domingo de Gloria', defaultTime: '15:40', dayOfWeek: 0 },
  { id: 'wed-pm', name: 'Miércoles de Gloria', defaultTime: '18:40', dayOfWeek: 3 },
  { id: 'sun-am', name: 'Domingo de Gloria', defaultTime: '08:00', dayOfWeek: 0 },
];

export const getServiceTypes = (): ServiceType[] => {
  const saved = localStorage.getItem(LS_KEYS.SERVICE_TYPES);
  return saved ? JSON.parse(saved) : DEFAULT_TYPES;
};

export const getServices = async (): Promise<Service[]> => {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : [];
  }

  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      assignments:asignaciones_servicio!asignaciones_servicio_serviceId_fkey (
        serverId,
        positionId,
        servidores!asignaciones_servicio_serverId_fkey (
          firstName,
          lastName,
          photo
        )
      )
    `)
    .order('date', { ascending: false });

  if (error) handleSupabaseError(error, 'obtener servicios');

  return (data || []).map((s: any) => ({
    ...s,
    assignments: s.assignments || []
  }));
};

export const saveService = async (service: Service): Promise<void> => {
  if (!isSupabaseConfigured()) {
    const services = JSON.parse(localStorage.getItem(LS_KEYS.SERVICES) || '[]');
    const index = services.findIndex((s: any) => s.id === service.id);
    if (index >= 0) services[index] = service;
    else services.push(service);
    localStorage.setItem(LS_KEYS.SERVICES, JSON.stringify(services));
    return;
  }

  const validId = service.id.includes('-') ? service.id : generateId();

  const serviceData = {
    id: validId,
    name: service.name,
    date: service.date,
    arrivalTime: service.arrivalTime,
    groupId: service.groupId,
    isExtra: service.isExtra,
    note: service.note,
    createdAt: service.createdAt
  };

  const { error: serviceError } = await supabase
    .from('servicios')
    .upsert(serviceData);

  if (serviceError) handleSupabaseError(serviceError, 'guardar servicio');

  await supabase.from('asignaciones_servicio').delete().eq('serviceId', validId);

  if (service.assignments.length > 0) {
    const assignmentsToInsert = service.assignments.map(a => ({
      serviceId: validId,
      serverId: a.serverId,
      positionId: a.positionId || null
    }));
    const { error: insertError } = await supabase.from('asignaciones_servicio').insert(assignmentsToInsert);
    if (insertError) handleSupabaseError(insertError, 'insertar asignaciones');
  }
};

export const deleteService = async (id: string): Promise<void> => {
  if (!id) return;
  
  if (!isSupabaseConfigured()) {
    const services = JSON.parse(localStorage.getItem(LS_KEYS.SERVICES) || '[]').filter((s: any) => s.id !== id);
    localStorage.setItem(LS_KEYS.SERVICES, JSON.stringify(services));
    return;
  }

  try {
    await supabase.from('asignaciones_servicio').delete().eq('serviceId', id);
    await supabase.from('asistencias_puntaje').delete().eq('servicio_id', id);
    const { error } = await supabase.from('servicios').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'eliminar servicio');
  }
};

export const getPositions = async (): Promise<ParkingPosition[]> => {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_KEYS.POSITIONS);
    return (saved ? JSON.parse(saved) : []).sort((a: any, b: any) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }
  const { data, error } = await supabase.from('posiciones').select('*');
  if (error) handleSupabaseError(error, 'obtener posiciones');
  return (data || []).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
};

export const addPosition = async (code: string, name: string): Promise<ParkingPosition> => {
  const newPosData = { code, name };
  if (!isSupabaseConfigured()) {
    const positions = JSON.parse(localStorage.getItem(LS_KEYS.POSITIONS) || '[]');
    const newPos = { id: generateId(), ...newPosData };
    localStorage.setItem(LS_KEYS.POSITIONS, JSON.stringify([...positions, newPos]));
    return newPos;
  }
  const { data, error } = await supabase.from('posiciones').insert([newPosData]).select().single();
  if (error) handleSupabaseError(error, 'agregar posición');
  return data;
};

export const deletePosition = async (id: string): Promise<void> => {
  if (!id) return;
  if (!isSupabaseConfigured()) {
    const positions = JSON.parse(localStorage.getItem(LS_KEYS.POSITIONS) || '[]');
    localStorage.setItem(LS_KEYS.POSITIONS, JSON.stringify(positions.filter((p: any) => p.id !== id)));
    return;
  }
  const { error } = await supabase.from('posiciones').delete().eq('id', id);
  if (error) handleSupabaseError(error, 'eliminar posición');
};

export const calculateRotationGroup = (date: Date, groups: string[]): string => {
  if (groups.length === 0) return 'Sin Grupo';
  const referenceDate = new Date('2024-01-07T15:40:00');
  const diffTime = Math.abs(date.getTime() - referenceDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const day = date.getDay();
  const hour = date.getHours();
  let serviceIndex = 0; 
  if (day === 0) serviceIndex = hour >= 12 ? 0 : 2;
  else if (day === 3) serviceIndex = 1;
  else return 'Fuera de Ciclo';
  const weeksPassed = Math.floor(diffDays / 7);
  const totalServices = (weeksPassed * 3) + serviceIndex;
  const rotationIndex = Math.floor(totalServices / 3) % groups.length;
  return groups[rotationIndex];
};
