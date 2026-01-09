import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';

import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';

import {
  ViewState, Server, Group, Service,
  ParkingPosition, Vehicle, VehicleCategory, ServiceName
} from './types';

import * as serverService from './services/serverService';
import * as calendarService from './services/serviceCalendarService';
import * as vehicleService from './services/vehicleService';
import * as serviceNameService from './services/serviceNameService';

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
import VehicleCategoryManager from './components/VehicleCategoryManager';
import ServiceNameManager from './components/ServiceNameManager';
import RankingView from './components/RankingView';
import PeriodManager from './components/PeriodManager';
import ConfirmModal from './components/ConfirmModal';

import {
  Search, Settings, Plus, Sun, Moon, Users, MapPin,
  Trophy, Loader2, Calendar, LayoutDashboard, Car,
  ChevronRight, Filter, FileDown, Check, X, Tag, Type
} from 'lucide-react';

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

  // 🔁 Recupera sesión si existe
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);
  }, []);

  // 🔐 BLOQUEO TOTAL SI NO HAY ACCESO
  if (!accessLevel) {
    return <AccessGate onAccess={setAccessLevel} />;
  }

  /* ======================================================
     👉 DESDE AQUÍ HACIA ABAJO VA TU APP REAL
     👉 NO TOCA SEGURIDAD
  ====================================================== */

  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-black">
        App cargada correctamente ✅
      </h1>
      <p className="mt-2 text-sm opacity-60">
        Nivel de acceso: {accessLevel}
      </p>
    </div>
  );
};

export default App;
