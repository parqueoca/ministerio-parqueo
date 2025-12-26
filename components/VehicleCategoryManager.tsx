
import React, { useState } from 'react';
import { VehicleCategory } from '../types';
import { Trash2, Plus, ChevronLeft, Tag, FileText } from 'lucide-react';
import { toTitleCase } from '../utils/formatters';

interface VehicleCategoryManagerProps {
  categories: VehicleCategory[];
  onAdd: (name: string, description?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

const VehicleCategoryManager: React.FC<VehicleCategoryManagerProps> = ({ categories, onAdd, onDelete, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    await onAdd(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-slide-in-up pb-20 transition-colors duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Categorías de Vehículos</h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleAdd} className="mb-6 space-y-3 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase flex items-center gap-1">
              <Tag size={12} /> Nombre de Categoría
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(toTitleCase(e.target.value))}
              placeholder="Ej: Staff, Visita, VIP..."
              className="w-full p-3 bg-white dark:bg-slate-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase flex items-center gap-1">
              <FileText size={12} /> Descripción (Opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(toTitleCase(e.target.value))}
              placeholder="Breve descripción..."
              className="w-full p-3 bg-white dark:bg-slate-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 font-bold shadow-md active:scale-[0.98] transition-all"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
            <span>Agregar Categoría</span>
          </button>
        </form>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2">Categorías Existentes</label>
          {categories.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-slate-600">
                <Tag size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm italic">No hay categorías configuradas.</p>
            </div>
          )}
          
          {categories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm animate-fade-in-up">
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 dark:text-slate-200">{cat.nombre}</span>
                {cat.descripcion && <span className="text-[10px] text-gray-500 dark:text-slate-500">{cat.descripcion}</span>}
              </div>
              <button 
                type="button"
                onClick={() => onDelete(cat.id)}
                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleCategoryManager;
