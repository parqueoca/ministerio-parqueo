
import React, { useState, useEffect } from 'react';
import { Service, ServiceType, Group, Server, ServiceAssignment, ParkingPosition, ServerStatus, ServiceName } from '../types';
import { ChevronLeft, Calendar, Clock, Users, Plus, Save, Trash2, MapPin, Search, Type } from 'lucide-react';
import * as calendarService from '../services/serviceCalendarService';
import { normalizeString, toTitleCase } from '../utils/formatters';

interface ServiceFormProps {
  initialData?: Service | null;
  groups: Group[];
  servers: Server[];
  serviceNames: ServiceName[];
  onSave: (service: Service) => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, groups, servers, serviceNames, onSave, onCancel }) => {
  const [isExtra, setIsExtra] = useState(initialData?.isExtra || false);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.arrivalTime || '');
  const [name, setName] = useState(initialData?.name || '');
  const [groupId, setGroupId] = useState(initialData?.groupId || '');
  const [assignments, setAssignments] = useState<ServiceAssignment[]>(initialData?.assignments || []);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [availablePositions, setAvailablePositions] = useState<ParkingPosition[]>([]);

  useEffect(() => {
    const loadPositions = async () => {
      const pos = await calendarService.getPositions();
      setAvailablePositions(pos);
    };
    loadPositions();
  }, []);

  // Lógica de auto-sufijo para nombres base
  useEffect(() => {
    if (name.startsWith('Domingo de Gloria') || (!name && !initialData)) {
      if (time) {
        const [hours] = time.split(':').map(Number);
        const suffix = hours < 12 ? '(AM)' : '(PM)';
        const baseName = 'Domingo de Gloria';
        
        // Solo actualizamos si el nombre actual es un "Domingo de Gloria" (con o sin sufijo previo)
        if (name.startsWith(baseName)) {
           setName(`${baseName} ${suffix}`);
        }
      }
    }
  }, [time, name, initialData]);

  useEffect(() => {
    if (!isExtra && date && groups.length > 0) {
      const selectedDate = new Date(date + 'T12:00:00');
      const groupNames = groups.map(g => g.name);
      const rotatedGroup = calendarService.calculateRotationGroup(selectedDate, groupNames);
      
      const group = groups.find(g => g.name === rotatedGroup);
      if (group) setGroupId(group.id);

      const day = selectedDate.getDay();
      const serviceTypes = calendarService.getServiceTypes();
      const type = serviceTypes.find(t => t.dayOfWeek === day);
      if (type && !initialData) {
        setTime(type.defaultTime);
        // Si no hay nombre manual y es domingo/miercoles sugerir base
        if (!name) setName(type.name);
      }
    }
  }, [date, isExtra, groups, initialData, name]);

  const handleAddServer = (serverId: string) => {
    if (assignments.some(a => a.serverId === serverId)) return;
    setAssignments([...assignments, { serverId, positionId: '' }]);
  };

  const removeAssignment = (serverId: string) => {
    setAssignments(assignments.filter(a => a.serverId !== serverId));
  };

  const updatePosition = (serverId: string, positionId: string) => {
    setAssignments(assignments.map(a => a.serverId === serverId ? { ...a, positionId } : a));
  };

  const filteredServers = servers.filter(s => {
    if (s.status === ServerStatus.INACTIVO) return false;

    const fullName = normalizeString(`${s.firstName} ${s.lastName}`);
    const query = normalizeString(searchQuery);
    const matchesSearch = fullName.includes(query);
    
    if (groupId && groupId !== 'MULTI') {
      const selectedGroupName = groups.find(g => g.id === groupId)?.name;
      if (selectedGroupName) {
        return matchesSearch && s.group === selectedGroupName;
      }
    }
    
    return matchesSearch;
  }).sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toUpperCase();
    const nameB = `${b.firstName} ${b.lastName}`.toUpperCase();
    return nameA.localeCompare(nameB);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Selecciona un nombre de servicio.");
      return;
    }
    onSave({
      id: initialData?.id || calendarService.generateId(),
      name,
      date,
      arrivalTime: time,
      groupId,
      assignments,
      isExtra,
      createdAt: initialData?.createdAt || Date.now()
    });
  };

  const renderDateSelector = () => {
    const [year, month, day] = date ? date.split('-') : ['', '', ''];
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];
    const months = [
      { val: '01', label: 'Ene' }, { val: '02', label: 'Feb' }, { val: '03', label: 'Mar' },
      { val: '04', label: 'Abr' }, { val: '05', label: 'May' }, { val: '06', label: 'Jun' },
      { val: '07', label: 'Jul' }, { val: '08', label: 'Ago' }, { val: '09', label: 'Sep' },
      { val: '10', label: 'Oct' }, { val: '11', label: 'Nov' }, { val: '12', label: 'Dic' }
    ];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const updatePart = (type: 'd' | 'm' | 'y', newVal: string) => {
      let dVal = type === 'd' ? newVal : (day || '01');
      let mVal = type === 'm' ? newVal : (month || '01');
      let yVal = type === 'y' ? newVal : (year || currentYear.toString());
      setDate(`${yVal}-${mVal}-${dVal}`);
    };

    return (
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <Calendar size={12} /> Fecha (Día / Mes / Año)
        </label>
        <div className="flex gap-2">
            <select 
                value={day} 
                onChange={(e) => updatePart('d', e.target.value)}
                className="w-1/4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
            >
                {days.map(d => <option key={d} value={d} className="text-slate-900">{d}</option>)}
            </select>
            <select 
                value={month} 
                onChange={(e) => updatePart('m', e.target.value)}
                className="w-1/3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
            >
                 {months.map(m => <option key={m.val} value={m.val} className="text-slate-900">{m.label}</option>)}
            </select>
            <select 
                value={year} 
                onChange={(e) => updatePart('y', e.target.value)}
                className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
            >
                 {years.map(y => <option key={y} value={y.toString()} className="text-slate-900">{y}</option>)}
            </select>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-slide-in-up pb-20 overflow-hidden transition-colors duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Gestionar Servicio' : 'Nuevo Servicio'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
          <button 
            type="button"
            onClick={() => setIsExtra(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isExtra ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-slate-500'}`}
          >
            Regular (Ciclo)
          </button>
          <button 
            type="button"
            onClick={() => setIsExtra(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isExtra ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-slate-500'}`}
          >
            Evento Especial
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {renderDateSelector()}
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase flex items-center gap-1">
                <Clock size={12} /> Hora Llegada
            </label>
            <input 
              type="time" 
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <Type size={12} /> Nombre del Servicio
          </label>
          <select 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
          >
            <option value="" className="text-slate-900">Seleccionar Nombre de Servicio...</option>
            {/* Conservamos el valor actual si no está en la lista (para ediciones) */}
            {name && !serviceNames.some(sn => sn.name === name || name.startsWith(sn.name)) && (
              <option value={name} className="text-slate-900">{name}</option>
            )}
            {serviceNames.map(sn => (
              <option key={sn.id} value={sn.name} className="text-slate-900">{sn.name}</option>
            ))}
          </select>
          <p className="text-[9px] text-gray-400 mt-1">El sufijo (AM/PM) se ajusta automáticamente para servicios dominicales.</p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Grupo Responsable</label>
          <select 
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
            className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
          >
            <option value="" className="text-slate-900">Seleccionar Grupo</option>
            {isExtra && <option value="MULTI" className="text-slate-900">Varios Grupos</option>}
            {groups.map(g => (
              <option key={g.id} value={g.id} className="text-slate-900">{g.name}</option>
            ))}
          </select>
          {!isExtra && <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Auto-calculado según rotación</p>}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-2">
            <Users size={18} className="text-blue-600 dark:text-blue-400" />
            Asignaciones ({assignments.length})
          </h3>

          <div className="space-y-3 mb-4">
            {assignments.map(a => {
              const server = servers.find(s => s.id === a.serverId);
              
              const occupiedPositionIds = assignments
                .filter(other => other.serverId !== a.serverId && other.positionId !== '')
                .map(other => other.positionId);

              const filteredPositions = availablePositions.filter(p => !occupiedPositionIds.includes(p.id));

              return (
                <div key={a.serverId} className="flex flex-col gap-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm animate-scale-up">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold overflow-hidden border border-blue-100 dark:border-blue-900">
                      {server?.photo ? <img src={server.photo} alt="Avatar" className="w-full h-full object-cover" /> : server?.firstName?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                        {server?.firstName} {server?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-medium">{server?.group}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeAssignment(a.serverId)}
                      className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-xl">
                    <MapPin size={14} className="text-blue-500 dark:text-blue-400" />
                    <select 
                      value={a.positionId}
                      onChange={(e) => updatePosition(a.serverId, e.target.value)}
                      className="flex-1 text-xs bg-transparent border-none p-0 focus:ring-0 text-blue-700 dark:text-blue-300 font-bold outline-none"
                    >
                      <option value="" className="text-slate-900">-- Elige una Posición Libre --</option>
                      {a.positionId && !filteredPositions.some(p => p.id === a.positionId) && (
                        <option value={a.positionId} className="text-slate-900">
                           {availablePositions.find(p => p.id === a.positionId)?.code} - {availablePositions.find(p => p.id === a.positionId)?.name}
                        </option>
                      )}
                      {filteredPositions.map(p => (
                        <option key={p.id} value={p.id} className="text-slate-900">{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
            <div className="relative mb-3">
              <input 
                type="text"
                placeholder="Buscar servidor activo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs dark:text-white dark:placeholder-slate-500"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredServers.length === 0 ? (
                <p className="text-[10px] text-gray-400 dark:text-slate-600 text-center py-2 italic">No hay servidores activos disponibles</p>
              ) : (
                filteredServers.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAddServer(s.id)}
                    disabled={assignments.some(a => a.serverId === s.id)}
                    className="w-full flex items-center justify-between p-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-left transition-colors disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-800 dark:text-slate-200">{s.firstName} {s.lastName}</span>
                      <span className="text-[8px] bg-gray-100 dark:bg-slate-700 px-1 rounded text-gray-500 dark:text-slate-400">{s.group}</span>
                    </div>
                    <Plus size={14} className="text-blue-600 dark:text-blue-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Save size={20} />
          <span>Guardar Servicio</span>
        </button>
      </form>
    </div>
  );
};

export default ServiceForm;
