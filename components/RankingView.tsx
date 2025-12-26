
import React, { useState, useEffect } from 'react';
import { PeriodoPuntaje, RankingEntry, Group } from '../types';
import * as rankingService from '../services/rankingService';
import { Trophy, Award, Loader2, Filter, Calendar, Info, Star, ChevronRight, X, Clock, AlertTriangle, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { formatDateDisplay } from '../utils/formatters';

interface RankingViewProps {
  groups: Group[];
}

const RankingView: React.FC<RankingViewProps> = ({ groups }) => {
  const [periodos, setPeriodos] = useState<PeriodoPuntaje[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  
  const [selectedServidor, setSelectedServidor] = useState<RankingEntry | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    if (selectedPeriodo) loadRanking();
  }, [selectedPeriodo, selectedGroup]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const per = await rankingService.getPeriodos();
      setPeriodos(per);
      if (per.length > 0) setSelectedPeriodo(per[0].id);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadRanking = async () => {
    setLoading(true);
    try {
      const data = await rankingService.getRanking(selectedPeriodo, selectedGroup);
      setRanking(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadHistory = async (entry: RankingEntry) => {
    setSelectedServidor(entry);
    setLoadingHistory(true);
    try {
      const data = await rankingService.getServidorHistory(selectedPeriodo, entry.servidor_id);
      setHistory(data);
    } catch (e) { console.error(e); }
    finally { setLoadingHistory(false); }
  };

  const calculatePoints = (asis: any) => {
    let pts = 0;
    if (asis.asistio) pts += 10;
    if (asis.asistio && asis.llego_puntual) pts += 5;
    if (asis.asistio && asis.llego_tarde) pts += 2;
    if (asis.falto_sin_excusa) pts -= 10;
    if (asis.es_servicio_extra) pts += 5;
    return pts;
  };

  const safeText = (val: any): string => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'object') return val.nombre || val.name || '-';
    return String(val);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* HEADER UNIFICADO */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Puntajes</h2>
          <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">Ranking de Servidores</p>
        </div>
        <button 
          onClick={() => setShowRules(!showRules)} 
          className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Trophy size={20} />
        </button>
      </div>

      <div className="card-surface p-6 rounded-[2.5rem] grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-400 ml-1">Periodo</label>
          <div className="inner-session p-3 rounded-xl flex items-center gap-2 border-none">
            <select 
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value)}
              className="w-full bg-transparent text-[11px] font-black dark:text-white outline-none"
            >
              {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-400 ml-1">Filtrar Grupo</label>
          <div className="inner-session p-3 rounded-xl flex items-center gap-2 border-none">
            <select 
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-transparent text-[11px] font-black dark:text-white outline-none"
            >
              <option value="ALL">Todos los grupos</option>
              {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <div className="space-y-4">
          {ranking.length === 0 ? (
            <div className="card-surface p-16 rounded-[2.5rem] text-center border-dashed border-2 bg-white/50">
              <Award size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
              <p className="text-slate-500 text-[10px] font-bold tracking-widest">Sin registros este período</p>
            </div>
          ) : (
            ranking.map((entry, index) => (
              <div 
                key={entry.servidor_id}
                onClick={() => loadHistory(entry)}
                className={`card-surface flex items-center justify-between p-5 rounded-[2rem] cursor-pointer active:scale-[0.98] transition-all duration-300 ${
                  index === 0 
                  ? 'bg-blue-600 border-blue-700 dark:bg-indigo-600 dark:border-indigo-500/50 shadow-xl shadow-blue-500/30 dark:shadow-indigo-500/20' 
                  : ''
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base ${
                    index === 0 
                    ? 'bg-white text-blue-600 dark:text-indigo-600 shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {index === 0 ? <Trophy size={18} /> : index + 1}
                  </div>
                  <div>
                    <h4 className={`font-black text-[14px] tracking-tight ${
                      index === 0 ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>{safeText(entry.nombre_completo)}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold block ${
                        index === 0 ? 'text-blue-100/80 dark:text-indigo-100/80' : 'text-blue-600 dark:text-blue-400'
                      }`}>{safeText(entry.grupo)}</span>
                      <span className={`w-1 h-1 rounded-full ${index === 0 ? 'bg-white/30' : 'bg-slate-300'}`}></span>
                      <span className={`text-[9px] font-black ${
                        index === 0 ? 'text-blue-50 dark:text-indigo-50' : 'text-slate-500'
                      }`}>{entry.total_asistencias} servicios</span>
                    </div>
                  </div>
                </div>
                <div className={`text-right px-4 py-2 rounded-2xl min-w-[55px] ${
                  index === 0 ? 'bg-white/20 dark:bg-black/20 text-white' : 'bg-slate-50 dark:bg-slate-800/50'
                }`}>
                  <span className={`text-lg font-black ${index === 0 ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                    {entry.puntaje_total}
                  </span>
                  <p className={`text-[8px] font-black tracking-widest ${
                    index === 0 ? 'text-blue-50 dark:text-indigo-100/60' : 'text-slate-400'
                  }`}>pts</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedServidor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedServidor(null)} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="font-black text-[10px] text-slate-900 dark:text-white tracking-widest uppercase">Ficha del Servidor</h3>
                        <p className="text-[13px] text-blue-600 dark:text-blue-400 font-black mt-1 leading-tight">{safeText(selectedServidor.nombre_completo)}</p>
                    </div>
                    <button onClick={() => setSelectedServidor(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
                </div>

                {/* RESUMEN DE ESTADÍSTICAS EN EL MODAL */}
                <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <ClipboardCheck size={14} className="text-blue-600 mb-1" />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Servicios</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{selectedServidor.total_asistencias}</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <Star size={14} className="text-amber-500 mb-1" />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Puntaje</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{selectedServidor.puntaje_total}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Historial de asistencias</h4>
                    {loadingHistory ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : history.length === 0 ? (
                      <p className="text-center py-10 text-slate-400 text-[11px] italic">No hay registros de asistencia para este periodo.</p>
                    ) : history.map(asis => {
                        const pts = calculatePoints(asis);
                        const serviceData = Array.isArray(asis.servicios) ? asis.servicios[0] : asis.servicios;
                        return (
                          <div key={asis.id} className="inner-session p-4 rounded-2xl border-none">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-[11px] font-black text-slate-900 dark:text-white">{safeText(serviceData?.name)}</span>
                                  <span className={`text-[11px] font-black ${pts >= 0 ? 'text-blue-600' : 'text-rose-500'}`}>{pts >= 0 ? `+${pts}` : pts}</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 tracking-widest">
                                <span>{formatDateDisplay(safeText(serviceData?.date))}</span>
                                {asis.llego_tarde && <span className="text-orange-500 font-black">Llegada tarde</span>}
                                {!asis.asistio && <span className="text-rose-500 font-black">{asis.excusado ? 'Justificada' : 'Faltó'}</span>}
                              </div>
                          </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RankingView;
