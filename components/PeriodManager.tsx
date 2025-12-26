
import React, { useState, useEffect } from 'react';
import { PeriodoPuntaje } from '../types';
import { Trash2, Plus, ChevronLeft, Calendar, Loader2, Award, CalendarDays } from 'lucide-react';
import * as rankingService from '../services/rankingService';
import { formatDateDisplay } from '../utils/formatters';

interface PeriodManagerProps {
  onClose: () => void;
}

const PeriodManager: React.FC<PeriodManagerProps> = ({ onClose }) => {
  const [periodos, setPeriodos] = useState<PeriodoPuntaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => { loadPeriodos(); }, []);

  const loadPeriodos = async () => {
    setLoading(true);
    try {
      const data = await rankingService.getPeriodos();
      setPeriodos(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !fechaInicio || !fechaFin) return alert("Completa todos los campos");
    
    setIsSubmitting(true);
    try {
      await rankingService.addPeriodo({
        nombre,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        activo: true
      });
      setNombre('');
      setFechaInicio('');
      setFechaFin('');
      await loadPeriodos();
    } catch (e) { alert("Error al crear el período"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este período?")) return;
    try {
      await rankingService.deletePeriodo(id);
      await loadPeriodos();
    } catch (e) { alert("Error al eliminar"); }
  };

  const DateSegmentSelector = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
    const [y, m, d] = value ? value.split('-') : ['', '', ''];
    const years = [2024, 2025, 2026];
    const months = [
      { v: '01', l: 'Enero' }, { v: '02', l: 'Febrero' }, { v: '03', l: 'Marzo' },
      { v: '04', l: 'Abril' }, { v: '05', l: 'Mayo' }, { v: '06', l: 'Junio' },
      { v: '07', l: 'Julio' }, { v: '08', l: 'Agosto' }, { v: '09', l: 'Septiembre' },
      { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' }
    ];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const update = (type: 'd' | 'm' | 'y', val: string) => {
      const newD = type === 'd' ? val : (d || '01');
      const newM = type === 'm' ? val : (m || '01');
      const newY = type === 'y' ? val : (y || '2025');
      onChange(`${newY}-${newM}-${newD}`);
    };

    return (
      <div className="space-y-2 p-4 inner-session rounded-2xl border-l-4 border-l-blue-500">
        <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <CalendarDays size={12} /> {label}
        </label>
        <div className="flex gap-2">
          <select value={d} onChange={e => update('d', e.target.value)} className="w-1/4 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none">
            <option value="">Día</option>
            {days.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
          <select value={m} onChange={e => update('m', e.target.value)} className="w-1/3 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none">
            <option value="">Mes</option>
            {months.map(mon => <option key={mon.v} value={mon.v}>{mon.l}</option>)}
          </select>
          <select value={y} onChange={e => update('y', e.target.value)} className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none">
            <option value="">Año</option>
            {years.map(yr => <option key={yr} value={yr.toString()}>{yr}</option>)}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-950 h-full flex flex-col animate-fade-in transition-colors duration-300">
      <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Períodos</h2>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-8 pb-32">
        <form onSubmit={handleAdd} className="card-surface p-6 rounded-[2.5rem] space-y-6 shadow-xl border-none">
          <div className="space-y-1.5 p-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Período</label>
            <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Trimestre 1 - 2025" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
          </div>

          <div className="space-y-4">
            <DateSegmentSelector label="Fecha Inicio" value={fechaInicio} onChange={setFechaInicio} />
            <DateSegmentSelector label="Fecha Fin" value={fechaFin} onChange={setFechaFin} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Crear Período
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Historial</h3>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : periodos.length === 0 ? (
            <div className="card-surface p-12 rounded-[2rem] text-center border-dashed border-2">
               <p className="text-slate-300 text-xs font-black uppercase tracking-widest">Vacío</p>
            </div>
          ) : (
            periodos.map(p => (
              <div key={p.id} className="card-surface p-5 rounded-[2rem] flex items-center justify-between animate-fade-in-up hover:border-blue-200 transition-colors">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{p.nombre}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase mt-1.5 tracking-widest">
                    <Calendar size={12} className="text-blue-500" /> {formatDateDisplay(p.fecha_inicio)} - {formatDateDisplay(p.fecha_fin)}
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"><Trash2 size={20} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodManager;
