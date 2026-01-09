import React, { useState, useEffect } from 'react';
import { validateAccessKey, AccessLevel } from './security/access';
import { getSessionAccess, setSessionAccess } from './security/session';

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

  // Recupera sesión
  useEffect(() => {
    const saved = getSessionAccess();
    if (saved) setAccessLevel(saved);
  }, []);

  // Si no hay acceso, muestra pantalla de login
  if (!accessLevel) {
    return <AccessGate onAccess={setAccessLevel} />;
  }

  // APP funcional mínima: muestra dashboard y nivel de acceso
  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-black">
        App cargada correctamente ✅
      </h1>
      <p className="mt-2 text-sm opacity-60">
        Nivel de acceso: {accessLevel}
      </p>

      <div className="mt-6 p-6 bg-slate-100 rounded-xl shadow-md">
        <h2 className="font-bold text-lg mb-2">Dashboard</h2>
        <p className="text-sm opacity-70">
          Aquí se mostrarán los servidores y estadísticas cuando se cargue la versión completa.
        </p>
      </div>
    </div>
  );
};

export default App;
