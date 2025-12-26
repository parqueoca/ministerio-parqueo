import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ViewState, Server, Group, ServerStatus, Service, ParkingPosition, Vehicle, VehicleCategory } from './types';
import * as serverService from './services/serverService';
import * as calendarService from './services/serviceCalendarService';
import * as vehicleService from './services/vehicleService';
import { isSupabaseConfigured } from './services/supabaseClient';
import { normalizeString } from './utils/formatters';
import { generateServerPDF } from './services/pdfGenerator';
import Dashboard from './components/Dashboard';
import ServerForm from './components/ServerForm';
import ServerCard from './components/ServerCard';
import GroupManager from './components/GroupManager';
import PositionManager from './components/PositionManager';
import DatabaseSetup from './components/DatabaseSetup';
import ServiceCalendar from './components/ServiceCalendar';
import ServiceForm from './components/ServiceForm';
import VehicleManager from './components/VehicleManager';
import VehicleForm from './components/VehicleForm';
import RankingView from './components/RankingView';
import PeriodManager from './components/PeriodManager';
import ConfirmModal from './components/ConfirmModal';
import { 
  Search, Settings, Plus, Sun, Moon, Users, MapPin, Trophy, Loader2, Calendar, LayoutDashboard, Car, ChevronRight, Filter, FileDown, Check, X, Lock
} from 'lucide-react';

// CLAVE DE ACCESO PRIVADO
const SECRET_PIN = "7755";

const App: React.FC = () => {
  // --- ESTADOS DE SEGURIDAD ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // --- ESTADOS ORIGINALES DE LA APP ---
  const [view, setView] = useState<ViewState>('dashboard');
  const [servers, setServers] = useState<Server[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [positions, setPositions] = useState<ParkingPosition[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [serverGroupFilter, setServerGroupFilter] = useState('ALL');
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const availableColumns = [
    { id: 'firstName', label: 'Nombre' },
    { id: 'lastName', label: 'Apellido' },
    { id: 'cedula', label: 'Cédula' },
    { id: 'group', label: 'Grupo' },
    { id: 'mobile', label: 'Celular' },
    { id: 'status', label: 'Estatus' },
    { id: 'joinDate', label: 'Fecha Ingreso' },
    { id: 'birthDate', label: 'Nacimiento' },
    { id: 'bloodType', label: 'Sangre' },
    { id: 'size', label: 'Talla' },
    { id: 'email', label: 'Email' },
    { id: 'emergencyContactName', label: 'Contacto Emerg.' }
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(['firstName', 'lastName', 'cedula', 'group', 'mobile', 'status']);

  // --- EFECTOS DE SEGURIDAD Y TEMA ---
  useEffect(() => {
    const savedAuth = localStorage.getItem('app_authenticated');
    if (savedAuth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // --- FUNCIONES DE ACCESO ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === SECRET_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('app_authenticated', 'true');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  // --- LÓGICA DE DATOS ---
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return; // No cargar datos si no está autenticado
    setLoading(true);
    try {
      const [serversData, groupsData, positionsData, servicesData, vehiclesData, catsData] = await Promise.all([
        serverService.getServers(), serverService.getGroups(), calendarService.getPositions(),
        calendarService.getServices(), vehicleService.getVehicles(), vehicleService.getCategories()
      ]);
      setServers(serversData || []);
      setGroups(groupsData || []);
      setPositions(positionsData || []);
      setServices(servicesData || []);
      setVehicles(vehiclesData || []);
      setCategories(catsData || []);
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      if (err.message?.includes('not find') || err.message?.includes('exist')) setSetupRequired(true);
    } finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const closeConfirm = () => setConfirmData(prev => ({ ...prev, isOpen: false, isProcessing: false }));

  const openConfirm = (title: string, message: string, onConfirm: () => Promise<void>) => {
    setConfirmData({
      isOpen: true,
      title,
      message,
      isProcessing: false,
      onConfirm: async () => {
        setConfirmData(prev => ({ ...prev, isProcessing: true }));
        try {
          await onConfirm();
          closeConfirm();
        } catch (error) {
          console.error(error);
          setConfirmData(prev => ({ ...prev, isProcessing: false }));
        }
      }
    });
  };

  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; isProcessing: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, isProcessing: false });

  // --- MANEJADORES DE BORRADO ---
  const handleDeleteServer = (id: string) => {
    openConfirm('¿ELIMINAR SERVIDOR?', 'Esta acción es permanente y eliminará todo el historial.',
      async () => {
        const backup = [...servers];
        setServers(prev => prev.filter(s => s.id !== id));
        try { await serverService.deleteServer(id); } catch (error: any) { setServers(backup); alert(`Error: ${error.message}`); throw error; }
      }
    );
  };

  const handleDeleteService = (id: string) => {
    openConfirm('¿ELIMINAR SERVICIO?', 'Se borrarán todas las asignaciones de este día.',
      async () => {
        const backup = [...services];
        setServices(prev => prev.filter(s => s.id !== id));
        try { await calendarService.deleteService(id); } catch (error: any) { setServices(backup as any); alert(`Error: ${error.message}`); throw error; }
      }
    );
  };

  const handleDeleteVehicle = (id: string) => {
    openConfirm('¿BORRAR VEHÍCULO?', 'El registro del vehículo será eliminado.',
      async () => {
        const backup = [...vehicles];
        setVehicles(prev => prev.filter(v => v.id !== id));
        try { await vehicleService.deleteVehicle(id); } catch (error: any) { setVehicles(backup as any); alert(`Error: ${error.message}`); throw error; }
      }
    );
  };

  const handleDeleteGroup = (id: string) => {
    openConfirm('¿ELIMINAR GRUPO?', 'El grupo se eliminará si no tiene servidores asignados.',
      async () => {
        const backup = [...groups];
        setGroups(prev => prev.filter(g => g.id !== id));
        try { await serverService.deleteGroup(id); } catch (error: any) { setGroups(backup); alert("No se pudo eliminar: Error de dependencias."); throw error; }
      }
    );
  };

  const handleDeletePosition = (id: string) => {
    openConfirm('¿ELIMINAR POSICIÓN?', 'Esta posición ya no estará disponible.',
      async () => {
        const backup = [...positions];
        setPositions(prev => prev.filter(p => p.id !== id));
        try { await calendarService.deletePosition(id); } catch (error: any) { setPositions(backup); alert("Error: Esta posición está en uso."); throw error; }
      }
    );
  };

  const processedServers = useMemo(() => {
    let result = servers.filter(s => {
      const q = normalizeString(searchQuery);
      const fullName = (s.firstName || '') + ' ' + (s.lastName || '');
      const searchFields = [fullName, s.cedula || '', s.group || '', s.mobile || ''].map(normalizeString);
      const matchesSearch = q === '' || searchFields.some(field => field.includes(q));
      const matchesGroup = serverGroupFilter === 'ALL' || s.group === serverGroupFilter;
      return matchesSearch && matchesGroup;
    });
    return result.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [servers, searchQuery, serverGroupFilter]);

  const handleExportServersReport = async () => {
    if (processedServers.length === 0) return;
    setIsGeneratingReport(true);
    setShowColumnSelector(false);
    try {
      const filterLabel = serverGroupFilter === 'ALL' ? 'GENERAL' : `GRUPO: ${serverGroupFilter}`;
      await generateServerPDF(processedServers, selectedColumns, `LISTADO DE SERVIDORES - ${filterLabel}`);
    } catch (error) { alert("No se pudo generar el reporte PDF."); } finally { setIsGeneratingReport(false); }
  };

  // --- VISTA DE BLOQUEO (PIN) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 transition-colors duration-500">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-slate-700/50 text-center animate-scale-up">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-600/20 rotate-3">
            <Lock size={32} className="text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Acceso Privado</h1>
          <p className="text-slate-400 mb-10 text-xs font-bold uppercase tracking-[0.2em]">Ministerio Parqueo CA</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-2xl px-4 py-5 text-white text-center text-4xl tracking-[0.5em] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-700 font-mono"
                autoFocus
              />
            </div>
            {pinError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">PIN Incorrecto</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/40 transition-all active:scale-95 uppercase tracking-widest text-sm">
              Validar Credenciales
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (setupRequired) return <DatabaseSetup />;

  const TabButton = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button onClick={() => setView(id)} className={`flex flex-col items-center justify-center flex-1 py-3 transition-all relative ${view === id ? 'text-white' : 'text-blue-100/60 hover:text-white/80'}`}>
      <Icon size={18} className="flex-shrink-0" />
      <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider">{label}</span>
      {view === id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full" />}
    </button>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen max-w-lg mx-auto flex flex-col relative transition-colors duration-300">
      <header className="bg-blue-600 dark:bg-slate-900 sticky top-0 z-50 shadow-md">
        <div className="flex justify-between items-center px-6 pt-5 pb-4">
            <div className="flex flex-col min-w-0">
                <h1 className="text-[17px] font-extrabold text-white tracking-tight leading-none uppercase truncate">Ministerio Parqueo</h1>
                <p className="text-[9px] font-bold text-blue-100 uppercase tracking-[0.1em] mt-1 opacity-70 italic">Cielos Abiertos</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-95">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setView('settings')} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-95">
                <Settings size={18} />
              </button>
            </div>
        </div>
        {!['form', 'service-form', 'vehicle-form', 'groups', 'positions', 'period-manager', 'setup-repair'].includes(view) && (
          <nav className="flex px-1 bg-blue-600 dark:bg-slate-900 border-t border-white/5">
            <TabButton id="dashboard" label="Inicio" icon={LayoutDashboard} />
            <TabButton id="list" label="Servidores" icon={Users} />
            <TabButton id="calendar" label="Agenda" icon={Calendar} />
            <TabButton id="ranking" label="Puntos" icon={Trophy} />
            <TabButton id="vehicles" label="Autos" icon={Car} />
          </nav>
        )}
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar relative p-5 pb-24">
        {loading ? (
          <div className="flex flex-col h-64 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {view === 'dashboard' && <Dashboard servers={servers} />}
            {view === 'list' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2 px-1">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Directorio</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowColumnSelector(true)} disabled={isGeneratingReport} className="p-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl shadow-lg border-2 border-slate-100 dark:border-slate-800 active:scale-95 transition-all">
                      {isGeneratingReport ? <Loader2 size={24} className="animate-spin" /> : <FileDown size={24} />}
                    </button>
                    <button onClick={() => { setEditingServer(null); setView('form'); }} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm dark:text-white" />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    <button onClick={() => setServerGroupFilter('ALL')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${serverGroupFilter === 'ALL' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}>TODOS</button>
                    {groups.map(g => (
                        <button key={g.id} onClick={() => setServerGroupFilter(g.name)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${serverGroupFilter === g.name ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}>{g.name}</button>
                    ))}
                </div>
                <div className="grid gap-4">
                  {processedServers.map(s => <ServerCard key={s.id} server={s} isSelected={false} onToggleSelect={() => {}} onEdit={(server) => { setEditingServer(server); setView('form'); }} onDelete={handleDeleteServer} />)}
                </div>
              </div>
            )}
            {view === 'calendar' && <ServiceCalendar services={services} groups={groups} positions={positions} servers={servers} onAdd={() => { setEditingService(null); setView('service-form'); }} onEdit={(s) => { setEditingService(s); setView('service-form'); }} onDelete={handleDeleteService} />}
            {view === 'ranking' && <RankingView groups={groups} />}
            {view === 'vehicles' && <VehicleManager vehicles={vehicles} categories={categories} onAdd={() => { setEditingVehicle(null); setView('vehicle-form'); }} onEdit={(v) => { setEditingVehicle(v); setView('vehicle-form'); }} onDelete={handleDeleteVehicle} />}
            {view === 'form' && <ServerForm initialData={editingServer} groups={groups} onSave={async (d) => { if(editingServer) await serverService.updateServer(editingServer.id, d); else await serverService.addServer(d); setView('list'); fetchData(); }} onCancel={() => setView('list')} isSubmitting={false} />}
            {view === 'vehicle-form' && <VehicleForm initialData={editingVehicle} categories={categories} onSave={async (v) => { await vehicleService.saveVehicle(v); setView('vehicles'); fetchData(); }} onCancel={() => setView('vehicles')} />}
            {view === 'service-form' && <ServiceForm initialData={editingService} groups={groups} servers={servers} onSave={async (s) => { await calendarService.saveService(s); setView('calendar'); fetchData(); }} onCancel={() => setView('calendar')} />}
            {view === 'settings' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Administración</h2>
                <div className="grid gap-3">
                  <button onClick={() => setView('groups')} className="card-chrome w-full flex justify-between p-5 rounded-2xl items-center active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4"><Users size={20} className="text-blue-600" /> <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Gestionar Grupos</span></div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button onClick={() => setView('positions')} className="card-chrome w-full flex justify-between p-5 rounded-2xl items-center active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4"><MapPin size={20} className="text-emerald-600" /> <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Áreas de Parqueo</span></div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button onClick={() => setView('period-manager')} className="card-chrome w-full flex justify-between p-5 rounded-2xl items-center active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4"><Trophy size={20} className="text-amber-600" /> <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Períodos de Puntaje</span></div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  {/* BOTÓN CERRAR SESIÓN (Solo borra el acceso del navegador actual) */}
                  <button onClick={() => { localStorage.removeItem('app_authenticated'); window.location.reload(); }} className="mt-8 p-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-rose-500 transition-all">
                    Cerrar Sesión Privada
                  </button>
                </div>
              </div>
            )}
            {view === 'groups' && <GroupManager groups={groups} onAddGroup={async (n) => { await serverService.addGroup(n); fetchData(); }} onDeleteGroup={handleDeleteGroup} onClose={() => setView('settings')} />}
            {view === 'positions' && <PositionManager positions={positions} onAdd={async (c, n) => { await calendarService.addPosition(c, n); fetchData(); }} onDelete={handleDeletePosition} onClose={() => setView('settings')} />}
            {view === 'period-manager' && <PeriodManager onClose={() => setView('settings')} />}
            {view === 'setup-repair' && <DatabaseSetup onClose={() => setView('settings')} />}
          </div>
        )}
      </main>

      {showColumnSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowColumnSelector(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl animate-scale-up border dark:border-slate-800">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Columnas PDF</h3>
              <button onClick={() => setShowColumnSelector(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto grid grid-cols-2 gap-3 no-scrollbar">
              {availableColumns.map(col => (
                <button key={col.id} onClick={() => toggleColumn(col.id)} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedColumns.includes(col.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${selectedColumns.includes(col.id) ? 'bg-white/20' : 'bg-slate-200'}`}>{selectedColumns.includes(col.id) && <Check size={14} />}</div>
                  <span className="text-xs font-bold truncate">{col.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t dark:border-slate-800">
              <button onClick={handleExportServersReport} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Generar Reporte</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmData.isOpen} title={confirmData.title} message={confirmData.message} onConfirm={confirmData.onConfirm} onCancel={closeConfirm} isProcessing={confirmData.isProcessing} />
    </div>
  );
};

export default App;
