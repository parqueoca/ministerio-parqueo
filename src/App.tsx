import React, { useState, useEffect } from 'react';
import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';
import * as serverService from './services/serverService';

import Dashboard from './components/Dashboard';
import ServerForm from './components/ServerForm';
import ServiceCalendar from './components/ServiceCalendar';
import VehicleManager from './components/VehicleManager';
import VehicleCategoryManager from './components/VehicleCategoryManager';
import ServiceNameManager from './components/ServiceNameManager';
import RankingView from './components/RankingView';
import PeriodManager from './components/PeriodManager';
import ConfirmModal from './components/ConfirmModal';

import { LayoutDashboard, Users, Calendar, Car, Trophy, Settings } from 'lucide-react';
import { Server } from './types';

type ViewState = 
  | 'dashboard'
  | 'servers'
  | 'calendar'
  | 'vehicles'
  | 'vehicle-categories'
  | 'service-names'
  | 'ranking'
  | 'period-manager'
  | 'settings';

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

const App: React.FC = () => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(false);

  // Recupera sesión si existe
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);
  }, []);

  // Carga los servidores
  useEffect(() => {
    if (!accessLevel) return;
    setLoadingServers(true);
    serverService.getServers()
      .then(data => setServers(data))
      .finally(() => setLoadingServers(false));
  }, [accessLevel]);

  if (!accessLevel) {
    return <AccessGate onAccess={setAccessLevel} />;
  }

  // Menú lateral simple
  const renderMenu = () => (
    <div className="w-56 h-screen bg-slate-100 dark:bg-slate-900 p-4 flex flex-col gap-2">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        <LayoutDashboard size={18} /> Dashboard
      </button>
      <button onClick={() => setView('servers')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        <Users size={18} /> Servidores
      </button>
      <button onClick={() => setView('calendar')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        <Calendar size={18} /> Calendario
      </button>
      <button onClick={() => setView('vehicles')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        <Car size={18} /> Vehículos
      </button>
      <button onClick={() => setView('vehicle-categories')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        Categorías Veh.
      </button>
      <button onClick={() => setView('service-names')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        Nombres de Servicio
      </button>
      <button onClick={() => setView('ranking')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        <Trophy size={18} /> Ranking
      </button>
      <button onClick={() => setView('period-manager')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        Periodos
      </button>
      <button onClick={() => setView('settings')} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded">
        <Settings size={18} /> Ajustes
      </button>
    </div>
  );

  // Renderiza la vista activa
  const renderContent = () => {
    if (loadingServers) return <p className="p-10 text-center">Cargando servidores...</p>;

    switch(view) {
      case 'dashboard': return <Dashboard servers={servers} />;
      case 'servers': return <ServerForm servers={servers} />;
      case 'calendar': return <ServiceCalendar />;
      case 'vehicles': return <VehicleManager />;
      case 'vehicle-categories': return <VehicleCategoryManager />;
      case 'service-names': return <ServiceNameManager />;
      case 'ranking': return <RankingView />;
      case 'period-manager': return <PeriodManager />;
      case 'settings': return <ConfirmModal />;
      default: return <Dashboard servers={servers} />;
    }
  };

  return (
    <div className="flex h-screen">
      {renderMenu()}
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-800">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
