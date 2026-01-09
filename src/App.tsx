import React, { useState, useEffect } from 'react';

import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';

import { Server } from './types';
import * as serverService from './services/serverService';

import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';

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
          onKeyDown={e => e.key === 'Enter' && submit()}
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
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔁 Recupera sesión si existe
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);
  }, []);

  // 🔁 Carga servidores cuando se tiene acceso
  useEffect(() => {
    if (!accessLevel) return;

    setLoading(true);
    serverService.getAllServers()
      .then(data => setServers(data))
      .finally(() => setLoading(false));
  }, [accessLevel]);

  // 🔐 BLOQUEO TOTAL SI NO HAY ACCESO
  if (!accessLevel) return <AccessGate onAccess={setAccessLevel} />;

  // ⏳ Mostrar loader mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      </div>
    );
  }

  // ✅ MOSTRAR DASHBOARD CUANDO HAY ACCESO Y SERVIDORES
  return <Dashboard servers={servers} />;
};

export default App;
