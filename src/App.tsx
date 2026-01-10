import React, { useState, useEffect } from 'react';

import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';

import {
  Server,
  Vehicle,
  VehicleCategory,
  Service,
  Group,
  ServiceName
} from './types';

import * as serverService from './services/serverService';
import * as vehicleService from './services/vehicleService';
import * as calendarService from './services/serviceCalendarService';
import * as serviceNameService from './services/serviceNameService';

import Dashboard from './components/Dashboard';
import ServerForm from './components/ServerForm';
import ServiceCalendar from './components/ServiceCalendar';
import VehicleManager from './components/VehicleManager';
import VehicleCategoryManager from './components/VehicleCategoryManager';
import ServiceNameManager from './components/ServiceNameManager';
import RankingView from './components/RankingView';
import PeriodManager from './components/PeriodManager';
import ConfirmModal from './components/ConfirmModal';

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
   🚀 APP
====================================================== */
const App: React.FC = () => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);

  // Datos cargados
  const [servers, setServers] = useState<Server[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [serviceNames, setServiceNames] = useState<ServiceName[]>([]);

  // Recupera sesión si existe
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);
  }, []);

  // Carga de datos inicial
  useEffect(() => {
    const loadData = async () => {
      const s = await serverService.getServers();
      setServers(s);

      const v = await vehicleService.getVehicles();
      setVehicles(v);

      const vc = await vehicleService.getCategories();
      setVehicleCategories(vc);

      const cal = await calendarService.getServices();
      setServices(cal);

      const g = await serverService.getGroups();
      setGroups(g);

      const sn = await serviceNameService.getNames();
      setServiceNames(sn);
    };
    loadData();
  }, []);

  if (!accessLevel) {
    return <AccessGate onAccess={setAccessLevel} />;
  }

  return (
    <div className="min-h-screen p-5 bg-slate-50 dark:bg-slate-900">
      <h1 className="text-2xl font-black text-center mb-4">
        App cargada correctamente ✅
      </h1>
      <p className="text-sm text-center opacity-60 mb-6">
        Nivel de acceso: {accessLevel}
      </p>

      <Dashboard servers={servers} />

      {/* Aquí puedes agregar otros módulos según la navegación */}
      {/* <ServerForm servers={servers} /> */}
      {/* <ServiceCalendar services={services} groups={groups} positions={[]} servers={servers} /> */}
      {/* <VehicleManager vehicles={vehicles} categories={vehicleCategories} /> */}
      {/* <VehicleCategoryManager categories={vehicleCategories} /> */}
      {/* <ServiceNameManager names={serviceNames} /> */}
      {/* <RankingView groups={groups} /> */}
      {/* <PeriodManager /> */}
      {/* <ConfirmModal /> */}
    </div>
  );
};

export default App;
