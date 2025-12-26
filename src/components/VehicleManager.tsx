
import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleCategory } from '../types';
import { Search, Car, Plus, Phone, MessageCircle, Edit, Trash2, Filter, User, FileDown, Loader2 } from 'lucide-react';
import { normalizeString } from '../utils/formatters';
import { generateVehicleReportPDF } from '../services/pdfGenerator';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  categories: VehicleCategory[];
  onAdd: () => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (id: string) => void;
}

const VehicleManager: React.FC<VehicleManagerProps> = ({ vehicles, categories, onAdd, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  const filtered = useMemo(() => {
    let result = vehicles.filter(v => {
      const q = normalizeString(search);
      const matchesSearch = normalizeString(v.placa).includes(q) || 
                            normalizeString(v.propietario).includes(q) ||
                            normalizeString(v.marca || '').includes(q);
      const matchesCat = catFilter === 'ALL' || v.categoria_id === catFilter;
      return matchesSearch && matchesCat;
    });
    return result.sort((a, b) => a.propietario.localeCompare(b.propietario));
  }, [vehicles, search, catFilter]);

  const handleExport = async () => {
    if (filtered.length === 0) return alert("No hay vehículos para exportar.");
    setIsGenerating(true);
    try {
      const catName = catFilter === 'ALL' ? 'Todos los grupos' : categories.find(c => c.id === catFilter)?.nombre || 'Categoría';
      await generateVehicleReportPDF(filtered, catName);
    } catch (error) { console.error(error); }
    finally { setIsGenerating(false); }
  };

  const handleWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-2 px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Vehículos</h2>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">Control de Acceso</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleExport}
            disabled={isGenerating}
            className="p-3 bg-white dark:bg-slate-900 text-slate-500 rounded-2xl border-2 border-slate-300 dark:border-slate-800 active:scale-95 shadow-sm"
          >
            {isGenerating ? <Loader2 size={22} className="animate-spin" /> : <FileDown size={22} />}
          </button>
          <button type="button" onClick={onAdd} className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95">
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por placa o dueño..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4.5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-sm outline-none dark:text-white shadow-sm focus:border-blue-500 transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button 
            type="button"
            onClick={() => setCatFilter('ALL')}
            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${catFilter === 'ALL' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500'}`}
          >
            TODOS
          </button>
          {categories.map(c => (
            <button 
              key={c.id}
              type="button"
              onClick={() => setCatFilter(c.id)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${catFilter === c.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500'}`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="card-surface rounded-[2.5rem] py-16 text-center border-dashed border-2 bg-white/50">
            <Car size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sin vehículos</p>
          </div>
        ) : (
          filtered.map(v => {
            const categoryData = Array.isArray(v.vehiculo_categorias) ? v.vehiculo_categorias[0] : v.vehiculo_categorias;
            return (
              <div key={v.id} className="card-surface rounded-[2rem] p-5 animate-fade-in-up hover:border-blue-500 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-300 dark:border-slate-800 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Car size={28} />
                    </div>
                    <div className="min-w-0 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white tracking-wider uppercase">{v.placa}</span>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-black uppercase tracking-widest">
                          {categoryData?.nombre || 'General'}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mt-1.5 flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" /> {v.propietario}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 relative z-10">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit(v); }} 
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      type="button"
                      style={{ position: 'relative', zIndex: 50 }}
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        onDelete(v.id); 
                      }} 
                      className="p-3.5 -m-1 text-rose-500 hover:bg-rose-50 rounded-xl active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                {v.celular && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleWhatsApp(v.celular!); }}
                    className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} /> Contactar Propietario
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VehicleManager;
