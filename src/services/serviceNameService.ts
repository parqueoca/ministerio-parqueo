
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ServiceName } from '../types';

const handleError = (error: any, context: string) => {
  const message = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  console.error(`Error en ${context}:`, message);
  throw new Error(message);
};

export const getServiceNames = async (): Promise<ServiceName[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('service_names')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError(error, 'fetching service names');
  }
};

export const createServiceName = async (name: string): Promise<ServiceName> => {
  try {
    const { data, error } = await supabase
      .from('service_names')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error, 'creating service name');
  }
};

export const updateServiceName = async (id: string, name: string): Promise<ServiceName> => {
  try {
    const { data, error } = await supabase
      .from('service_names')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error, 'updating service name');
  }
};

export const deleteServiceName = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_names')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    handleError(error, 'deleting service name');
  }
};
