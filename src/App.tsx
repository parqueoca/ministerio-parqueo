import React, { useState, useEffect } from 'react';
import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';

import Dashboard from './components/Dashboard';
import ServerForm from './components/ServerForm';
import ServiceCalendar from './components/ServiceCalendar';
import VehicleManager from './components/VehicleManager';
import VehicleCategoryManager from './components/VehicleCategoryManager';
import ServiceNameManager from './components/ServiceNameManager';
import RankingView from './components/RankingView';
import PeriodManager from './components/PeriodManager';
import ConfirmModal from './components/ConfirmModal';

import {
  Server,
  Vehicle,
  VehicleCategory,
  Service,
  ServiceName,
  Group
} from './types';

/* ======================================================
   🔐 PANTALLA DE ACCESO
====================================================== */
const AccessGate = ({ onAccess }: { onAccess: (level: AccessLevel) => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const level = validateAccessKey(code);
    if (!level) {
      setError('Código incorrecto');
      return;
    }
    setSessionAccess(level);
    onAccess(level);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl">
        <h1 className="text-xl font-black text-center mb-6 uppercase">
          Acceso Ministerio Parqueo
        </h1>

        <input
          type="password"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Ingrese código"
          className="w-full p-4 border rounded-xl mb-3 text-center"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />

        {error && (
          <p className="text-red-600 text-xs font-bold text-center mb-3">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-black hover:bg-blue-700 transition"
        >
          Entrar
        </button>

        <p className="text-xs text-center opacity-50 mt-4">
          Cielos Abiertos · Sistema Interno
        </p>
      </div>
    </div>
  );
};

/* ======================================================
   🚀 APP PRINCIPAL
====================================================== */
const App: React.FC = () => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [view, setView] = useState<'dashboard' | 'servers' | 'calendar' | 'vehicles' | 'vehicle-categories' | 'service-names' | 'ranking' | 'period-manager' | 'settings'>('dashboard');

  // Estados de datos globales
  const [servers, setServers] = useState<Server[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceNames, setServiceNames] = useState<ServiceName[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Cargar sesión y datos iniciales
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);

    const loadAllData = async () => {
      setLoading(true);
      const serverService = await import('./services/serverService');
      const vehicleService = await import('./services/vehicleService');
      const calendarService = await import('./services/serviceCalendarService');
      const serviceNameService = await import('./services/serviceNameService');

      try {
        const [serversData, vehiclesData, categoriesData, servicesData, namesData, groupsData] = await Promise.all([
          serverService.getServers(),
          vehicleService.getVehicles(),
          // Asegúrate de usar la función correcta aquí:
          vehicleService.getCategories ? vehicleService.getCategories() : [],
          calendarService.getServices(),
          serviceNameService.getServiceNames(),
          serverService.getGroups()
        ]);

        setServers(serversData);
        setVehicles(vehiclesData);
        setVehicleCategories(categoriesData);
        setServices(servicesData);
        setServiceNames(namesData);
        setGroups(groupsData);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Bloqueo total si no hay acceso
  if (!accessLevel) {
    return <AccessGate onAccess={setAccessLevel} />;
  }

  // Funciones dummy async para props
  const dummyAddCategory = async (name: string, description?: string) => {};
  const dummyUpdateCategory = async (id: string, name: string, description?: string) => {};
  const dummyDeleteCategory = async (id: string) => {};
  const dummyAddServiceName = async (name: string) => {};
  const dummyUpdateServiceName = async (id: string, name: string) => {};
  const dummyDeleteServiceName = async (id: string) => {};
  const dummyOnAddService = async () => {};
  const dummyOnEditService = async () => {};
  const dummyOnDeleteService = async () => {};

  // Renderiza la vista según menú seleccionado
  const renderContent = () => {
    if (loading) return <p className="p-10 text-center">Cargando datos...</p>;

    switch(view) {
      case 'dashboard': return <Dashboard servers={servers} />;
      case 'servers': return <ServerForm />; // Ajusta según ServerFormProps reales
      case 'calendar':
        return (
          <ServiceCalendar
            services={services}
            groups={groups}
            positions={[]} // Ajusta si tienes posiciones
            servers={servers}
            onAdd={dummyOnAddService}
            onEdit={dummyOnEditService}
            onDelete={dummyOnDeleteService}
          />
        );
      case 'vehicles':
        return (
          <VehicleManager
            vehicles={vehicles}
            categories={vehicleCategories}
            onAdd={dummyAddCategory}
            onEdit={dummyUpdateCategory}
            onDelete={dummyDeleteCategory}
          />
        );
      case 'vehicle-categories':
        return (
          <VehicleCategoryManager
            categories={vehicleCategories}
            onAdd={dummyAddCategory}
            onUpdate={dummyUpdateCategory}
            onDelete={dummyDeleteCategory}
            onClose={() => setView('dashboard')}
          />
        );
      case 'service-names':
        return (
          <ServiceNameManager
            names={serviceNames}
            onAdd={dummyAddServiceName}
            onUpdate={dummyUpdateServiceName}
            onDelete={dummyDeleteServiceName}
            onClose={() => setView('dashboard')}
          />
        );
      case 'ranking':
        return <RankingView groups={groups} />;
      case 'period-manager':
        return <PeriodManager onClose={() => setView('dashboard')} />;
      case 'settings':
        return <ConfirmModal isOpen={false} title="" message="" onConfirm={() => {}} onCancel={() => {}} />;
      default:
        return <Dashboard servers={servers} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* MENÚ LATERAL */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col">
        <h2 className="text-xl font-black p-6 border-b border-slate-700">Ministerio Parqueo</h2>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('dashboard')} className="w-full text-left p-2 rounded hover:bg-slate-800">Dashboard</button>
          <button onClick={() => setView('servers')} className="w-full text-left p-2 rounded hover:bg-slate-800">Servidores</button>
          <button onClick={() => setView('calendar')} className="w-full text-left p-2 rounded hover:bg-slate-800">Calendario</button>
          <button onClick={() => setView('vehicles')} className="w-full text-left p-2 rounded hover:bg-slate-800">Vehículos</button>
          <button onClick={() => setView('vehicle-categories')} className="w-full text-left p-2 rounded hover:bg-slate-800">Categorías Vehículos</button>
          <button onClick={() => setView('service-names')} className="w-full text-left p-2 rounded hover:bg-slate-800">Nombres de Servicios</button>
          <button onClick={() => setView('ranking')} className="w-full text-left p-2 rounded hover:bg-slate-800">Ranking</button>
          <button onClick={() => setView('period-manager')} className="w-full text-left p-2 rounded hover:bg-slate-800">Periodos</button>
          <button onClick={() => setView('settings')} className="w-full text-left p-2 rounded hover:bg-slate-800">Ajustes</button>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
