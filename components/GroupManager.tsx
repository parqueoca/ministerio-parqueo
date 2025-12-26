
import React, { useState } from 'react';
import { Group } from '../types';
import { Trash2, Plus, ChevronLeft } from 'lucide-react';
import { toTitleCase } from '../utils/formatters';

interface GroupManagerProps {
  groups: Group[];
  onAddGroup: (name: string) => Promise<void>;
  onDeleteGroup: (id: string) => void;
  onClose: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ groups, onAddGroup, onDeleteGroup, onClose }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddGroup(newGroupName.trim());
      setNewGroupName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-fade-in pb-20">
      <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-20">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Grupos</h2>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleAdd} className="mb-8">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nuevo Grupo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(toTitleCase(e.target.value))}
              placeholder="Nombre del grupo..."
              className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              type="submit"
              disabled={isSubmitting || !newGroupName.trim()}
              className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center min-w-[60px]"
            >
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={24} />}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3 ml-1">Listado de Grupos</label>
          {groups.length === 0 && <p className="text-slate-400 italic text-sm text-center py-10">No hay grupos configurados.</p>}
          
          {groups.map(group => (
            <div 
              key={group.id} 
              className="card-chrome flex justify-between items-center p-4 rounded-2xl group hover:border-blue-200 transition-all"
            >
              <span className="font-bold text-slate-700 dark:text-slate-200">{group.name}</span>
              <button 
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteGroup(group.id);
                }}
                className="btn-delete-active relative z-50 p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl active:scale-90 transition-transform"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupManager;
