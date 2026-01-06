
import React, { useState } from 'react';
import { ServiceName } from '../types';
import { Trash2, Plus, ChevronLeft, Type, Edit, Check, X, Loader2 } from 'lucide-react';
import { toTitleCase } from '../utils/formatters';

interface ServiceNameManagerProps {
  names: ServiceName[];
  onAdd: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ServiceNameManager: React.FC<ServiceNameManagerProps> = ({ names, onAdd, onUpdate, onDelete, onClose }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAdd(name.trim());
      setName('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item: ServiceName) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdate(id, editName.trim());
      setEditingId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-slide-up pb-20 transition-colors duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Nombres de Servicio</h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleAdd} className="mb-8 space-y-4 bg-indigo-50/30 dark:bg-indigo-950/20 p-5 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5 ml-1 tracking-widest">
              <Type size={12} /> Nombre Sugerido
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(toTitleCase(e.target.value))}
              placeholder="Ej: Domingo de Gloria, Vigilia..."
              className="w-full p-4 bg-white dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            <span>Agregar Sugerencia</span>
          </button>
        </form>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Configurados actualmente</label>
          
          {names.length === 0 && (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Type size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700 opacity-50" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay nombres guardados</p>
            </div>
          )}
          
          {names.map(item => (
            <div key={item.id} className="card-chrome flex justify-between items-center p-4 rounded-3xl animate-fade-in hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
              {editingId === item.id ? (
                <div className="flex-1 mr-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(toTitleCase(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 rounded-xl text-sm font-black dark:text-white outline-none"
                  />
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight truncate">{item.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {editingId === item.id ? (
                  <>
                    <button onClick={() => handleUpdate(item.id)} disabled={isUpdating} className="p-3 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-2xl transition-colors">
                      {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    </button>
                    <button onClick={cancelEdit} className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(item)} className="p-3 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-2xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceNameManager;
 
