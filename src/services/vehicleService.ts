import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Vehicle, VehicleCategory } from '../types';

const handleError = (error: any, context: string) => {
  const message = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  
  const isMissingTable = 
    error.code === '42P01' || 
    message.includes('Could not find the table') || 
    message.includes('does not exist') || 
    message.includes('schema cache');

  if (!isMissingTable) {
    console.error(`Error en ${context}:`, message);
  }
  
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
    // Nota: Si en tu base de datos la tabla se llama 'vehicles', cambia 'vehiculos' por 'vehicles' abajo
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
  // Preparamos los datos para enviar
  const { vehiculo_categorias, ...dataToSave } = vehicle as any;
  
  // Limpieza de campos UUID opcionales
  if (!dataToSave.categoria_id || dataToSave.categoria_id === "") {
    delete dataToSave.categoria_id;
  }

  try {
    const { data, error } = await supabase
      .from('vehiculos')
      .upsert([dataToSave], { onConflict: 'id' })
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
