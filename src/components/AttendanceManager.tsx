
import React, { useState, useEffect } from 'react';
import { Service, Server, AsistenciaPuntaje, PeriodoPuntaje } from '../types';
import { ChevronLeft, Check, X, Clock, AlertTriangle, Save, Loader2, Star, User, Info, MessageSquare, AlertCircle } from 'lucide-react';
import * as rankingService from '../services/rankingService';

interface AttendanceManagerProps {
  service: Service;
  servers: Server[];
  onClose: () => void;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ service, servers, onClose }) => {
  const [asistencias, setAsistencias] = useState<Record<string, AsistenciaPuntaje>>({});
  const [periodos, setPeriodos] = useState<PeriodoPuntaje[]>([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pers, existing] = await Promise.all([
        rankingService.getPeriodos(),
        rankingService.getAsistenciasByService(service.id)
      ]);
      
      setPeriodos(pers);
      
      const servicePeriodo = pers.find(p => service.date >= p.fecha_inicio && service.date <= p.fecha_fin);
      if (servicePeriodo) {
        setSelectedPeriodoId(servicePeriodo.id);
      } else if (pers.length > 0) {
        setSelectedPeriodoId(pers[0].id);
      }

      const initialAsistencias: Record<string, AsistenciaPuntaje> = {};
      service.assignments.forEach(a => {
        const existingRecord = existing.find(e => e.servidor_id === a.serverId);
        if (existingRecord) {
          initialAsistencias[a.serverId] = existingRecord;
        } else {
          initialAsistencias[a.serverId] = {
            servidor_id: a.serverId,
            servicio_id: service.id,
            periodo_id: '',
            asistio: true,
            llego_puntual: true,
            llego_tarde: false,
            falto_sin_excusa: false,
            excusado: false,
            es_servicio_extra: service.isExtra,
            nota_adicional: ''
          };
        }
      });
      setAsistencias(initialAsistencias);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateAsistencia = (serverId: string, updates: Partial<AsistenciaPuntaje>) => {
    setAsistencias(prev => ({
      ...prev,
      [serverId]: { ...prev[serverId], ...updates }
    }));
  };

  const handleSave = async () => {
    if (!selectedPeriodoId) {
      alert("Debes seleccionar un período de puntaje.");
      return;
    }
    setSaving(true);
    try {
      // Fix: Explicitly typing 'a' as AsistenciaPuntaje to prevent "Spread types may only be created from object types" error
      const dataToSave = Object.values(asistencias).map((a: AsistenciaPuntaje) => ({
        ...a,
        periodo_id: selectedPeriodoId
      }));
      await rankingService.saveAsistencias(dataToSave);
      onClose();
    } catch (e) {
      alert("Error al guardar asistencias");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-gray-400">
        <Loader2 className="animate-spin mb-2" />
        <p className="text-sm italic">Cargando servidores asignados...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-slide-in-up pb-20">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registro Asistencia</h2>
            <p className="text-[10px] text-gray-500 uppercase font-bold">{service.name}</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto no-scrollbar space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 space-y-3">
          <label className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Período Activo</label>
          <select 
            value={selectedPeriodoId}
            onChange={(e) => setSelectedPeriodoId(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold border-none shadow-sm dark:text-white outline-none"
          >
            <option value="">-- Seleccionar Período --</option>
            {periodos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Programación del Día</h3>
          
          {Object.keys(asistencias).length === 0 ? (
            <p className="text-center text-sm text-gray-400 italic py-10">No hay servidores asignados.</p>
          ) : (
            Object.keys(asistencias).map(serverId => {
              const server = servers.find(s => s.id === serverId);
              const asis = asistencias[serverId];
              const isFalto = !asis.asistio;

              return (
                <div key={serverId} className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all shadow-sm space-y-4 ${asis.asistio ? 'border-gray-100 dark:border-slate-800' : asis.excusado ? 'border-amber-200 bg-amber-50/10' : 'border-red-200 bg-red-50/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-blue-900">
                      {server?.photo ? <img src={server.photo} className="w-full h-full object-cover" /> : <User size={18} className="text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white leading-tight">{server?.firstName} {server?.lastName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{server?.group}</p>
                    </div>
                  </div>
                  
                  {/* Selector Principal: ASISTIÓ / FALTÓ */}
                  <div className="grid grid-cols-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                    <button 
                      onClick={() => updateAsistencia(serverId, { asistio: true, falto_sin_excusa: false, excusado: false })}
                      className={`py-2.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${asis.asistio ? 'bg-green-500 text-white shadow-md' : 'text-gray-400'}`}
                    >
                      <Check size={14} /> ASISTIÓ
                    </button>
                    <button 
                      onClick={() => updateAsistencia(serverId, { asistio: false, llego_puntual: false, llego_tarde: false, falto_sin_excusa: true, excusado: false })}
                      className={`py-2.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${!asis.asistio ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}
                    >
                      <X size={14} /> FALTÓ
                    </button>
                  </div>

                  {/* SUB-OPCIONES SI ASISTIÓ */}
                  {asis.asistio && (
                    <div className="grid grid-cols-2 gap-2 animate-fade-in-down">
                      <button 
                        onClick={() => updateAsistencia(serverId, { llego_puntual: true, llego_tarde: false })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-[10px] font-black transition-all ${asis.llego_puntual ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400'}`}
                      >
                        <Clock size={14} /> PUNTUAL (+5)
                      </button>
                      <button 
                        onClick={() => updateAsistencia(serverId, { llego_puntual: false, llego_tarde: true })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-[10px] font-black transition-all ${asis.llego_tarde ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400'}`}
                      >
                        <AlertTriangle size={14} /> TARDE (+2)
                      </button>
                    </div>
                  )}

                  {/* SUB-OPCIONES SI FALTÓ */}
                  {!asis.asistio && (
                    <div className="space-y-3 animate-fade-in-down">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => updateAsistencia(serverId, { excusado: true, falto_sin_excusa: false })}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[9px] font-black transition-all ${asis.excusado ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400'}`}
                        >
                          <Info size={14} className="mb-1" /> JUSTIFICADA (0)
                        </button>
                        <button 
                          onClick={() => updateAsistencia(serverId, { excusado: false, falto_sin_excusa: true })}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[9px] font-black transition-all ${asis.falto_sin_excusa ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400'}`}
                        >
                          <AlertCircle size={14} className="mb-1" /> NO JUSTIFICADA (-10)
                        </button>
                      </div>

                      {asis.excusado && (
                        <div className="relative">
                           <label className="text-[9px] font-bold text-amber-700 uppercase mb-1 flex items-center gap-1">
                             <MessageSquare size={10} /> Motivo de la Excusa
                           </label>
                           <textarea 
                             value={asis.nota_adicional || ''}
                             onChange={(e) => updateAsistencia(serverId, { nota_adicional: e.target.value })}
                             placeholder="Escribe el motivo (Ej: Trabajo, Viaje...)"
                             className="w-full p-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 outline-none dark:text-white"
                             rows={2}
                           />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !selectedPeriodoId}
          className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-10"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Finalizar Registro</span>
        </button>
      </div>
    </div>
  );
};

export default AttendanceManager;
