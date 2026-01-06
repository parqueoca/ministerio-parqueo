
import React, { useMemo, useState, useEffect } from 'react';
import { Service, Group, ParkingPosition, Server } from '../types';
import { 
  Plus, Edit2, Search, FileDown, Loader2, CheckCircle2, FileText, Filter, CalendarDays, ClipboardCheck, Clock, CalendarSearch, Trash2, MessageCircle, X, Send, Zap, Check
} from 'lucide-react';
import { formatTime12h, normalizeString, formatDateDisplay, isPastDate } from '../utils/formatters';
import { generateServiceReportPDF, generateServiceAssignmentPDF } from '../services/pdfGenerator';
import AttendanceManager from './AttendanceManager';

interface ServiceCalendarProps {
  services: Service[];
  groups: Group[];
  positions: ParkingPosition[];
  servers: Server[];
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onConfirmRequest?: (title: string, message: string, onConfirm: () => Promise<void>) => void;
}

const ServiceCalendar: React.FC<ServiceCalendarProps> = ({ services, groups, positions, servers, onAdd, onEdit, onDelete, onConfirmRequest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [attendanceService, setAttendanceService] = useState<Service | null>(null);
  const [reminderService, setReminderService] = useState<Service | null>(null);
  
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const getGroupName = (id: any) => {
    if (id === 'MULTI') return 'Múltiples Grupos';
    const group = groups.find(g => g.id === id || g.name === id);
    if (group) return group.name;
    return typeof id === 'object' ? 'Sin Grupo' : String(id || 'Sin Grupo');
  };

  const filteredServices = useMemo(() => {
    let result = [...services];
    if (startDate) result = result.filter(service => service.date >= startDate);
    if (endDate) result = result.filter(service => service.date <= endDate);
    if (groupFilter === 'MULTI') {
      result = result.filter(service => service.isExtra === true || service.groupId === 'MULTI');
    } else if (groupFilter !== 'ALL') {
      result = result.filter(service => service.groupId === groupFilter);
    }
    if (searchQuery.trim()) {
      const q = normalizeString(searchQuery);
      result = result.filter(service => {
        const nameMatch = normalizeString(service.name || '').includes(q);
        const groupMatch = normalizeString(getGroupName(service.groupId)).includes(q);
        return nameMatch || groupMatch;
      });
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services, searchQuery, startDate, endDate, groupFilter, groups]);

  const handleEditClick = (service: Service) => {
    if (isPastDate(service.date) && onConfirmRequest) {
      onConfirmRequest(
        'SERVICIO REALIZADO',
        'Este servicio ya ocurrió. ¿Deseas editarlo de todas formas?',
        async () => {
          onEdit(service);
        }
      );
    } else {
      onEdit(service);
    }
  };

  const handleWhatsAppReminder = (server: Server, service: Service, assignment: any) => {
    const pos = positions.find(p => p.id === assignment.positionId);
    const dateFormatted = formatDateDisplay(service.date);
    const timeFormatted = formatTime12h(service.arrivalTime);
    
    let cleanPhone = server.mobile.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '1' + cleanPhone;
    }

    const message = `*MINISTERIO SERVICIO PARQUEO*\n` +
      `*CIELOS ABIERTOS*\n\n` +
      `Hola *${server.firstName}*, te recordamos tu servicio de *Parqueo*:\n\n` +
      `📅 *Fecha:* ${dateFormatted}\n` +
      `⏰ *Hora:* ${timeFormatted}\n` +
      `📍 *Posición:* ${pos ? `${pos.code} - ${pos.name}` : 'Asignada en el sitio'}\n\n` +
      `¡Contamos contigo! Bendiciones. 🙏`;

    const encodedMsg = encodeURIComponent(message);
    setSentIds(prev => new Set(prev).add(server.id));
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
  };

  const dispatchNext = () => {
    if (!reminderService) return;
    const nextAssignment = reminderService.assignments.find(a => !sentIds.has(a.serverId));
    if (nextAssignment) {
      const server = servers.find(s => s.id === nextAssignment.serverId);
      if (server) handleWhatsAppReminder(server, reminderService, nextAssignment);
    } else {
      alert("¡Todos los recordatorios han sido procesados!");
    }
  };

  const pendingCount = reminderService 
    ? reminderService.assignments.filter(a => !sentIds.has(a.serverId)).length 
    : 0;

  const SegmentedDateSelector = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
    const [y, m, d] = value ? value.split('-') : ['', '', ''];
    const years = [2024, 2025, 2026];
    const months = [
      { v: '01', l: 'Ene' }, { v: '02', l: 'Feb' }, { v: '03', l: 'Mar' },
      { v: '04', l: 'Abr' }, { v: '05', l: 'May' }, { v: '06', l: 'Jun' },
      { v: '07', l: 'Jul' }, { v: '08', l: 'Ago' }, { v: '09', l: 'Sep' },
      { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dic' }
    ];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const update = (type: 'd' | 'm' | 'y', val: string) => {
      const newD = type === 'd' ? val : (d || '01');
      const newM = type === 'm' ? val : (m || '01');
      const newY = type === 'y' ? val : (y || '2025');
      onChange(`${newY}-${newM}-${newD}`);
    };

    return (
      <div className="space-y-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-2 border-l-blue-600">
        <label className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-[0.1em] ml-0.5 flex items-center gap-1">
          <CalendarDays size={10} /> {label}
        </label>
        <div className="flex gap-1.5">
          <select value={d} onChange={e => update('d', e.target.value)} className="w-1/4 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold dark:text-white outline-none">
            <option value="" className="text-slate-900">Día</option>
            {days.map(day => <option key={day} value={day} className="text-slate-900">{day}</option>)}
          </select>
          <select value={m} onChange={e => update('m', e.target.value)} className="w-1/3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold dark:text-white outline-none">
            <option value="" className="text-slate-900">Mes</option>
            {months.map(mon => <option key={mon.v} value={mon.v} className="text-slate-900">{mon.l}</option>)}
          </select>
          <select value={y} onChange={e => update('y', e.target.value)} className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold dark:text-white outline-none">
            <option value="" className="text-slate-900">Año</option>
            {years.map(yr => <option key={yr} value={yr.toString()} className="text-slate-900">{yr}</option>)}
          </select>
        </div>
      </div>
    );
  };

  const handleExport = async () => {
    if (filteredServices.length === 0) return alert("No hay servicios filtrados.");
    setIsGenerating(true);
    try {
      await generateServiceReportPDF(filteredServices, groups);
      setShowReportMenu(false);
    } catch (e) { alert("Error generando PDF."); }
    finally { setIsGenerating(false); }
  };

  const handleSingleServiceReport = async (service: Service) => {
    setGeneratingId(service.id);
    try {
      await generateServiceAssignmentPDF(service, groups, positions);
    } catch (e) {
      alert("Error generando el reporte.");
    } finally {
      setGeneratingId(null);
    }
  };

  if (attendanceService) {
    return <AttendanceManager service={attendanceService} servers={servers} onClose={() => setAttendanceService(null)} />;
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Servicios</h2>
          <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">Gestión de Agenda</p>
        </div>
        <div className="flex gap-2">
            <button type="button" onClick={() => setShowReportMenu(true)} className="p-2.5 bg-white dark:bg-slate-900 text-slate-500 rounded-xl border-2 border-slate-300 dark:border-slate-800 active:scale-95 shadow-sm"><FileDown size={18} /></button>
            <button type="button" onClick={onAdd} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xl shadow-blue-500/20 active:scale-95"><Plus size={18} /></button>
        </div>
      </header>

      {showReportMenu && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isGenerating && setShowReportMenu(false)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-fade-in border border-slate-300 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8 text-center">Exportar Reporte</h3>
                  <div className="space-y-3">
                      <button type="button" disabled={isGenerating} onClick={() => handleExport()} className="w-full flex items-center justify-between p-5 bg-blue-600 text-white rounded-2xl border border-blue-500 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                          <span className="text-[11px] font-black uppercase tracking-widest">Generar PDF</span>
                          <FileText size={18} />
                      </button>
                  </div>
                  <button type="button" onClick={() => setShowReportMenu(false)} className="w-full mt-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cerrar</button>
              </div>
          </div>
      )}

      {reminderService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setReminderService(null); setSentIds(new Set()); }} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl animate-scale-up border dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-emerald-600 text-white">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Turbo Recordatorios</h3>
                <p className="text-[10px] font-bold uppercase opacity-80">{reminderService.name}</p>
              </div>
              <button onClick={() => { setReminderService(null); setSentIds(new Set()); }} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="h-1 w-full bg-emerald-100 dark:bg-slate-800">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(sentIds.size / reminderService.assignments.length) * 100}%` }}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {reminderService.assignments.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm italic">No hay servidores asignados.</p>
              ) : (
                reminderService.assignments.map(a => {
                  const server = servers.find(s => s.id === a.serverId);
                  if (!server) return null;
                  const isSent = sentIds.has(server.id);
                  return (
                    <div key={a.serverId} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isSent ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 opacity-60' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'}`}>
                      <div className="min-w-0 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSent ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                          {isSent ? <Check size={14} /> : <span className="text-[10px] font-black">{reminderService.assignments.indexOf(a) + 1}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm truncate ${isSent ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>{server.firstName} {server.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{server.mobile}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleWhatsAppReminder(server, reminderService, a)}
                        className={`p-3 rounded-xl transition-all ${isSent ? 'text-emerald-500 bg-white dark:bg-slate-900 shadow-sm' : 'bg-emerald-600 text-white shadow-lg active:scale-90'}`}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800 space-y-4">
              <button 
                onClick={dispatchNext}
                disabled={pendingCount === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-slate-400 disabled:shadow-none"
              >
                <Zap size={18} className="fill-current" />
                {pendingCount > 0 ? `Enviar Siguiente (${pendingCount} rest.)` : "¡Todo Enviado!"}
              </button>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                El despachador abrirá WhatsApp automáticamente para el siguiente servidor pendiente.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
            <input type="text" placeholder="Buscar por nombre..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-sm outline-none dark:text-white shadow-sm focus:border-blue-500 transition-all" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-[1.8rem] border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="grid gap-2">
            <SegmentedDateSelector label="Desde" value={startDate} onChange={setStartDate} />
            <SegmentedDateSelector label="Hasta" value={endDate} onChange={setEndDate} />
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border-l-2 border-l-slate-400">
            <Filter size={12} className="text-slate-500 ml-0.5 flex-shrink-0" />
            <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="flex-1 bg-transparent text-[10px] font-black dark:text-white outline-none uppercase tracking-[0.05em]">
              <option value="ALL" className="text-slate-900">Todos los Grupos</option>
              {groups.map(g => <option key={g.id} value={g.id} className="text-slate-900">{g.name.toUpperCase()}</option>)}
              <option value="MULTI" className="text-slate-900">Eventos Especiales</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="bg-white/50 dark:bg-slate-900/50 rounded-[2rem] py-16 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
            <CalendarSearch size={40} className="mx-auto text-slate-300 dark:text-slate-800 mb-4" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sin resultados</p>
          </div>
        ) : (
          filteredServices.map(service => {
            const isFinished = isPastDate(service.date);
            return (
              <div 
                key={service.id} 
                className={`bg-white dark:bg-slate-900 rounded-[1.8rem] p-4 border animate-fade-in shadow-sm hover:border-blue-500 transition-all group overflow-hidden ${isFinished ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/5 dark:bg-emerald-900/5' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => handleEditClick(service)}>
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-slate-900 dark:text-white border group-hover:bg-blue-50 transition-colors flex-shrink-0 ${isFinished ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-800'}`}>
                      <span className={`text-lg font-black leading-none ${isFinished ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{service.date.split('-')[2]}</span>
                      <span className={`text-[8px] font-black uppercase mt-0.5 ${isFinished ? 'text-emerald-600/70' : 'text-blue-600'}`}>{new Date(service.date + 'T12:00:00').toLocaleDateString('es', { month: 'short' })}</span>
                    </div>
                    <div className="min-w-0 pt-0.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 dark:text-white text-[13px] leading-tight truncate uppercase tracking-tight max-w-[70%]">{service.name}</h4>
                        {isFinished && (
                          <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest animate-fade-in">
                            <Check size={8} className="fill-current" /> Realizado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-x-2 text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1.5 truncate">
                        <Clock size={10} className={`${isFinished ? 'text-emerald-500' : 'text-blue-500'} flex-shrink-0`} /> 
                        <span className="truncate">{formatTime12h(service.arrivalTime)} | {getGroupName(service.groupId)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-1 relative z-10">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setReminderService(service); }} 
                      className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl active:scale-95 border border-emerald-100/50 flex-shrink-0"
                      title="Enviar recordatorios"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAttendanceService(service); }} 
                      className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl active:scale-95 border border-blue-100/50 flex-shrink-0"
                      title="Pasar asistencia"
                    >
                      <ClipboardCheck size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSingleServiceReport(service); }} 
                      disabled={generatingId === service.id} 
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex-shrink-0"
                    >
                      {generatingId === service.id ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(service.id);
                      }} 
                      className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl flex-shrink-0 active:scale-90 transition-transform"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ServiceCalendar;
