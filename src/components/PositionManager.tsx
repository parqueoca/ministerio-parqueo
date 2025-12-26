
import React, { useState } from 'react';
import { ParkingPosition } from '../types';
import { Trash2, Plus, ChevronLeft, MapPin, AlertCircle } from 'lucide-react';
import { toTitleCase } from '../utils/formatters';

interface PositionManagerProps {
  positions: ParkingPosition[];
  onAdd: (code: string, name: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const PositionManager: React.FC<PositionManagerProps> = ({ positions, onAdd, onDelete, onClose }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const isDuplicateCode = positions.some(p => p.code.toLowerCase().trim() === code.toLowerCase().trim());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || isDuplicateCode) return;
    onAdd(code.trim(), name.trim());
    setCode('');
    setName('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-slide-in-up pb-20 transition-colors duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestionar Posiciones</h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleAdd} className="mb-6 space-y-3 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Cód.</label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="1"
                    className={`w-full p-3 bg-white dark:bg-slate-800 border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition-colors ${isDuplicateCode ? 'border-red-500 ring-1 ring-red-500' : 'border-transparent'}`}
                />
            </div>
            <div className="col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Nombre Posición</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(toTitleCase(e.target.value))}
                    placeholder="Ej: Área Pastoral"
                    className="w-full p-3 bg-white dark:bg-slate-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                />
            </div>
          </div>
          
          {isDuplicateCode && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold animate-pulse">
                <AlertCircle size={12} />
                ESTE CÓDIGO YA EXISTE. ELIGE OTRO.
            </div>
          )}

          <button 
            type="submit"
            disabled={!code.trim() || !name.trim() || isDuplicateCode}
            className="w-full bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 font-bold shadow-md shadow-blue-100 dark:shadow-none active:scale-[0.98] transition-all"
          >
            <Plus size={20} /> Guardar Posición
          </button>
        </form>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2">Listado de Áreas</label>
          {positions.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-slate-600">
                <MapPin size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay posiciones creadas.</p>
            </div>
          )}
          
          {positions.map(pos => (
            <div key={pos.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm animate-fade-in-up transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg font-bold text-xs">{pos.code}</span>
                <span className="font-medium text-gray-800 dark:text-slate-200">{pos.name}</span>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(pos.id);
                }}
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

export default PositionManager;
