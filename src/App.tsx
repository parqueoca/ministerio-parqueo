import React, { useState, useEffect } from 'react';
import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';
import { Server } from './types';

import * as serverService from './services/serverService';

import Dashboard from './components/Dashboard';

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
  const [loading, setLoading] = useState(false);

  // 🔁 Recupera sesión si existe
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);
  }, []);

  // 🔁 Carga los servidores una vez que se ingresa
  useEffect(() => {
    if (accessLevel) {
      setLoading(true);
      serverService.getServers()
        .then((data: Server[]) => setServers(data))
        .finally(() => setLoading(false));
    }
  }, [accessLevel]);

  // 🔐 BLOQUEO TOTAL SI NO HAY ACCESO
  if (!accessLevel) {
    return <AccessGate onAccess={setAccessLevel} />;
  }

  // 🔄 Mostrar cargando mientras traemos servidores
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Cargando servidores...
      </div>
    );
  }

  // ✅ APP PRINCIPAL
  return (
    <div className="p-6">
      <Dashboard servers={servers} />
    </div>
  );
};

export default App;
