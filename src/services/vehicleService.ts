
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Vehicle, VehicleCategory } from '../types';

const handleError = (error: any, context: string) => {
  const message = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  
  // Detectar si el error es porque la tabla no existe
  const isMissingTable = 
    error.code === '42P01' || 
    message.includes('Could not find the table') || 
    message.includes('does not exist') || 
    message.includes('schema cache');

  if (!isMissingTable) {
    console.error(`Error en ${context}:`, message);
  }
  
  // Lanzamos el error con un mensaje descriptivo para que App.tsx lo capture
  throw new Error(message);
};

// --- CATEGORÍAS ---
export const getCategories = async (): Promise<VehicleCategory[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('vehiculo_categorias')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError(error, 'fetching categories');
  }
};

export const addCategory = async (cat: Partial<VehicleCategory>): Promise<VehicleCategory> => {
  try {
    const { data, error } = await supabase
      .from('vehiculo_categorias')
      .insert([cat])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error, 'adding category');
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('vehiculo_categorias').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleError(error, 'deleting category');
  }
};

// --- VEHÍCULOS ---
export const getVehicles = async (): Promise<Vehicle[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*, vehiculo_categorias!categoria_id(nombre)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError(error, 'fetching vehicles');
  }
};

export const saveVehicle = async (vehicle: Partial<Vehicle>): Promise<Vehicle> => {
  // Limpiar campos UUID: PostgreSQL no acepta strings vacíos para columnas UUID
  const payload = { ...vehicle };
  
  // Si categoria_id es un string vacío, lo convertimos a null para que sea válido para la DB
  if (payload.categoria_id === '') {
    payload.categoria_id = undefined; // O null
  }
  
  // Eliminar el objeto de join si existe para evitar errores en el upsert
  delete (payload as any).vehiculo_categorias;

  try {
    const { data, error } = await supabase
      .from('vehiculos')
      .upsert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error, 'saving vehicle');
  }
};

export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleError(error, 'deleting vehicle');
  }
};
