import React, { useState, useEffect } from 'react';
import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';
import { Server, Group, VehicleCategory, Vehicle, Service } from './types';

import * as serverService from './services/serverService';
import * as vehicleService from './services/vehicleService';
import * as serviceNameService from './services/serviceNameService';
import * as calendarService from './services/serviceCalendarService';

import Dashboard from './components/Dashboard';
import ServerForm from './components/ServerForm';
import VehicleManager from './components/VehicleManager';
import VehicleCategoryManager from './components/VehicleCategoryManager';
import ServiceCalendar from './components/ServiceCalendar';
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
   🚀 APP PRINCIPAL
====================================================== */
const App: React.FC = () => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Recupera sesión
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);

    // Carga inicial de datos
    serverService.getServers().then(setServers);
    vehicleService.getVehicles().then(setVehicles);
    vehicleService.getVehicleCategories().then(setVehicleCategories);
    calendarService.getServices().then(setServices);
    serverService.getGroups().then(setGroups);
  }, []);

  if (!accessLevel) {
    return <AccessGate onAccess={setAccessLevel} />;
  }

  // WRAPPERS FUNCIONALES
  const handleSaveServer = (server: Server) => {
    serverService.saveServer(server).then(() => serverService.getServers().then(setServers));
  };

  const handleAddCategory = async (name: string, description?: string) => {
    await vehicleService.addVehicleCategory({ nombre: name, descripcion: description, activo: true });
    const updated = await vehicleService.getVehicleCategories();
    setVehicleCategories(updated);
  };

  const handleUpdateCategory = async (id: string, name: string, description?: string) => {
    await vehicleService.updateVehicleCategory(id, { nombre: name, descripcion: description });
    const updated = await vehicleService.getVehicleCategories();
    setVehicleCategories(updated);
  };

  const handleDeleteCategory = async (id: string) => {
    await vehicleService.deleteVehicleCategory(id);
    const updated = await vehicleService.getVehicleCategories();
    setVehicleCategories(updated);
  };

  const handleAddVehicle = async (v: Vehicle) => {
    await vehicleService.addVehicle(v);
    const updated = await vehicleService.getVehicles();
    setVehicles(updated);
  };

  const handleEditVehicle = async (v: Vehicle) => {
    await vehicleService.updateVehicle(v);
    const updated = await vehicleService.getVehicles();
    setVehicles(updated);
  };

  const handleDeleteVehicle = async (id: string) => {
    await vehicleService.deleteVehicle(id);
    const updated = await vehicleService.getVehicles();
    setVehicles(updated);
  };

  const handleAddServiceName = async (name: string) => {
    await serviceNameService.addServiceName({ name });
  };

  const handleUpdateServiceName = async (id: string, name: string) => {
    await serviceNameService.updateServiceName(id, { name });
  };

  const handleDeleteServiceName = async (id: string) => {
    await serviceNameService.deleteServiceName(id);
  };

  return (
    <div className="p-6">
      <Dashboard servers={servers} />

      <ServerForm
        groups={groups}
        isSubmitting={false}
        onSave={handleSaveServer}
        onCancel={() => {}}
      />

      <VehicleCategoryManager
        categories={vehicleCategories}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
        onClose={() => {}}
      />

      <VehicleManager
        vehicles={vehicles}
        categories={vehicleCategories}
        onAdd={handleAddVehicle}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
      />

      <ServiceCalendar
        services={services}
        groups={groups}
        positions={[]}
        servers={servers}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />

      <ServiceNameManager
        names={[]}
        onAdd={handleAddServiceName}
        onUpdate={handleUpdateServiceName}
        onDelete={handleDeleteServiceName}
        onClose={() => {}}
      />

      <RankingView groups={groups} />
      <PeriodManager onClose={() => {}} />
      <ConfirmModal
        isOpen={false}
        title=""
        message=""
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    </div>
  );
};

export default App;
