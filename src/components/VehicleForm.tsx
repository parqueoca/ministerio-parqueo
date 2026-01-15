
import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleCategory } from '../types';
import { ChevronLeft, Save, Car, User, Phone, Tag, Calendar, Palette, FileText, Filter } from 'lucide-react';
import { toTitleCase } from '../utils/formatters';

interface VehicleFormProps {
  initialData?: Vehicle | null;
  categories: VehicleCategory[];
  onSave: (v: Partial<Vehicle>) => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    placa: '',
    propietario: '',
    celular: '',
    marca: '',
    modelo: '',
    anio: undefined,
    color: '',
    categoria_id: '',
    note: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        categoria_id: initialData.categoria_id || '',
        anio: initialData.anio || undefined,
        note: initialData.note || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof Vehicle, value: any) => {
    let finalValue = value;
    
    if (field === 'placa' && typeof value === 'string') {
      finalValue = value.toUpperCase();
    } else if (typeof value === 'string' && ['propietario', 'marca', 'modelo', 'color', 'note'].includes(field as string)) {
      finalValue = toTitleCase(value);
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.categoria_id === '') {
      dataToSave.categoria_id = undefined;
    }
    onSave(dataToSave);
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-slide-up pb-20 overflow-hidden transition-colors duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">PLACA (OBLIGATORIO)</label>
            <input 
              required
              type="text" 
              value={formData.placa || ''}
              onChange={e => handleInputChange('placa', e.target.value)}
              placeholder="A000000"
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-lg font-black tracking-widest border-2 border-transparent focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">PROPIETARIO</label>
            <input 
              required
              type="text" 
              value={formData.propietario || ''}
              onChange={e => handleInputChange('propietario', e.target.value)}
              placeholder="Nombre completo"
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">CELULAR</label>
              <input 
                type="tel" 
                value={formData.celular || ''}
                onChange={e => handleInputChange('celular', e.target.value)}
                placeholder="809-000-0000"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">CATEGORÍA</label>
              <select 
                value={formData.categoria_id || ''}
                onChange={e => handleInputChange('categoria_id', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="">Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">MARCA</label>
              <input 
                type="text" 
                value={formData.marca || ''}
                onChange={e => handleInputChange('marca', e.target.value)}
                placeholder="Toyota"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">MODELO</label>
              <input 
                type="text" 
                value={formData.modelo || ''}
                onChange={e => handleInputChange('modelo', e.target.value)}
                placeholder="Hilux"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">AÑO</label>
              <input 
                type="number" 
                value={formData.anio || ''}
                onChange={e => handleInputChange('anio', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="2024"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">COLOR</label>
              <input 
                type="text" 
                value={formData.color || ''}
                onChange={e => handleInputChange('color', e.target.value)}
                placeholder="Blanco"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">NOTA ADICIONAL</label>
            <textarea 
              rows={3}
              value={formData.note || ''}
              onChange={e => handleInputChange('note', e.target.value)}
              placeholder="Observaciones..."
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Save size={20} />
          <span>Guardar Vehículo</span>
        </button>
      </form>
    </div>
  );
};

export default VehicleForm;
